from rest_framework import serializers
from django.db.models import Avg, Count, Sum
from django.utils import timezone
from decimal import Decimal

from core.models import (
    Parent, Student, GradeRecord, AttendanceRecord, 
    FeeAccount, Payment, MessageThread, Message, 
    Consent, Subject, Term, ClassRoom
)
from auth_app.models import User


class UserBasicSerializer(serializers.ModelSerializer):
    """Basic user info for nested serialization"""
    full_name = serializers.SerializerMethodField()
    
    class Meta:
        model = User
        fields = ['id', 'first_name', 'last_name', 'email', 'phone_number', 'full_name']
        read_only_fields = ['id']
    
    def get_full_name(self, obj):
        return obj.get_full_name() or obj.username


class StudentBasicSerializer(serializers.ModelSerializer):
    """Basic student info for listings"""
    full_name = serializers.SerializerMethodField()
    current_class_name = serializers.CharField(source='current_class.name', read_only=True)
    age = serializers.ReadOnlyField()
    
    class Meta:
        model = Student
        fields = [
            'id', 'admission_number', 'first_name', 'last_name', 
            'full_name', 'current_class_name', 'date_of_birth', 'age',
            'gender', 'is_active'
        ]
        read_only_fields = ['id', 'admission_number']
    
    def get_full_name(self, obj):
        return obj.get_full_name()


