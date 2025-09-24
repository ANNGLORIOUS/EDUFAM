from django.contrib.auth import get_user_model, authenticate
from django.contrib.auth.password_validation import validate_password
from django.core.exceptions import ValidationError
from rest_framework import serializers
from rest_framework.validators import UniqueValidator
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from phonenumber_field.serializerfields import PhoneNumberField
from django.utils import timezone
from datetime import timedelta
import datetime

from .models import (
    OTP,
    Student,
    Teacher,
    Parent,
    Subject,
    Term,
    AttendanceRecord,
    GradeRecord,
    StudentFlag,
    Event,
    Fee,
    FeeAccount,
    Payment,
    Message,
    Feedback,
    Consent,
    SMSCampaign,
    AuditLog,
    USSDConfig,
)

User = get_user_model()

# ----------------------
# AUTH / USER
# ----------------------
class MyTokenObtainPairSerializer(TokenObtainPairSerializer):
    def validate(self, attrs):
        data = super().validate(attrs)
        data.update(
            {
                "user_id": self.user.id,
                "username": self.user.username,
                "email": self.user.email,
                "role": self.user.role,
            }
        )
        return data


class UserRegistrationSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, required=True)
    password2 = serializers.CharField(write_only=True, required=True)

    class Meta:
        model = User
        fields = ["id", "username", "email", "role", "password", "password2"]

    def validate(self, data):
        if data["password"] != data["password2"]:
            raise serializers.ValidationError({"password": "Passwords do not match."})

        try:
            validate_password(data["password"])
        except ValidationError as e:
            raise serializers.ValidationError({"password": list(e.messages)})

        return data

    def create(self, validated_data):
        validated_data.pop("password2")
        password = validated_data.pop("password")
        user = User(**validated_data)
        user.set_password(password)
        user.save()
        return user

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ["id", "username", "email", "role", "first_name", "last_name"]


# ----------------------
# OTP
# ----------------------
class OTPRequestSerializer(serializers.Serializer):
    phone_number = PhoneNumberField(required=False)
    email = serializers.EmailField(required=False)
    otp_type = serializers.ChoiceField(choices=OTP.OTP_TYPE, default="login")

    def validate(self, attrs):
        if not attrs.get("phone_number") and not attrs.get("email"):
            raise serializers.ValidationError(
                "Either phone_number or email is required"
            )
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
            raise serializers.ValidationError(
                "Either phone_number or email is required."
            )

        otp = OTP.objects.filter(code=code, is_used=False)
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
            phone_number=phone,
            email=email,
            created_at__gte=timezone.now() - timedelta(minutes=1),
        )
        if recent_attempts.count() > 5:
            raise serializers.ValidationError(
                "Too many OTP attempts. Please wait before retrying."
            )

        attrs["otp_instance"] = otp
        return attrs


class GoogleAuthSerializer(serializers.Serializer):
    token = serializers.CharField()


# ----------------------
# PASSWORD MGMT
# ----------------------
class PasswordChangeSerializer(serializers.Serializer):
    old_password = serializers.CharField(required=True)
    new_password = serializers.CharField(required=True)
    new_password_confirm = serializers.CharField(required=True)

    def validate_old_password(self, value):
        user = self.context["request"].user
        if not user.check_password(value):
            raise serializers.ValidationError("Old password is incorrect")
        return value

    def validate(self, attrs):
        if attrs["new_password"] != attrs["new_password_confirm"]:
            raise serializers.ValidationError("New passwords don't match")

        try:
            validate_password(attrs["new_password"], user=self.context["request"].user)
        except ValidationError as e:
            raise serializers.ValidationError({"new_password": list(e.messages)})

        return attrs

    def save(self, **kwargs):
        user = self.context["request"].user
        user.set_password(self.validated_data["new_password"])
        user.save()
        return user


class PasswordResetRequestSerializer(serializers.Serializer):
    email = serializers.EmailField(required=True)


class PasswordResetConfirmSerializer(serializers.Serializer):
    token = serializers.CharField(required=True)
    new_password = serializers.CharField(required=True)
    new_password_confirm = serializers.CharField(required=True)

    def validate(self, attrs):
        if attrs["new_password"] != attrs["new_password_confirm"]:
            raise serializers.ValidationError(
                {"new_password_confirm": "Passwords do not match"}
            )

        try:
            validate_password(attrs["new_password"])
        except ValidationError as e:
            raise serializers.ValidationError({"new_password": list(e.messages)})

        return attrs


# ----------------------
# STUDENTS / PARENTS / TEACHERS
# ----------------------
class StudentNestedSerializer(serializers.ModelSerializer):
    class Meta:
        model = Student
        fields = ["id", "student_id", "name", "student_class", "status", "date_added"]


# FIX: Correct the children field
class ParentProfileSerializer(serializers.ModelSerializer):
    children = serializers.SerializerMethodField()

    class Meta:
        model = User
        fields = ["id", "username", "email", "children"]

    def get_children(self, obj):
        # Use the correct related name
        students = Student.objects.filter(parents=obj)
        return StudentNestedSerializer(students, many=True).data


class StudentSerializer(serializers.ModelSerializer):
    class Meta:
        model = Student
        fields = "__all__"

