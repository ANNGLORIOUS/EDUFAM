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

# Parent profile with children list
class ParentProfileView(generics.RetrieveUpdateAPIView):
    serializer_class = ParentProfileSerializer
    permission_classes = [permissions.IsAuthenticated, IsParent]
    
    def get_object(self):
        try:
            return self.request.user.parent_profile
        except Parent.DoesNotExist:
            
            return Parent.objects.create(user=self.request.user)

# Student summary for parents
class StudentSummaryView(generics.RetrieveAPIView):
    serializer_class = StudentSummarySerializer
    permission_classes = [permissions.IsAuthenticated, IsParent, IsParentOfStudent]
    queryset = Student.objects.filter(is_active=True)
    
    def get_serializer_context(self):
        context = super().get_serializer_context()
        context['parent'] = self.request.user.parent_profile
        return context

# Student grades with filtering
class StudentGradesView(generics.ListAPIView):
    permission_classes = [permissions.IsAuthenticated, IsParent, IsParentOfStudent]
    
    def get_queryset(self):
        student_id = self.kwargs['student_id']
        student = get_object_or_404(Student, id=student_id)
        
        queryset = student.grades.select_related(
            'subject', 'teacher', 'term'
        ).order_by('-assessment_date')
        
        term_id = self.request.query_params.get('term_id')
        if term_id:
            queryset = queryset.filter(term_id=term_id)
        
        subject_id = self.request.query_params.get('subject_id')
        if subject_id:
            queryset = queryset.filter(subject_id=subject_id)
        
        assessment_type = self.request.query_params.get('assessment_type')
        if assessment_type:
            queryset = queryset.filter(assessment_type=assessment_type)
        
        return queryset
    
    def get_serializer_class(self):
        from core.serializers.parent_serializers import SubjectGradeSerializer
        return SubjectGradeSerializer

# Student attendance with filtering
class StudentAttendanceView(generics.ListAPIView):
    
    permission_classes = [permissions.IsAuthenticated, IsParent, IsParentOfStudent]
    
    def get_queryset(self):
        student_id = self.kwargs['student_id']
        student = get_object_or_404(Student, id=student_id)
        
        queryset = student.attendance.select_related(
            'subject', 'recorded_by'
        ).order_by('-date')
        
        start_date = self.request.query_params.get('start_date')
        end_date = self.request.query_params.get('end_date')
        
        if start_date:
            queryset = queryset.filter(date__gte=start_date)
        if end_date:
            queryset = queryset.filter(date__lte=end_date)
        
        status_filter = self.request.query_params.get('status')
        if status_filter:
            queryset = queryset.filter(status=status_filter)
        
        return queryset
    
    def get_serializer_class(self):
        from core.serializers.parent_serializers import AttendanceRecordSerializer
        return AttendanceRecordSerializer

# Messaging Views
class MessageThreadListView(generics.ListAPIView):
    
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

# Message thread  view
class MessageThreadDetailView(generics.RetrieveAPIView):
   
    permission_classes = [permissions.IsAuthenticated, IsParent]
    
    def get_object(self):
        thread_id = self.kwargs['pk']
        thread = get_object_or_404(
            MessageThread, 
            id=thread_id,
            participants=self.request.user,
            is_active=True
        )
        
        thread.messages.filter(is_read=False).exclude(
            sender=self.request.user
        ).update(is_read=True, read_at=timezone.now())
        
        return thread
    
    def get(self, request, *args, **kwargs):
        thread = self.get_object()
        
        thread_serializer = MessageThreadSerializer(thread, context={'request': request})
        
        messages = thread.messages.select_related('sender').order_by('created_at')
        messages_serializer = MessageSerializer(messages, many=True)
        
        return Response({
            'thread': thread_serializer.data,
            'messages': messages_serializer.data
        })

# Message creation view
class MessageCreateView(APIView):
    
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
            
            thread_participants = [request.user, recipient]
            
            thread = MessageThread.objects.filter(
                participants__in=thread_participants,
                student=student
            ).distinct()
            
            for t in thread:
                if set(t.participants.all()) == set(thread_participants):
                    thread = t
                    break
            else:
                thread = MessageThread.objects.create(
                    subject=data['subject'],
                    student=student
                )
                thread.participants.set(thread_participants)
            
            message = Message.objects.create(
                thread=thread,
                sender=request.user,
                content=data['content']
            )
            
            thread.updated_at = timezone.now()
            thread.save()
        
        # # Send notification asynchronously
        # send_message_notification.delay(message.id, recipient.id)
        # Send notification synchronously
        send_message_notification(message.id, recipient.id)
        
        message_serializer = MessageSerializer(message)
        return Response({
            'message': 'Message sent successfully',
            'data': message_serializer.data
        }, status=status.HTTP_201_CREATED)

