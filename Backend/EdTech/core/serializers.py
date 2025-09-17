from rest_framework import serializers
from django.db.models import Avg, Count, Sum
from django.utils import timezone
from datetime import timedelta

from decimal import Decimal

from .models import (
    User ,OTP,Parent, Student, FeeAccount, Payment, MessageThread, Message, 
    Consent
)
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from django.contrib.auth.password_validation import validate_password
from phonenumber_field.serializerfields import PhoneNumberField
from django.contrib.auth import authenticate


# User Serializer

class MyTokenObtainPairSerializer(TokenObtainPairSerializer):
    def validate(self, attrs):
        data = super().validate(attrs)
        data.update({
            'user_id': self.user.id,
            'username': self.user.username,
            'email': self.user.email,
        })
        return data


class UserRegistrationSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, validators=[validate_password])
    password_confirm = serializers.CharField(write_only=True)
    
    class Meta:
        model = User
        fields = ('username', 'email', 'password', 'password_confirm', 
                 'first_name', 'last_name', 'phone_number', 'user_type', 'preferred_language')
    
    def validate(self, attrs):
        if attrs['password'] != attrs['password_confirm']:
            raise serializers.ValidationError("Passwords don't match")
        return attrs
    
    def create(self, validated_data):
        validated_data.pop('password_confirm')
        password = validated_data.pop('password')
        user = User.objects.create_user(**validated_data)
        user.set_password(password)
        user.save()
        return user

class OTPRequestSerializer(serializers.Serializer):
    phone_number = PhoneNumberField(required=False)
    email = serializers.EmailField(required=False)
    otp_type = serializers.ChoiceField(choices=OTP.OTP_TYPE, default='login')
    
    def validate(self, attrs):
        if not attrs.get('phone_number') and not attrs.get('email'):
            raise serializers.ValidationError("Either phone_number or email is required")
        return attrs

class OTPVerifySerializer(serializers.Serializer):
    phone_number = serializers.CharField(required=False)
    email = serializers.EmailField(required=False)
    code = serializers.CharField(required=True, max_length=6)

    def validate(self, attrs):
        phone = attrs.get("phone_number")
        email = attrs.get("email")
        code = attrs.get("code")

        if not phone and not email:
            raise serializers.ValidationError("Either phone_number or email is required.")

        # Match OTP by code + contact
        try:
            otp = OTP.objects.get(
                code=code,
                is_used=False,
                phone_number=phone if phone else None,
                email=email if email else None,
            )
        except OTP.DoesNotExist:
            raise serializers.ValidationError("Invalid or expired OTP.")

        # Check expiry
        if otp.is_expired():
            raise serializers.ValidationError("OTP expired.")

        # Throttling check: prevent too many attempts in 1 min
        recent_attempts = OTP.objects.filter(
            phone_number=phone, email=email, created_at__gte=timezone.now() - timedelta(minutes=1)
        )
        if recent_attempts.count() > 5:  # adjust limit as needed
            raise serializers.ValidationError("Too many OTP attempts. Please wait before retrying.")

        # Attach OTP to serializer for use in view
        attrs["otp_instance"] = otp
        return attrs


class GoogleAuthSerializer(serializers.Serializer):
    token = serializers.CharField()


class PasswordChangeSerializer(serializers.Serializer):
    old_password = serializers.CharField(required=True)
    new_password = serializers.CharField(required=True, validators=[validate_password])
    new_password_confirm = serializers.CharField(required=True)
    
    def validate(self, attrs):
        if attrs['new_password'] != attrs['new_password_confirm']:
            raise serializers.ValidationError("New passwords don't match")
        return attrs
    
    def validate_old_password(self, value):
        user = self.context['request'].user
        if not user.check_password(value):
            raise serializers.ValidationError("Old password is incorrect")
        return value

class PasswordResetRequestSerializer(serializers.Serializer):
    email = serializers.EmailField(required=True)
    
    def validate(self, attrs):
        email = attrs.get("email")
        if not email:
            raise serializers.ValidationError("Email is required")
        
        if not User.objects.filter(email=email).exists():
            pass
        
        return attrs


class PasswordResetConfirmSerializer(serializers.Serializer):
    token = serializers.CharField(required=True)
    new_password = serializers.CharField(required=True, validators=[validate_password])
    new_password_confirm = serializers.CharField(required=True)

    def validate(self, attrs):
        if attrs['new_password'] != attrs['new_password_confirm']:
            raise serializers.ValidationError("Passwords don't match")
        return attrs

class UserBasicSerializer(serializers.ModelSerializer):
    full_name = serializers.SerializerMethodField()
    
    class Meta:
        model = User
        fields = ['id', 'first_name', 'last_name', 'email', 'phone_number', 'full_name']
        read_only_fields = ['id']
    
    def get_full_name(self, obj):
        return obj.get_full_name() or obj.username

