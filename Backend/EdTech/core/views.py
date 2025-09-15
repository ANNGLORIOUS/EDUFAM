from rest_framework import generics, status
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.response import Response
from django.contrib.auth import get_user_model
from django.views.decorators.csrf import csrf_exempt
from django.http import HttpResponse

from .models import AttendanceRecord, GradeRecord, StudentFlag, Event, USSDConfig
from .serializers import (
    AttendanceRecordSerializer,
    GradeRecordSerializer,
    StudentFlagSerializer,
    EventSerializer,
    USSDConfigSerializer,
    RegisterSerializer,
    UserSerializer,
)

from .permissions import IsTeacher, IsAdmin

User = get_user_model()


# Auth / Register
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

@csrf_exempt
def ussd_callback(request):
    session_id = request.POST.get("sessionId")
    service_code = request.POST.get("serviceCode")
    phone_number = request.POST.get("phoneNumber")
    text = request.POST.get("text", "")

    # Split user input
    steps = text.split("*")

    response = ""
    if text == "":
        response = "CON Welcome to EdTech\n1. Check Attendance\n2. Fees Balance\n3. Upcoming Events"
    elif text == "1":
        response = "END Attendance feature coming soon."
    elif text == "2":
        response = "END Your fee balance is Ksh 0 (demo)."
    elif text == "3":
        response = "END Next event: PTA Meeting on 20th Sept."
    else:
        response = "END Invalid option."

    return HttpResponse(response, content_type="text/plain")
