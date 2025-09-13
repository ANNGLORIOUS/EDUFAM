from rest_framework import generics
from rest_framework.permissions import IsAuthenticated, AllowAny
from .models import (
    AttendanceRecord, GradeRecord, StudentFlag, Event,
    User, AuditLog, USSDConfig
)
from .serializers import (
    AttendanceRecordSerializer, GradeRecordSerializer, StudentFlagSerializer,
    EventSerializer, UserSerializer, AuditLogSerializer, USSDConfigSerializer
)
from .permissions import IsTeacher, IsAdmin
from .serializers import RegisterSerializer, UserSerializer
from django.contrib.auth import get_user_model

User = get_user_model()
class RegisterView(generics.CreateAPIView):
    queryset = User.objects.all()
    permission_classes = [AllowAny]
    serializer_class = RegisterSerializer

# ----------------------
# TEACHER VIEWS
# ----------------------
class AttendanceBulkUploadView(generics.CreateAPIView):
    queryset = AttendanceRecord.objects.all()
    serializer_class = AttendanceRecordSerializer
    permission_classes = [IsAuthenticated, IsTeacher]


class GradeBulkUploadView(generics.CreateAPIView):
    queryset = GradeRecord.objects.all()
    serializer_class = GradeRecordSerializer
    permission_classes = [IsAuthenticated, IsTeacher]


class StudentFlagView(generics.CreateAPIView):
    queryset = StudentFlag.objects.all()
    serializer_class = StudentFlagSerializer
    permission_classes = [IsAuthenticated, IsTeacher]


class EventView(generics.CreateAPIView):
    queryset = Event.objects.all()
    serializer_class = EventSerializer
    permission_classes = [IsAuthenticated, IsTeacher]


# ----------------------
# ADMIN VIEWS
# ----------------------
class UserApprovalView(generics.ListAPIView):
    queryset = User.objects.all()
    serializer_class = UserSerializer
    permission_classes = [IsAuthenticated, IsAdmin]


class AttendanceReportView(generics.ListAPIView):
    queryset = AttendanceRecord.objects.all()
    serializer_class = AttendanceRecordSerializer
    permission_classes = [IsAuthenticated, IsAdmin]


class USSDConfigView(generics.CreateAPIView):
    queryset = USSDConfig.objects.all()
    serializer_class = USSDConfigSerializer
    permission_classes = [IsAuthenticated, IsAdmin]
