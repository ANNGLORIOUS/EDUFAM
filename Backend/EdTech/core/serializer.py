from rest_framework import serializers
from .models import (
    User, Student, AttendanceRecord, GradeRecord,
    StudentFlag, Event, AuditLog, USSDConfig
)

# USER
class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ["id", "username", "email", "role"]


# STUDENT
class StudentSerializer(serializers.ModelSerializer):
    class Meta:
        model = Student
        fields = "__all__"


# TEACHER SERIALIZERS
class AttendanceRecordSerializer(serializers.ModelSerializer):
    class Meta:
        model = AttendanceRecord
        fields = "__all__"

    def validate(self, data):
        if data["date"] > serializers.DateField().to_internal_value(str(serializers.DateField().to_representation(serializers.DateField().to_representation(data["date"])))):
            raise serializers.ValidationError("Date cannot be in the future.")
        return data


class GradeRecordSerializer(serializers.ModelSerializer):
    class Meta:
        model = GradeRecord
        fields = "__all__"

    def validate_grade(self, value):
        if value < 0 or value > 100:
            raise serializers.ValidationError("Grade must be between 0 and 100.")
        return value


class StudentFlagSerializer(serializers.ModelSerializer):
    class Meta:
        model = StudentFlag
        fields = "__all__"


class EventSerializer(serializers.ModelSerializer):
    class Meta:
        model = Event
        fields = "__all__"


# ADMIN SERIALIZERS
class AuditLogSerializer(serializers.ModelSerializer):
    class Meta:
        model = AuditLog
        fields = "__all__"


class USSDConfigSerializer(serializers.ModelSerializer):
    class Meta:
        model = USSDConfig
        fields = "__all__"
