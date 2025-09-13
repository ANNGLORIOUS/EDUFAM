from rest_framework import serializers
from django.contrib.auth import get_user_model
from rest_framework.validators import UniqueValidator
from django.contrib.auth.password_validation import validate_password
import datetime

from .models import (
    Student,
    AttendanceRecord,
    GradeRecord,
    StudentFlag,
    Event,
    AuditLog,
    USSDConfig,
    FeeAccount,
    Payment,
)

User = get_user_model()


# --------- Auth / User ----------
class RegisterSerializer(serializers.ModelSerializer):
    email = serializers.EmailField(required=True, validators=[UniqueValidator(queryset=User.objects.all())])
    password = serializers.CharField(write_only=True, required=True, validators=[validate_password])
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


# --------- Student ----------
class StudentSerializer(serializers.ModelSerializer):
    class Meta:
        model = Student
        fields = "__all__"


# --------- Attendance ----------
class AttendanceRecordSerializer(serializers.ModelSerializer):
    class Meta:
        model = AttendanceRecord
        fields = "__all__"
        read_only_fields = ("created_at",)

    def validate_date(self, value):
        if value > datetime.date.today():
            raise serializers.ValidationError("Date cannot be in the future.")
        return value


# --------- Grades ----------
class GradeRecordSerializer(serializers.ModelSerializer):
    class Meta:
        model = GradeRecord
        fields = "__all__"
        read_only_fields = ("created_at",)

    def validate_grade(self, value):
        if value < 0 or value > 100:
            raise serializers.ValidationError("Grade must be between 0 and 100.")
        return value


# --------- Flags ----------
class StudentFlagSerializer(serializers.ModelSerializer):
    class Meta:
        model = StudentFlag
        fields = "__all__"
        read_only_fields = ("created_at",)


# --------- Events ----------
class EventSerializer(serializers.ModelSerializer):
    class Meta:
        model = Event
        fields = "__all__"
        read_only_fields = ("created_at",)


# --------- Admin ----------
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


# --------- Fees ----------
class FeeAccountSerializer(serializers.ModelSerializer):
    class Meta:
        model = FeeAccount
        fields = "__all__"


class PaymentSerializer(serializers.ModelSerializer):
    class Meta:
        model = Payment
        fields = "__all__"
        read_only_fields = ("date",)