# Student Serializer
class StudentBasicSerializer(serializers.ModelSerializer):
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

# Parent Serializer
class ParentProfileSerializer(serializers.ModelSerializer):
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

# # Subject Grade Serializer
# class SubjectGradeSerializer(serializers.ModelSerializer):
#     subject_name = serializers.CharField(source='subject.name', read_only=True)
#     subject_code = serializers.CharField(source='subject.code', read_only=True)
#     teacher_name = serializers.CharField(source='teacher.get_full_name', read_only=True)
#     percentage = serializers.ReadOnlyField()
#     grade_letter = serializers.ReadOnlyField()
    
#     class Meta:
#         model = GradeRecord
#         fields = [
#             'id', 'subject_name', 'subject_code', 'assessment_type', 
#             'assessment_name', 'total_marks', 'obtained_marks', 
#             'percentage', 'grade_letter', 'assessment_date', 
#             'teacher_name', 'comments'
#         ]

# # Attendance Serializer
# class AttendanceRecordSerializer(serializers.ModelSerializer):
#     subject_name = serializers.CharField(source='subject.name', read_only=True)
#     recorded_by_name = serializers.CharField(source='recorded_by.get_full_name', read_only=True)
    
#     class Meta:
#         model = AttendanceRecord
#         fields = [
#             'id', 'date', 'status', 'subject_name', 'period',
#             'recorded_by_name', 'notes', 'recorded_at'
#         ]

# Payment Serializer
class PaymentSerializer(serializers.ModelSerializer):
    paid_by_name = serializers.CharField(source='paid_by.full_name', read_only=True)
    
    class Meta:
        model = Payment
        fields = [
            'id', 'payment_id', 'amount', 'payment_method', 
            'transaction_reference', 'mpesa_receipt', 'status',
            'paid_by_name', 'payment_date', 'notes'
        ]

# Fee Account Serializer
class FeeAccountSerializer(serializers.ModelSerializer):
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

# # Student Summary Serializer
# class StudentSummarySerializer(serializers.ModelSerializer):
#     full_name = serializers.SerializerMethodField()
#     current_class_name = serializers.CharField(source='current_class.name', read_only=True)
#     age = serializers.ReadOnlyField()
    
#     recent_grades = serializers.SerializerMethodField()
#     grade_summary = serializers.SerializerMethodField()
    
#     recent_attendance = serializers.SerializerMethodField()
#     attendance_summary = serializers.SerializerMethodField()
    
#     fee_account = serializers.SerializerMethodField()
    
#     unread_messages_count = serializers.SerializerMethodField()
    
#     class Meta:
#         model = Student
#         fields = [
#             'id', 'admission_number', 'full_name', 'current_class_name', 
#             'age', 'gender', 'recent_grades', 'grade_summary',
#             'recent_attendance', 'attendance_summary', 'fee_account',
#             'unread_messages_count', 'updated_at'
#         ]
    
#     def get_full_name(self, obj):
#         return obj.get_full_name()
    
#     def get_recent_grades(self, obj):
#         recent_grades = obj.grades.select_related(
#             'subject', 'teacher', 'term'
#         ).order_by('-assessment_date')[:10]
#         return SubjectGradeSerializer(recent_grades, many=True).data
    
#     def get_grade_summary(self, obj):
#         current_term = Term.objects.filter(is_current=True).first()
#         if not current_term:
#             return {}
        
#         grades_by_subject = (
#             obj.grades.filter(term=current_term)
#             .values('subject__name', 'subject__code')
#             .annotate(
#             total_obtained=Sum('obtained_marks'),
#             total_possible=Sum('total_marks'),
#             total_assessments=Count('id'),
#         )
#         )

        
#         summary = {}
#         for grade_data in grades_by_subject:
#             subject_name = grade_data['subject__name']
#             obtained = grade_data['total_obtained'] or 0
#             possible = grade_data['total_possible'] or 0
#             average_percentage = (obtained / possible * 100) if possible else 0
    
#             summary[subject_name] = {
#                 'code': grade_data['subject__code'],
#                 'average_percentage': round(average_percentage, 2),
#                 'total_assessments': grade_data['total_assessments'],
#                 'total_marks': obtained,
#                 'max_marks': possible
#         }
#         return summary
    
#     def get_recent_attendance(self, obj):
#         thirty_days_ago = timezone.now().date() - timezone.timedelta(days=30)
#         recent_attendance = obj.attendance.filter(
#             date__gte=thirty_days_ago
#         ).order_by('-date')[:30]
#         return AttendanceRecordSerializer(recent_attendance, many=True).data
    
#     def get_attendance_summary(self, obj):
#         current_term = Term.objects.filter(is_current=True).first()
#         if not current_term:
#             return {}
        
#         attendance_records = obj.attendance.filter(
#             date__range=[current_term.start_date, current_term.end_date]
#         )
        