# Fee payment view
class FeePaymentView(APIView):
    
    permission_classes = [permissions.IsAuthenticated, IsParent]
    
    def post(self, request):
        serializer = FeePaymentSerializer(data=request.data, context={'request': request})
        
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        
        data = serializer.validated_data
        parent = request.user.parent_profile
        student = get_object_or_404(Student, id=data['student_id'])
        
        with transaction.atomic():
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
            
            fee_account, created = FeeAccount.objects.get_or_create(student=student)
            if created:
                fee_account.total_fee_due = data['amount']  # Set initial fee if new account
            
            fee_account.total_paid += data['amount']
            fee_account.update_balance()
        
        # # Send SMS confirmation asynchronously
        # send_payment_sms.delay(payment.id, str(parent.user.phone_number))
        
         # call it synchronously
        send_payment_sms(payment.id, str(parent.user.phone_number))
        from core.serializers.parent_serializers import PaymentSerializer
        payment_serializer = PaymentSerializer(payment)
        
        return Response({
            'message': 'Payment recorded successfully',
            'payment': payment_serializer.data,
            'new_balance': fee_account.balance
        }, status=status.HTTP_201_CREATED)

# Student payment history view
class StudentPaymentHistoryView(generics.ListAPIView):
    
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

# Consent management views
class ConsentListView(generics.ListAPIView):
    
    serializer_class = ConsentSerializer
    permission_classes = [permissions.IsAuthenticated, IsParent]
    
    def get_queryset(self):
        parent = self.request.user.parent_profile
        return Consent.objects.filter(
            parent=parent,
            student__in=parent.children.all()
        ).select_related('student').order_by('-updated_at')

# Consent action view
class ConsentActionView(APIView):
    
    permission_classes = [permissions.IsAuthenticated, IsParent]
    
    def post(self, request):
        serializer = ConsentActionSerializer(data=request.data, context={'request': request})
        
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        
        data = serializer.validated_data
        parent = request.user.parent_profile
        student = get_object_or_404(Student, id=data['student_id'])
        
        consent, created = Consent.objects.get_or_create(
            student=student,
            parent=parent,
            consent_type=data['consent_type'],
            defaults={'notes': data.get('notes', '')}
        )
        
        if data['action'] == 'grant':
            consent.grant_consent()
            message = f"Consent granted for {consent.get_consent_type_display()}"
        else:
            consent.revoke_consent()
            message = f"Consent revoked for {consent.get_consent_type_display()}"
        
        if data.get('notes'):
            consent.notes = data['notes']
            consent.save()
        
        consent_serializer = ConsentSerializer(consent)
        
        return Response({
            'message': message,
            'consent': consent_serializer.data
        }, status=status.HTTP_200_OK)

# Parent dashboard view
class ParentDashboardView(APIView):
    
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
            
            recent_grade = child.grades.select_related('subject').first()
            if recent_grade:
                child_summary['recent_grade'] = {
                    'subject': recent_grade.subject.name,
                    'percentage': recent_grade.percentage,
                    'date': recent_grade.assessment_date
                }
            
            thirty_days_ago = timezone.now().date() - timezone.timedelta(days=30)
            recent_attendance = child.attendance.filter(date__gte=thirty_days_ago)
            if recent_attendance.exists():
                total_days = recent_attendance.count()
                present_days = recent_attendance.filter(
                    status__in=['present', 'late']
                ).count()
                child_summary['attendance_percentage'] = round((present_days / total_days) * 100, 1)
            
            try:
                fee_account = child.fee_account
                child_summary['fee_balance'] = float(fee_account.balance)
            except FeeAccount.DoesNotExist:
                pass
            
            unread_count = Message.objects.filter(
                thread__student=child,
                thread__participants=request.user,
                is_read=False
            ).exclude(sender=request.user).count()
            
            child_summary['unread_messages'] = unread_count
            total_unread += unread_count
            
            dashboard_data['children_summary'].append(child_summary)
        
        dashboard_data['unread_messages'] = total_unread
        
        recent_payments = Payment.objects.filter(
            student__in=children,
            paid_by=parent
        ).select_related('student').order_by('-payment_date')[:5]
        
        recent_grades = GradeRecord.objects.filter(
            student__in=children
        ).select_related('student', 'subject').order_by('-recorded_at')[:5]
        
        activities = []
        
        for payment in recent_payments:
            activities.append({
                'type': 'payment',
                'student_name': payment.student.get_full_name(),
                'description': f"Payment of {payment.amount} via {payment.get_payment_method_display()}",
                'date': payment.payment_date,
                'amount': float(payment.amount)
            })
        
        for grade in recent_grades:
            activities.append({
                'type': 'grade',
                'student_name': grade.student.get_full_name(),
                'description': f"{grade.subject.name}: {grade.percentage}% ({grade.assessment_name})",
                'date': grade.recorded_at,
                'percentage': grade.percentage
            })
        
        activities.sort(key=lambda x: x['date'], reverse=True)
        dashboard_data['recent_activities'] = activities[:10]
        
        return Response(dashboard_data)


# Utility view for getting available terms/subjects for filtering
class FilterOptionsView(APIView):
   
    permission_classes = [permissions.IsAuthenticated, IsParent]
    
    def get(self, request):
        parent = request.user.parent_profile
        children_ids = parent.children.values_list('id', flat=True)
        
        terms = Term.objects.filter(
            grades__student_id__in=children_ids
        ).distinct().order_by('-start_date')
        
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