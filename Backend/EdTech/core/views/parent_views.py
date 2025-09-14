from rest_framework import generics, status, permissions
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework.views import APIView
from django.shortcuts import get_object_or_404
from django.db.models import Q
from django.utils import timezone
from django.db import transaction
from django.contrib.auth import get_user_model

from core.models import (
    Parent, Student, GradeRecord, AttendanceRecord, 
    FeeAccount, Payment, MessageThread, Message, 
    Consent, Subject, Term
)
from core.serializers.parent_serializers import (
    ParentProfileSerializer, StudentSummarySerializer,
    MessageThreadSerializer, MessageSerializer, MessageCreateSerializer,
    FeePaymentSerializer, ConsentSerializer, ConsentActionSerializer
)
from core.permissions import IsParent, IsParentOfStudent
from core.tasks import send_payment_sms, send_message_notification 

User = get_user_model()


class ParentProfileView(generics.RetrieveUpdateAPIView):
    """
    Parent profile with children list
    """
    serializer_class = ParentProfileSerializer
    permission_classes = [permissions.IsAuthenticated, IsParent]
    
    def get_object(self):
        """Get current parent's profile"""
        try:
            return self.request.user.parent_profile
        except Parent.DoesNotExist:
            # Create parent profile if doesn't exist
            return Parent.objects.create(user=self.request.user)


class StudentSummaryView(generics.RetrieveAPIView):
    """
    Get complete student summary (grades, attendance, fees)
    """
    serializer_class = StudentSummarySerializer
    permission_classes = [permissions.IsAuthenticated, IsParent, IsParentOfStudent]
    queryset = Student.objects.filter(is_active=True)
    
    def get_serializer_context(self):
        """Add parent to context for unread message counting"""
        context = super().get_serializer_context()
        context['parent'] = self.request.user.parent_profile
        return context


class StudentGradesView(generics.ListAPIView):
    """
    Get detailed grades for a student with filtering options
    """
    permission_classes = [permissions.IsAuthenticated, IsParent, IsParentOfStudent]
    
    def get_queryset(self):
        student_id = self.kwargs['student_id']
        student = get_object_or_404(Student, id=student_id)
        
        queryset = student.grades.select_related(
            'subject', 'teacher', 'term'
        ).order_by('-assessment_date')
        
        # Filter by term if provided
        term_id = self.request.query_params.get('term_id')
        if term_id:
            queryset = queryset.filter(term_id=term_id)
        
        # Filter by subject if provided
        subject_id = self.request.query_params.get('subject_id')
        if subject_id:
            queryset = queryset.filter(subject_id=subject_id)
        
        # Filter by assessment type if provided
        assessment_type = self.request.query_params.get('assessment_type')
        if assessment_type:
            queryset = queryset.filter(assessment_type=assessment_type)
        
        return queryset
    
    def get_serializer_class(self):
        from core.serializers.parent_serializers import SubjectGradeSerializer
        return SubjectGradeSerializer


class StudentAttendanceView(generics.ListAPIView):
    """
    Get attendance records for a student
    """
    permission_classes = [permissions.IsAuthenticated, IsParent, IsParentOfStudent]
    
    def get_queryset(self):
        student_id = self.kwargs['student_id']
        student = get_object_or_404(Student, id=student_id)
        
        queryset = student.attendance.select_related(
            'subject', 'recorded_by'
        ).order_by('-date')
        
        # Filter by date range if provided
        start_date = self.request.query_params.get('start_date')
        end_date = self.request.query_params.get('end_date')
        
        if start_date:
            queryset = queryset.filter(date__gte=start_date)
        if end_date:
            queryset = queryset.filter(date__lte=end_date)
        
        # Filter by status if provided
        status_filter = self.request.query_params.get('status')
        if status_filter:
            queryset = queryset.filter(status=status_filter)
        
        return queryset
    
    def get_serializer_class(self):
        from core.serializers.parent_serializers import AttendanceRecordSerializer
        return AttendanceRecordSerializer


class MessageThreadListView(generics.ListAPIView):
    """
    List all message threads for parent
    """
    serializer_class = MessageThreadSerializer
    permission_classes = [permissions.IsAuthenticated, IsParent]
    
    def get_queryset(self):
        parent = self.request.user.parent_profile
        return MessageThread.objects.filter(
            participants=self.request.user,
            is_active=True
        ).select_related('student').prefetch_related(
            'participants', 'messages'
        ).order_by('-updated_at')


class MessageThreadDetailView(generics.RetrieveAPIView):
    """
    Get specific message thread with all messages
    """
    permission_classes = [permissions.IsAuthenticated, IsParent]
    
    def get_object(self):
        thread_id = self.kwargs['pk']
        thread = get_object_or_404(
            MessageThread, 
            id=thread_id,
            participants=self.request.user,
            is_active=True
        )
        
        # Mark messages as read for current user
        thread.messages.filter(is_read=False).exclude(
            sender=self.request.user
        ).update(is_read=True, read_at=timezone.now())
        
        return thread
    
    def get(self, request, *args, **kwargs):
        thread = self.get_object()
        
        # Get thread info
        thread_serializer = MessageThreadSerializer(thread, context={'request': request})
        
        # Get all messages in thread
        messages = thread.messages.select_related('sender').order_by('created_at')
        messages_serializer = MessageSerializer(messages, many=True)
        
        return Response({
            'thread': thread_serializer.data,
            'messages': messages_serializer.data
        })


