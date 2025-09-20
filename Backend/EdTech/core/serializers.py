from rest_framework import serializers
from django.db.models import Avg, Count, Sum
from django.utils import timezone
from datetime import timedelta

from decimal import Decimal

from .models import ( User ,OTP, Student,Subject,Term,Result,Attendance, Message, Fee,Feedback, Payment, Consent, Event)
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from django.contrib.auth.password_validation import validate_password
from django.core.exceptions import ValidationError
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
                 'first_name', 'last_name', 'phone_number', 'user_type')
    
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

        
        otp = OTP.objects.filter( code=code,is_used=False, )
        if phone:
            otp = otp.filter(phone_number=phone)
        if email:
            otp = otp.filter(email=email)

        otp = otp.first()
        if not otp:
            raise serializers.ValidationError("Invalid or expired OTP.")

        if otp.is_expired():
            raise serializers.ValidationError("OTP expired.")

        recent_attempts = OTP.objects.filter(
            phone_number=phone, email=email, created_at__gte=timezone.now() - timedelta(minutes=1)
        )
        if recent_attempts.count() > 5:  
            raise serializers.ValidationError("Too many OTP attempts. Please wait before retrying.")

        attrs["otp_instance"] = otp
        return attrs


class GoogleAuthSerializer(serializers.Serializer):
    token = serializers.CharField()


class PasswordChangeSerializer(serializers.Serializer):
    old_password = serializers.CharField(required=True)
    new_password = serializers.CharField(required=True)
    new_password_confirm = serializers.CharField(required=True)
    
    def validate_old_password(self, value):
        user = self.context['request'].user
        if not user.check_password(value):
            raise serializers.ValidationError("Old password is incorrect")
        return value
    
    def validate(self, attrs):
        if attrs['new_password'] != attrs['new_password_confirm']:
            raise serializers.ValidationError("New passwords don't match")
        
        try:
            validate_password(attrs['new_password'], user=self.context['request'].user)
        except ValidationError as e:
            raise serializers.ValidationError({"new_password": list(e.messages)})
        
        return attrs

    def save(self, **kwargs):
        user = self.context['request'].user
        user.set_password(self.validated_data['new_password'])
        user.save()
        return user

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
    new_password = serializers.CharField(required=True)
    new_password_confirm = serializers.CharField(required=True)

    def validate(self, attrs):
        if attrs['new_password'] != attrs['new_password_confirm']:
            raise serializers.ValidationError({"new_password_confirm": "Passwords do not match"})

        try:
            validate_password(attrs['new_password'])
        except ValidationError as e:
            raise serializers.ValidationError({"new_password": list(e.messages)})

        return attrs



# Parents/Student Serializer

class StudentNestedSerializer(serializers.ModelSerializer):
    class Meta:
        model = Student
        fields = ['id', 'student_id','name','student_class', 'status', 'date_added']


class ParentProfileSerializer(serializers.ModelSerializer):
    children = serializers.SerializerMethodField()

    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'children']

    def get_children(self, obj):
        students = Student.objects.filter(parent=obj)
        return StudentNestedSerializer(students, many=True).data



class StudentSummarySerializer(serializers.ModelSerializer):
    student_class = serializers.CharField(source='student_class.name')
    class Meta:
        model = Student
        fields = ['id', 'student_id', 'name','student_class', 'status', 'date_added']



class SubjectSerializer(serializers.ModelSerializer):
    class Meta:
        model = Subject
        fields = ['id', 'name']


class TermSerializer(serializers.ModelSerializer):
    class Meta:
        model = Term
        fields = ['id', 'name', 'start_date', 'end_date']


class StudentGradesSerializer(serializers.ModelSerializer):
    subject = serializers.StringRelatedField()
    term = serializers.StringRelatedField()
    student = serializers.StringRelatedField()
    file_url = serializers.SerializerMethodField()

    class Meta:
        model = Result
        fields = [
            "id", "student", "subject", "term", "marks", "grade",
            "comments", "upload_date", "file_url"
        ]

    def get_file_url(self, obj):
        return obj.file.url if obj.file else None




class StudentAttendanceSerializer(serializers.ModelSerializer):
    status_display = serializers.CharField(source='get_status_display')

    class Meta:
        model = Attendance
        fields = ['id', 'date', 'status', 'status_display', 'recorded_by']



class PaymentSerializer(serializers.ModelSerializer):
    class Meta:
        model = Payment
        fields = ['id', 'amount', 'date', 'method', 'transaction_id']


class FeeSerializer(serializers.ModelSerializer):
    paid_amount = serializers.FloatField()
    due_amount = serializers.SerializerMethodField()
    payments = PaymentSerializer(many=True, read_only=True)

    class Meta:
        model = Fee
        fields = ['id', 'student', 'term', 'total_fee', 'paid_amount', 'due_amount', 'due_date', 'payments']

    def get_due_amount(self, obj):
        return obj.total_fee - obj.paid_amount


class FeePaymentSerializer(serializers.Serializer):
    studentId = serializers.IntegerField()
    amount = serializers.FloatField()
    paymentMethod = serializers.CharField()
    transactionId = serializers.CharField()



class MessageSerializer(serializers.ModelSerializer):
    class Meta:
        model = Message
        fields = ['id', 'parent', 'teacher', 'subject', 'message', 'created_at', 'read']
        read_only_fields = ['parent', 'created_at', 'read']



class FeedbackSerializer(serializers.ModelSerializer):
    class Meta:
        model = Feedback
        fields = ['id', 'student', 'concern_type', 'message', 'request_callback',
                  'schedule_meeting', 'status', 'response', 'timestamp']



class ConsentSerializer(serializers.ModelSerializer):
    student_name = serializers.CharField(source='student.user.username', read_only=True)

    class Meta:
        model = Consent
        fields = ['id', 'student', 'student_name', 'consent_type', 'status', 'created_at']



class EventSerializer(serializers.ModelSerializer):
    class Meta:
        model = Event
        fields = ['id', 'title', 'description', 'start', 'end', 'event_type', 'target_audience']