#         total_days = attendance_records.count()
#         if total_days == 0:
#             return {
#                 'total_days': 0,
#                 'present': 0,
#                 'absent': 0,
#                 'late': 0,
#                 'excused': 0,
#                 'attendance_percentage': 0
#             }
        
#         status_counts = attendance_records.values('status').annotate(
#             count=Count('id')
#         )
        
#         summary = {
#             'total_days': total_days,
#             'present': 0,
#             'absent': 0, 
#             'late': 0,
#             'excused': 0
#         }
        
#         for status_data in status_counts:
#             summary[status_data['status']] = status_data['count']
        
#         attended = summary['present'] + summary['late'] + summary['excused']
#         summary['attendance_percentage'] = round((attended / total_days) * 100, 2)
        
#         return summary
    
#     def get_fee_account(self, obj):
#         try:
#             fee_account = obj.fee_account
#             return FeeAccountSerializer(fee_account).data
#         except FeeAccount.DoesNotExist:
#             return {
#                 'total_fee_due': 0,
#                 'total_paid': 0,
#                 'balance': 0,
#                 'is_fee_paid': True,
#                 'recent_payments': [],
#                 'payment_history_count': 0
#             }
    
#     def get_unread_messages_count(self, obj):
#         parent = self.context.get('parent')
#         if not parent:
#             return 0
        
#         return Message.objects.filter(
#             thread__student=obj,
#             thread__participants=parent.user,
#             is_read=False
#         ).exclude(sender=parent.user).count()


class MessageThreadSerializer(serializers.ModelSerializer):
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
        current_user = self.context.get('request').user
        return obj.messages.filter(is_read=False).exclude(sender=current_user).count()

# Message Serializer
class MessageSerializer(serializers.ModelSerializer):
    sender_name = serializers.CharField(source='sender.get_full_name', read_only=True)
    sender_type = serializers.CharField(source='sender.user_type', read_only=True)
    
    class Meta:
        model = Message
        fields = [
            'id', 'content', 'sender_name', 'sender_type', 
            'is_read', 'read_at', 'created_at'
        ]
        read_only_fields = ['id', 'sender_name', 'sender_type', 'created_at']

# Create Message Serializer
class MessageCreateSerializer(serializers.Serializer):
    recipient_id = serializers.IntegerField()
    student_id = serializers.IntegerField(required=False, allow_null=True)
    subject = serializers.CharField(max_length=200)
    content = serializers.CharField(max_length=5000)
    
    def validate_recipient_id(self, value):
        try:
            recipient = User.objects.get(id=value)
            if recipient.user_type not in ['teacher', 'admin']:
                raise serializers.ValidationError("Recipient must be a teacher or admin")
            return value
        except User.DoesNotExist:
            raise serializers.ValidationError("Recipient not found")
    
    def validate_student_id(self, value):
        if value:
            parent = self.context['request'].user.parent_profile
            if not parent.children.filter(id=value).exists():
                raise serializers.ValidationError("Student does not belong to you")
        return value

# Fee Payment Serializer
class FeePaymentSerializer(serializers.Serializer):
    student_id = serializers.IntegerField()
    amount = serializers.DecimalField(max_digits=10, decimal_places=2, min_value=Decimal('0.01'))
    payment_method = serializers.ChoiceField(choices=Payment.PAYMENT_METHODS)
    transaction_reference = serializers.CharField(max_length=100, required=False, allow_blank=True)
    mpesa_receipt = serializers.CharField(max_length=20, required=False, allow_blank=True)
    notes = serializers.CharField(max_length=500, required=False, allow_blank=True)
    
    def validate_student_id(self, value):
        parent = self.context['request'].user.parent_profile
        if not parent.children.filter(id=value).exists():
            raise serializers.ValidationError("Student does not belong to you")
        return value
    
    def validate_amount(self, value):
        if value > Decimal('1000000.00'):  # 1 million limit
            raise serializers.ValidationError("Amount too large")
        return value
    
    def validate_mpesa_receipt(self, value):
        if value and self.initial_data.get('payment_method') == 'mpesa':
            if len(value) < 8:
                raise serializers.ValidationError("Invalid M-Pesa receipt number")
        return value

# Consent Serializer
class ConsentSerializer(serializers.ModelSerializer):
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

# Consent Action Serializer
class ConsentActionSerializer(serializers.Serializer):
    student_id = serializers.IntegerField()
    consent_type = serializers.ChoiceField(choices=Consent.CONSENT_TYPES)
    action = serializers.ChoiceField(choices=[('grant', 'Grant'), ('revoke', 'Revoke')])
    notes = serializers.CharField(max_length=500, required=False, allow_blank=True)
    
    def validate_student_id(self, value):
        parent = self.context['request'].user.parent_profile
        if not parent.children.filter(id=value).exists():
            raise serializers.ValidationError("Student does not belong to you")
        return value