class MessageCreateView(APIView):
    """
    Create new message or reply to existing thread
    """
    permission_classes = [permissions.IsAuthenticated, IsParent]
    
    def post(self, request):
        serializer = MessageCreateSerializer(data=request.data, context={'request': request})
        
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        
        data = serializer.validated_data
        parent = request.user.parent_profile
        recipient = get_object_or_404(User, id=data['recipient_id'])
        student = None
        
        if data.get('student_id'):
            student = get_object_or_404(Student, id=data['student_id'])
        
        with transaction.atomic():
            # Find or create message thread
            thread_participants = [request.user, recipient]
            
            # Try to find existing thread
            thread = MessageThread.objects.filter(
                participants__in=thread_participants,
                student=student
            ).distinct()
            
            # Filter to threads that have exactly these participants
            for t in thread:
                if set(t.participants.all()) == set(thread_participants):
                    thread = t
                    break
            else:
                # Create new thread
                thread = MessageThread.objects.create(
                    subject=data['subject'],
                    student=student
                )
                thread.participants.set(thread_participants)
            
            # Create message
            message = Message.objects.create(
                thread=thread,
                sender=request.user,
                content=data['content']
            )
            
            # Update thread timestamp
            thread.updated_at = timezone.now()
            thread.save()
        
        # # Send notification asynchronously
        # send_message_notification.delay(message.id, recipient.id)
        # Send notification synchronously
        send_message_notification(message.id, recipient.id)
        
        # Return created message
        message_serializer = MessageSerializer(message)
        return Response({
            'message': 'Message sent successfully',
            'data': message_serializer.data
        }, status=status.HTTP_201_CREATED)


class FeePaymentView(APIView):
    """
    Record fee payment
    """
    permission_classes = [permissions.IsAuthenticated, IsParent]
    
    def post(self, request):
        serializer = FeePaymentSerializer(data=request.data, context={'request': request})
        
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        
        data = serializer.validated_data
        parent = request.user.parent_profile
        student = get_object_or_404(Student, id=data['student_id'])
        
        with transaction.atomic():
            # Create payment record
            payment = Payment.objects.create(
                student=student,
                amount=data['amount'],
                payment_method=data['payment_method'],
                transaction_reference=data.get('transaction_reference', ''),
                mpesa_receipt=data.get('mpesa_receipt', ''),
                paid_by=parent,
                notes=data.get('notes', ''),
                status='completed'  
            )
            
            # Update or create fee account
            fee_account, created = FeeAccount.objects.get_or_create(student=student)
            if created:
                fee_account.total_fee_due = data['amount']  # Set initial fee if new account
            
            fee_account.total_paid += data['amount']
            fee_account.update_balance()
        
        # # Send SMS confirmation asynchronously
        # send_payment_sms.delay(payment.id, str(parent.user.phone_number))
        
         # call it synchronously
        send_payment_sms(payment.id, str(parent.user.phone_number))
        # Return payment details
        from core.serializers.parent_serializers import PaymentSerializer
        payment_serializer = PaymentSerializer(payment)
        
        return Response({
            'message': 'Payment recorded successfully',
            'payment': payment_serializer.data,
            'new_balance': fee_account.balance
        }, status=status.HTTP_201_CREATED)


class StudentPaymentHistoryView(generics.ListAPIView):
    """
    Get payment history for a student
    """
    permission_classes = [permissions.IsAuthenticated, IsParent, IsParentOfStudent]
    
    def get_queryset(self):
        student_id = self.kwargs['student_id']
        student = get_object_or_404(Student, id=student_id)
        
        return student.payments.select_related(
            'paid_by__user'
        ).order_by('-payment_date')
    
    def get_serializer_class(self):
        from core.serializers.parent_serializers import PaymentSerializer
        return PaymentSerializer


class ConsentListView(generics.ListAPIView):
    """
    List all consent records for parent's children
    """
    serializer_class = ConsentSerializer
    permission_classes = [permissions.IsAuthenticated, IsParent]
    
    def get_queryset(self):
        parent = self.request.user.parent_profile
        return Consent.objects.filter(
            parent=parent,
            student__in=parent.children.all()
        ).select_related('student').order_by('-updated_at')


class ConsentActionView(APIView):
    """
    Grant or revoke consent
    """
    permission_classes = [permissions.IsAuthenticated, IsParent]
    
    def post(self, request):
        serializer = ConsentActionSerializer(data=request.data, context={'request': request})
        
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        
        data = serializer.validated_data
        parent = request.user.parent_profile
        student = get_object_or_404(Student, id=data['student_id'])
        
        # Get or create consent record
        consent, created = Consent.objects.get_or_create(
            student=student,
            parent=parent,
            consent_type=data['consent_type'],
            defaults={'notes': data.get('notes', '')}
        )
        
        # Update consent based on action
        if data['action'] == 'grant':
            consent.grant_consent()
            message = f"Consent granted for {consent.get_consent_type_display()}"
        else:
            consent.revoke_consent()
            message = f"Consent revoked for {consent.get_consent_type_display()}"
        
        # Update notes if provided
        if data.get('notes'):
            consent.notes = data['notes']
            consent.save()
        
        consent_serializer = ConsentSerializer(consent)
        
        return Response({
            'message': message,
            'consent': consent_serializer.data
        }, status=status.HTTP_200_OK)


