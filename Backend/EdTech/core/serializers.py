from rest_framework import serializers
from django.db.models import Avg, Count, Sum
from django.utils import timezone
from datetime import timedelta

from decimal import Decimal

from .models import ( User ,OTP, Student, Grade,Attendance, Message, Fee, Payment, Consent, Event)
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

class StudentSerializer(serializers.ModelSerializer):
    class Meta:
        model = Student
        fields = ["id", "name", "student_id", "class_name"]


class ParentProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'first_name', 'last_name', 'email']


class StudentSummarySerializer(serializers.Serializer):
    student_id = serializers.CharField()
    name = serializers.CharField()
    class_name = serializers.CharField()
    grades = serializers.SerializerMethodField()
    attendance = serializers.SerializerMethodField()
    fees = serializers.SerializerMethodField()

    def get_grades(self, obj):
        return [
            {"subject": g.subject, "grade": g.score}
            for g in obj.grades.all()
        ]

    def get_attendance(self, obj):
        total = obj.attendance_records.count()
        present = obj.attendance_records.filter(status="present").count()
        absent = obj.attendance_records.filter(status="absent").count()
        percentage = (present / total * 100) if total > 0 else 0
        return {"present": present, "absent": absent, "percentage": percentage}

    def get_fees(self, obj):
        fee = getattr(obj, "fee", None)
        if not fee:
            return {"total": 0, "paid": 0, "due": 0}
        return {"total": fee.total, "paid": fee.paid, "due": fee.due}



class MessageSerializer(serializers.ModelSerializer):
    class Meta:
        model = Message
        fields = ["id", "student", "type", "message", "created_at"]


class PaymentSerializer(serializers.ModelSerializer):
    class Meta:
        model = Payment
        fields = ["id", "amount", "method", "transaction_id", "date"]


class FeeSerializer(serializers.ModelSerializer):
    due = serializers.DecimalField(max_digits=10, decimal_places=2, read_only=True)
    paymentHistory = PaymentSerializer(source="payments", many=True, read_only=True)

    class Meta:
        model = Fee
        fields = ["total", "paid", "due", "paymentHistory"]


class FeePaymentSerializer(serializers.Serializer):
    studentId = serializers.IntegerField()
    amount = serializers.DecimalField(max_digits=10, decimal_places=2)
    paymentMethod = serializers.CharField()
    transactionId = serializers.CharField()


class ConsentSerializer(serializers.ModelSerializer):
    class Meta:
        model = Consent
        fields = ["id", "student", "consent_type", "status", "created_at"]
        read_only_fields = ["id", "student", "consent_type", "created_at"]
    
    def validate_status(self, value):
        if value not in ["granted", "denied"]:
            raise serializers.ValidationError("Status must be 'granted' or 'denied'.")
        return value

class EventSerializer(serializers.ModelSerializer):
    class Meta:
        model = Event
        fields = ["id", "title", "description", "date"]
        