class StudentSummarySerializer(serializers.ModelSerializer):
    class Meta:
        model = Student
        fields = ["id", "student_id", "name", "student_class", "status"]

class ParentSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)

    class Meta:
        model = Parent
        fields = ["id", "user", "phone_number", "occupation", "address"]


class TeacherSerializer(serializers.ModelSerializer):
    class Meta:
        model = Teacher
        fields = "__all__"


# ----------------------
# ACADEMICS
# ----------------------
class SubjectSerializer(serializers.ModelSerializer):
    class Meta:
        model = Subject
        fields = ["id", "name"]


class TermSerializer(serializers.ModelSerializer):
    class Meta:
        model = Term
        fields = ["id", "name", "start_date", "end_date"]


class StudentGradesSerializer(serializers.ModelSerializer):
    subject = serializers.StringRelatedField()
    term = serializers.StringRelatedField()
    student = serializers.StringRelatedField()
    file_url = serializers.SerializerMethodField()

    class Meta:
        model = GradeRecord
        fields = [
            "id",
            "student",
            "subject",
            "term",
            "marks",
            "grade",
            "comments",
            "upload_date",
            "file_url",
        ]

    def get_file_url(self, obj):
        return obj.file.url if obj.file else None


# ----------------------
# ATTENDANCE
# ----------------------
class StudentAttendanceSerializer(serializers.ModelSerializer):
    status_display = serializers.CharField(source="get_status_display")

    class Meta:
        model = AttendanceRecord
        fields = ["id", "date", "status", "status_display", "recorded_by"]


class AttendanceRecordSerializer(serializers.ModelSerializer):
    class Meta:
        model = AttendanceRecord
        fields = "__all__"
        read_only_fields = ("created_at", "attendance_percent")

    def validate_date(self, value):
        if value > datetime.date.today():
            raise serializers.ValidationError("Date cannot be in the future.")
        return value


# ----------------------
# GRADES & FLAGS
# ----------------------
class GradeRecordSerializer(serializers.ModelSerializer):
    class Meta:
        model = GradeRecord
        fields = "__all__"
        read_only_fields = ("created_at",)

    def validate_grade(self, value):
        if len(value) > 2:  # e.g. "A", "B+", "C-"
            raise serializers.ValidationError(
                "Grade must be a valid letter grade (e.g. A, B+)."
            )
        return value


class StudentFlagSerializer(serializers.ModelSerializer):
    class Meta:
        model = StudentFlag
        fields = "__all__"
        read_only_fields = ("created_at",)


# ----------------------
# FEES & PAYMENTS
# ----------------------
class PaymentSerializer(serializers.ModelSerializer):
    class Meta:
        model = Payment
        fields = "__all__"
        read_only_fields = ("date",)


class FeeSerializer(serializers.ModelSerializer):
    paid_amount = serializers.FloatField()
    due_amount = serializers.SerializerMethodField()
    payments = PaymentSerializer(many=True, read_only=True)

    class Meta:
        model = Fee
        fields = [
            "id",
            "student",
            "term",
            "total_fee",
            "paid_amount",
            "due_amount",
            "due_date",
            "payments",
        ]

    def get_due_amount(self, obj):
        return obj.total_fee - obj.paid_amount


class FeePaymentSerializer(serializers.Serializer):
    studentId = serializers.IntegerField()
    amount = serializers.FloatField()
    paymentMethod = serializers.CharField()
    transactionId = serializers.CharField()


class FeeAccountSerializer(serializers.ModelSerializer):
    class Meta:
        model = FeeAccount
        fields = "__all__"


# ----------------------
# COMMS & FEEDBACK
# ----------------------
class MessageSerializer(serializers.ModelSerializer):
    class Meta:
        model = Message
        fields = [
            "id",
            "parent",
            "teacher",
            "subject",
            "message",
            "created_at",
            "read",
        ]
        read_only_fields = ["parent", "created_at", "read"]


class FeedbackSerializer(serializers.ModelSerializer):
    class Meta:
        model = Feedback
        fields = "__all__"
        read_only_fields = ("timestamp",)


class ConsentSerializer(serializers.ModelSerializer):
    student_name = serializers.CharField(
        source="student.user.username", read_only=True
    )

    class Meta:
        model = Consent
        fields = ["id", "student", "student_name", "consent_type", "status", "created_at"]


# ----------------------
# EVENTS
# ----------------------
class EventSerializer(serializers.ModelSerializer):
    class Meta:
        model = Event
        fields = "__all__"
        read_only_fields = ("created_at",)


# ----------------------
# SMS CAMPAIGNS
# ----------------------
class SMSCampaignSerializer(serializers.ModelSerializer):
    class Meta:
        model = SMSCampaign
        fields = "__all__"
        read_only_fields = ("created_at",)


# ----------------------
# ADMIN TOOLS
# ----------------------
class AuditLogSerializer(serializers.ModelSerializer):
    class Meta:
        model = AuditLog
        fields = "__all__"
        read_only_fields = ("timestamp",)


class USSDConfigSerializer(serializers.ModelSerializer):
    class Meta:
        model = USSDConfig
        fields = "__all__"
        read_only_fields = ("updated_at",)