class ParentProfileSerializer(serializers.ModelSerializer):
    """Parent profile with children list"""
    user = UserBasicSerializer(read_only=True)
    children = serializers.SerializerMethodField()
    children_count = serializers.SerializerMethodField()
    
    class Meta:
        model = Parent
        fields = [
            'id', 'user', 'address', 'occupation', 'emergency_contact',
            'relationship_to_student', 'is_primary_contact',
            'children', 'children_count', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']
    
    def get_children(self, obj):
        """Get all children with their consent status"""
        children = obj.children.filter(is_active=True)
        children_data = []
        
        for child in children:
            child_data = StudentBasicSerializer(child).data
            # Add consent info for each child
            consents = child.consents.filter(parent=obj)
            child_data['consents'] = {
                consent.consent_type: {
                    'granted': consent.is_granted,
                    'updated_at': consent.updated_at
                }
                for consent in consents
            }
            children_data.append(child_data)
        
        return children_data
    
    def get_children_count(self, obj):
        return obj.children.filter(is_active=True).count()


class SubjectGradeSerializer(serializers.ModelSerializer):
    """Grades grouped by subject"""
    subject_name = serializers.CharField(source='subject.name', read_only=True)
    subject_code = serializers.CharField(source='subject.code', read_only=True)
    teacher_name = serializers.CharField(source='teacher.get_full_name', read_only=True)
    percentage = serializers.ReadOnlyField()
    grade_letter = serializers.ReadOnlyField()
    
    class Meta:
        model = GradeRecord
        fields = [
            'id', 'subject_name', 'subject_code', 'assessment_type', 
            'assessment_name', 'total_marks', 'obtained_marks', 
            'percentage', 'grade_letter', 'assessment_date', 
            'teacher_name', 'comments'
        ]


class AttendanceRecordSerializer(serializers.ModelSerializer):
    """Attendance record"""
    subject_name = serializers.CharField(source='subject.name', read_only=True)
    recorded_by_name = serializers.CharField(source='recorded_by.get_full_name', read_only=True)
    
    class Meta:
        model = AttendanceRecord
        fields = [
            'id', 'date', 'status', 'subject_name', 'period',
            'recorded_by_name', 'notes', 'recorded_at'
        ]


class PaymentSerializer(serializers.ModelSerializer):
    """Payment record"""
    paid_by_name = serializers.CharField(source='paid_by.full_name', read_only=True)
    
    class Meta:
        model = Payment
        fields = [
            'id', 'payment_id', 'amount', 'payment_method', 
            'transaction_reference', 'mpesa_receipt', 'status',
            'paid_by_name', 'payment_date', 'notes'
        ]


class FeeAccountSerializer(serializers.ModelSerializer):
    """Fee account with payment history"""
    recent_payments = serializers.SerializerMethodField()
    payment_history_count = serializers.SerializerMethodField()
    is_fee_paid = serializers.ReadOnlyField()
    
    class Meta:
        model = FeeAccount
        fields = [
            'total_fee_due', 'total_paid', 'balance', 'is_fee_paid',
            'recent_payments', 'payment_history_count', 'updated_at'
        ]
    
    def get_recent_payments(self, obj):
        """Get last 5 payments"""
        recent_payments = obj.student.payments.filter(
            status='completed'
        ).order_by('-payment_date')[:5]
        return PaymentSerializer(recent_payments, many=True).data
    
    def get_payment_history_count(self, obj):
        return obj.student.payments.filter(status='completed').count()


class StudentSummarySerializer(serializers.ModelSerializer):
    """Complete student summary for parents"""
    full_name = serializers.SerializerMethodField()
    current_class_name = serializers.CharField(source='current_class.name', read_only=True)
    age = serializers.ReadOnlyField()
    
    # Academic performance
    recent_grades = serializers.SerializerMethodField()
    grade_summary = serializers.SerializerMethodField()
    
    # Attendance
    recent_attendance = serializers.SerializerMethodField()
    attendance_summary = serializers.SerializerMethodField()
    
    # Fees
    fee_account = serializers.SerializerMethodField()
    
    # Messages
    unread_messages_count = serializers.SerializerMethodField()
    
    class Meta:
        model = Student
        fields = [
            'id', 'admission_number', 'full_name', 'current_class_name', 
            'age', 'gender', 'recent_grades', 'grade_summary',
            'recent_attendance', 'attendance_summary', 'fee_account',
            'unread_messages_count', 'updated_at'
        ]
    
    def get_full_name(self, obj):
        return obj.get_full_name()
    
    def get_recent_grades(self, obj):
        """Get last 10 grades"""
        recent_grades = obj.grades.select_related(
            'subject', 'teacher', 'term'
        ).order_by('-assessment_date')[:10]
        return SubjectGradeSerializer(recent_grades, many=True).data
    
    def get_grade_summary(self, obj):
        """Get grade summary by subject for current term"""
        current_term = Term.objects.filter(is_current=True).first()
        if not current_term:
            return {}
        
        grades_by_subject = (
            obj.grades.filter(term=current_term)
            .values('subject__name', 'subject__code')
            .annotate(
            total_obtained=Sum('obtained_marks'),
            total_possible=Sum('total_marks'),
            total_assessments=Count('id'),
        )
        )

        
        summary = {}
        for grade_data in grades_by_subject:
            subject_name = grade_data['subject__name']
            obtained = grade_data['total_obtained'] or 0
            possible = grade_data['total_possible'] or 0
            average_percentage = (obtained / possible * 100) if possible else 0
    
            summary[subject_name] = {
                'code': grade_data['subject__code'],
                'average_percentage': round(average_percentage, 2),
                'total_assessments': grade_data['total_assessments'],
                'total_marks': obtained,
                'max_marks': possible
        }
        return summary
    
    def get_recent_attendance(self, obj):
        """Get last 30 days attendance"""
        thirty_days_ago = timezone.now().date() - timezone.timedelta(days=30)
        recent_attendance = obj.attendance.filter(
            date__gte=thirty_days_ago
        ).order_by('-date')[:30]
        return AttendanceRecordSerializer(recent_attendance, many=True).data
    
    def get_attendance_summary(self, obj):
        """Get attendance summary for current term"""
        current_term = Term.objects.filter(is_current=True).first()
        if not current_term:
            return {}
        
        attendance_records = obj.attendance.filter(
            date__range=[current_term.start_date, current_term.end_date]
        )
        
        total_days = attendance_records.count()
        if total_days == 0:
            return {
                'total_days': 0,
                'present': 0,
                'absent': 0,
                'late': 0,
                'excused': 0,
                'attendance_percentage': 0
            }
        
        status_counts = attendance_records.values('status').annotate(
            count=Count('id')
        )
        
        summary = {
            'total_days': total_days,
            'present': 0,
            'absent': 0, 
            'late': 0,
            'excused': 0
        }
        
        for status_data in status_counts:
            summary[status_data['status']] = status_data['count']
        
        # Calculate attendance percentage (present + late + excused = attended)
        attended = summary['present'] + summary['late'] + summary['excused']
        summary['attendance_percentage'] = round((attended / total_days) * 100, 2)
        
        return summary
    
    def get_fee_account(self, obj):
        """Get fee account information"""
        try:
            fee_account = obj.fee_account
            return FeeAccountSerializer(fee_account).data
        except FeeAccount.DoesNotExist:
            return {
                'total_fee_due': 0,
                'total_paid': 0,
                'balance': 0,
                'is_fee_paid': True,
                'recent_payments': [],
                'payment_history_count': 0
            }
    
    def get_unread_messages_count(self, obj):
        """Count unread messages for this student"""
        # Get parent from context (will be set in view)
        parent = self.context.get('parent')
        if not parent:
            return 0
        
        return Message.objects.filter(
            thread__student=obj,
            thread__participants=parent.user,
            is_read=False
        ).exclude(sender=parent.user).count()


class MessageThreadSerializer(serializers.ModelSerializer):
    """Message thread"""
    participants_info = serializers.SerializerMethodField()
    student_name = serializers.CharField(source='student.get_full_name', read_only=True)
    last_message = serializers.SerializerMethodField()
    unread_count = serializers.SerializerMethodField()
    
    class Meta:
        model = MessageThread
        fields = [
            'id', 'subject', 'student_name', 'participants_info',
            'last_message', 'unread_count', 'is_active', 
            'created_at', 'updated_at'
        ]
    
    def get_participants_info(self, obj):
        """Get info about all participants except current user"""
        current_user = self.context.get('request').user
        other_participants = obj.participants.exclude(id=current_user.id)
        return [
            {
                'id': user.id,
                'name': user.get_full_name() or user.username,
                'user_type': user.user_type
            }
            for user in other_participants
        ]
    
    def get_last_message(self, obj):
        last_msg = obj.messages.last()
        if last_msg:
            return {
                'id': last_msg.id,
                'sender_name': last_msg.sender.get_full_name() or last_msg.sender.username,
                'content': last_msg.content[:100] + '...' if len(last_msg.content) > 100 else last_msg.content,
                'created_at': last_msg.created_at,
                'is_read': last_msg.is_read
            }
        return None
    
    def get_unread_count(self, obj):
        """Count unread messages for current user"""
        current_user = self.context.get('request').user
        return obj.messages.filter(is_read=False).exclude(sender=current_user).count()


class MessageSerializer(serializers.ModelSerializer):
    """Individual message"""
    sender_name = serializers.CharField(source='sender.get_full_name', read_only=True)
    sender_type = serializers.CharField(source='sender.user_type', read_only=True)
    
    class Meta:
        model = Message
        fields = [
            'id', 'content', 'sender_name', 'sender_type', 
            'is_read', 'read_at', 'created_at'
        ]
        read_only_fields = ['id', 'sender_name', 'sender_type', 'created_at']


class MessageCreateSerializer(serializers.Serializer):
    """Create new message"""
    recipient_id = serializers.IntegerField()
    student_id = serializers.IntegerField(required=False, allow_null=True)
    subject = serializers.CharField(max_length=200)
    content = serializers.CharField(max_length=5000)
    
    def validate_recipient_id(self, value):
        """Validate recipient exists and is teacher/admin"""
        try:
            recipient = User.objects.get(id=value)
            if recipient.user_type not in ['teacher', 'admin']:
                raise serializers.ValidationError("Recipient must be a teacher or admin")
            return value
        except User.DoesNotExist:
            raise serializers.ValidationError("Recipient not found")
    
    def validate_student_id(self, value):
        """Validate student belongs to parent if provided"""
        if value:
            parent = self.context['request'].user.parent_profile
            if not parent.children.filter(id=value).exists():
                raise serializers.ValidationError("Student does not belong to you")
        return value


class FeePaymentSerializer(serializers.Serializer):
    """Fee payment serializer"""
    student_id = serializers.IntegerField()
    amount = serializers.DecimalField(max_digits=10, decimal_places=2, min_value=Decimal('0.01'))
    payment_method = serializers.ChoiceField(choices=Payment.PAYMENT_METHODS)
    transaction_reference = serializers.CharField(max_length=100, required=False, allow_blank=True)
    mpesa_receipt = serializers.CharField(max_length=20, required=False, allow_blank=True)
    notes = serializers.CharField(max_length=500, required=False, allow_blank=True)
    
    def validate_student_id(self, value):
        """Validate student belongs to parent"""
        parent = self.context['request'].user.parent_profile
        if not parent.children.filter(id=value).exists():
            raise serializers.ValidationError("Student does not belong to you")
        return value
    
    def validate_amount(self, value):
        """Validate amount is reasonable"""
        if value > Decimal('1000000.00'):  # 1 million limit
            raise serializers.ValidationError("Amount too large")
        return value
    
    def validate_mpesa_receipt(self, value):
        """Validate M-Pesa receipt format if provided"""
        if value and self.initial_data.get('payment_method') == 'mpesa':
            if len(value) < 8:
                raise serializers.ValidationError("Invalid M-Pesa receipt number")
        return value


class ConsentSerializer(serializers.ModelSerializer):
    """Consent management"""
    student_name = serializers.CharField(source='student.get_full_name', read_only=True)
    consent_type_display = serializers.CharField(source='get_consent_type_display', read_only=True)
    
    class Meta:
        model = Consent
        fields = [
            'id', 'student_name', 'consent_type', 'consent_type_display',
            'is_granted', 'granted_at', 'revoked_at', 'notes',
            'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'granted_at', 'revoked_at', 'created_at', 'updated_at']


class ConsentActionSerializer(serializers.Serializer):
    """Grant/Revoke consent"""
    student_id = serializers.IntegerField()
    consent_type = serializers.ChoiceField(choices=Consent.CONSENT_TYPES)
    action = serializers.ChoiceField(choices=[('grant', 'Grant'), ('revoke', 'Revoke')])
    notes = serializers.CharField(max_length=500, required=False, allow_blank=True)
    
    def validate_student_id(self, value):
        """Validate student belongs to parent"""
        parent = self.context['request'].user.parent_profile
        if not parent.children.filter(id=value).exists():
            raise serializers.ValidationError("Student does not belong to you")
        return value