class ParentDashboardView(APIView):
    """
    Parent dashboard with summary of all children
    """
    permission_classes = [permissions.IsAuthenticated, IsParent]
    
    def get(self, request):
        parent = request.user.parent_profile
        children = parent.children.filter(is_active=True)
        
        dashboard_data = {
            'parent_info': ParentProfileSerializer(parent).data,
            'children_summary': [],
            'recent_activities': [],
            'unread_messages': 0
        }
        
        total_unread = 0
        
        for child in children:
            # Get basic child info
            child_summary = {
                'student': {
                    'id': child.id,
                    'name': child.get_full_name(),
                    'class': child.current_class.name if child.current_class else None,
                    'admission_number': child.admission_number
                },
                'recent_grade': None,
                'attendance_percentage': 0,
                'fee_balance': 0,
                'unread_messages': 0
            }
            
            # Get most recent grade
            recent_grade = child.grades.select_related('subject').first()
            if recent_grade:
                child_summary['recent_grade'] = {
                    'subject': recent_grade.subject.name,
                    'percentage': recent_grade.percentage,
                    'date': recent_grade.assessment_date
                }
            
            # Get attendance percentage (last 30 days)
            thirty_days_ago = timezone.now().date() - timezone.timedelta(days=30)
            recent_attendance = child.attendance.filter(date__gte=thirty_days_ago)
            if recent_attendance.exists():
                total_days = recent_attendance.count()
                present_days = recent_attendance.filter(
                    status__in=['present', 'late']
                ).count()
                child_summary['attendance_percentage'] = round((present_days / total_days) * 100, 1)
            
            # Get fee balance
            try:
                fee_account = child.fee_account
                child_summary['fee_balance'] = float(fee_account.balance)
            except FeeAccount.DoesNotExist:
                pass
            
            # Count unread messages
            unread_count = Message.objects.filter(
                thread__student=child,
                thread__participants=request.user,
                is_read=False
            ).exclude(sender=request.user).count()
            
            child_summary['unread_messages'] = unread_count
            total_unread += unread_count
            
            dashboard_data['children_summary'].append(child_summary)
        
        dashboard_data['unread_messages'] = total_unread
        
        # Get recent activities across all children
        recent_payments = Payment.objects.filter(
            student__in=children,
            paid_by=parent
        ).select_related('student').order_by('-payment_date')[:5]
        
        recent_grades = GradeRecord.objects.filter(
            student__in=children
        ).select_related('student', 'subject').order_by('-recorded_at')[:5]
        
        activities = []
        
        # Add payments to activities
        for payment in recent_payments:
            activities.append({
                'type': 'payment',
                'student_name': payment.student.get_full_name(),
                'description': f"Payment of {payment.amount} via {payment.get_payment_method_display()}",
                'date': payment.payment_date,
                'amount': float(payment.amount)
            })
        
        # Add grades to activities
        for grade in recent_grades:
            activities.append({
                'type': 'grade',
                'student_name': grade.student.get_full_name(),
                'description': f"{grade.subject.name}: {grade.percentage}% ({grade.assessment_name})",
                'date': grade.recorded_at,
                'percentage': grade.percentage
            })
        
        # Sort activities by date
        activities.sort(key=lambda x: x['date'], reverse=True)
        dashboard_data['recent_activities'] = activities[:10]
        
        return Response(dashboard_data)


# Utility view for getting available terms/subjects for filtering
class FilterOptionsView(APIView):
    """
    Get available terms and subjects for filtering
    """
    permission_classes = [permissions.IsAuthenticated, IsParent]
    
    def get(self, request):
        parent = request.user.parent_profile
        children_ids = parent.children.values_list('id', flat=True)
        
        # Get terms where children have grades
        terms = Term.objects.filter(
            grades__student_id__in=children_ids
        ).distinct().order_by('-start_date')
        
        # Get subjects where children have grades
        subjects = Subject.objects.filter(
            grades__student_id__in=children_ids
        ).distinct().order_by('name')
        
        return Response({
            'terms': [
                {
                    'id': term.id,
                    'name': str(term),
                    'is_current': term.is_current
                }
                for term in terms
            ],
            'subjects': [
                {
                    'id': subject.id,
                    'name': subject.name,
                    'code': subject.code
                }
                for subject in subjects
            ],
            'assessment_types': [
                {'value': choice[0], 'label': choice[1]}
                for choice in GradeRecord.ASSESSMENT_TYPES
            ],
            'attendance_statuses': [
                {'value': choice[0], 'label': choice[1]}
                for choice in AttendanceRecord.STATUS_CHOICES
            ]
        })