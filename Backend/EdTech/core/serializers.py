from rest_framework import serializers
from django.contrib.auth import get_user_model
from rest_framework.validators import UniqueValidator
from django.contrib.auth.password_validation import validate_password
import datetime

from .models import (
    Student,
    Teacher,
    Parent,
    AttendanceRecord,
    GradeRecord,
    StudentFlag,
    Event,
    FeeAccount,
    Payment,
    Feedback,
    SMSCampaign,
    AuditLog,
    USSDConfig,
)

User = get_user_model()


# ----------------------
# AUTH / USER
# ----------------------
class RegisterSerializer(serializers.ModelSerializer):
    email = serializers.EmailField(
        required=True,
        validators=[UniqueValidator(queryset=User.objects.all())],
    )
    password = serializers.CharField(
        write_only=True, required=True, validators=[validate_password]
    )
    password2 = serializers.CharField(write_only=True, required=True)

    class Meta:
        model = User
        fields = ("username", "email", "password", "password2", "role")

    def validate(self, attrs):
        if attrs["password"] != attrs["password2"]:
            raise serializers.ValidationError({"password": "Passwords don't match."})
        return attrs

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
        fields = ["id", "username", "email", "role"]


# ----------------------
# STUDENT
# ----------------------
class StudentSerializer(serializers.ModelSerializer):
    class Meta:
        model = Student
        fields = "__all__"


# ----------------------
# PARENT
# ----------------------
class ParentSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)

    class Meta:
        model = Parent
        fields = ["id", "user", "phone_number", "occupation", "address"]


# ----------------------
# TEACHER
# ----------------------
class TeacherSerializer(serializers.ModelSerializer):
    class Meta:
        model = Teacher
        fields = "__all__"


# ----------------------
# ATTENDANCE
# ----------------------
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
# GRADES
# ----------------------
class GradeRecordSerializer(serializers.ModelSerializer):
    class Meta:
        model = GradeRecord
        fields = "__all__"
        read_only_fields = ("created_at",)

    def validate_grade(self, value):
        if len(value) > 2:  # e.g. "A", "B+", "C-"
            raise serializers.ValidationError("Grade must be a valid letter grade (e.g. A, B+).")
        return value


# ----------------------
# FLAGS
# ----------------------
class StudentFlagSerializer(serializers.ModelSerializer):
    class Meta:
        model = StudentFlag
        fields = "__all__"
        read_only_fields = ("created_at",)


# ----------------------
# EVENTS
# ----------------------
class EventSerializer(serializers.ModelSerializer):
    class Meta:
        model = Event
        fields = "__all__"
        read_only_fields = ("created_at",)


# ----------------------
# FEES
# ----------------------
class FeeAccountSerializer(serializers.ModelSerializer):
    class Meta:
        model = FeeAccount
        fields = "__all__"


class PaymentSerializer(serializers.ModelSerializer):
    class Meta:
        model = Payment
        fields = "__all__"
        read_only_fields = ("date",)


# ----------------------
# FEEDBACK
# ----------------------
class FeedbackSerializer(serializers.ModelSerializer):
    class Meta:
        model = Feedback
        fields = "__all__"
        read_only_fields = ("timestamp",)


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
