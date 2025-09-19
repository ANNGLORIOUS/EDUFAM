from rest_framework import generics, status
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.response import Response
from django.contrib.auth import get_user_model
from django.views.decorators.csrf import csrf_exempt
from django.http import HttpResponse
from django.conf import settings

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
from .serializers import (
    RegisterSerializer,
    UserSerializer,
    StudentSerializer,
    ParentSerializer,
    TeacherSerializer,
    AttendanceRecordSerializer,
    GradeRecordSerializer,
    StudentFlagSerializer,
    EventSerializer,
    FeeAccountSerializer,
    PaymentSerializer,
    FeedbackSerializer,
    SMSCampaignSerializer,
    AuditLogSerializer,
    USSDConfigSerializer,
)
from .permissions import IsTeacher, IsAdmin, IsParent

User = get_user_model()


# ----------------------
# AUTH
# ----------------------
class RegisterView(generics.CreateAPIView):
    queryset = User.objects.all()
    permission_classes = [AllowAny]
    serializer_class = RegisterSerializer


# ----------------------
# STUDENT
# ----------------------
class StudentListCreateView(generics.ListCreateAPIView):
    queryset = Student.objects.all()
    serializer_class = StudentSerializer
    permission_classes = [IsAuthenticated]


class StudentDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Student.objects.all()
    serializer_class = StudentSerializer
    permission_classes = [IsAuthenticated]

# ----------------------
# PARENT
# ----------------------

# Parent can update their own profile
class ParentProfileView(generics.RetrieveUpdateAPIView):
    queryset = Parent.objects.all()
    serializer_class = ParentSerializer
    permission_classes = [IsAuthenticated, IsParent]

    def get_object(self):
        return self.request.user.parent_profile


# Admin / Teacher can view all parents
class ParentListView(generics.ListAPIView):
    queryset = Parent.objects.select_related("user").all()
    serializer_class = ParentSerializer
    permission_classes = [IsAuthenticated, IsAdmin | IsTeacher]


# ----------------------
# TEACHER
# ----------------------
class TeacherView(generics.ListCreateAPIView):
    queryset = Teacher.objects.all()
    serializer_class = TeacherSerializer
    permission_classes = [IsAuthenticated, IsAdmin]


# ----------------------
# ATTENDANCE
# ----------------------
class AttendanceBulkUploadView(generics.CreateAPIView):
    queryset = AttendanceRecord.objects.all()
    serializer_class = AttendanceRecordSerializer
    permission_classes = [IsAuthenticated, IsTeacher]


class AttendanceReportView(generics.ListAPIView):
    queryset = AttendanceRecord.objects.all()
    serializer_class = AttendanceRecordSerializer
    permission_classes = [IsAuthenticated, IsAdmin]


# ----------------------
# GRADES
# ----------------------
class GradeBulkUploadView(generics.CreateAPIView):
    queryset = GradeRecord.objects.all()
    serializer_class = GradeRecordSerializer
    permission_classes = [IsAuthenticated, IsTeacher]


# ----------------------
# FLAGS
# ----------------------
class StudentFlagView(generics.CreateAPIView):
    queryset = StudentFlag.objects.all()
    serializer_class = StudentFlagSerializer
    permission_classes = [IsAuthenticated, IsTeacher]


# ----------------------
# EVENTS
# ----------------------
class EventView(generics.ListCreateAPIView):
    queryset = Event.objects.all()
    serializer_class = EventSerializer
    permission_classes = [IsAuthenticated]


# ----------------------
# FEES
# ----------------------
class FeeAccountView(generics.RetrieveUpdateAPIView):
    queryset = FeeAccount.objects.all()
    serializer_class = FeeAccountSerializer
    permission_classes = [IsAuthenticated, IsAdmin]


class PaymentView(generics.CreateAPIView):
    queryset = Payment.objects.all()
    serializer_class = PaymentSerializer
    permission_classes = [IsAuthenticated, IsAdmin]


# ----------------------
# FEEDBACK
# ----------------------
class FeedbackView(generics.ListCreateAPIView):
    queryset = Feedback.objects.all()
    serializer_class = FeedbackSerializer
    permission_classes = [IsAuthenticated]


# ----------------------
# SMS CAMPAIGNS
# ----------------------
class SMSCampaignView(generics.ListCreateAPIView):
    queryset = SMSCampaign.objects.all()
    serializer_class = SMSCampaignSerializer
    permission_classes = [IsAuthenticated, IsAdmin]


# ----------------------
# ADMIN TOOLS
# ----------------------
class AuditLogView(generics.ListAPIView):
    queryset = AuditLog.objects.all()
    serializer_class = AuditLogSerializer
    permission_classes = [IsAuthenticated, IsAdmin]


class USSDConfigView(generics.CreateAPIView):
    queryset = USSDConfig.objects.all()
    serializer_class = USSDConfigSerializer
    permission_classes = [IsAuthenticated, IsAdmin]



@csrf_exempt
def ussd_callback(request):
    # Optional: Verify with API Key if configured
    api_key = request.headers.get("X-API-Key")
    if api_key and api_key != settings.AT_USSD_API_KEY:
        return HttpResponse("END Unauthorized", content_type="text/plain")

    session_id = request.POST.get("sessionId")
    service_code = request.POST.get("serviceCode")
    phone_number = request.POST.get("phoneNumber")
    text = request.POST.get("text", "")

    steps = text.split("*") if text else []

    # Get latest config
    config = USSDConfig.objects.latest("updated_at")
    menu = config.menu_json
    menus = menu.get("menus", {})

    response = "END Invalid option"

    if not steps:
        # Root menu
        options = "\n".join([f"{k}. {v['text']}" for k, v in menus.items()])
        response = f"CON {menu['welcome_text']}\n{options}"
    else:
        current = menus
        node = None

        for step in steps:
            if step in current:
                node = current[step]
                current = node.get("children", {})
            else:
                response = "END Invalid choice"
                break

        if node:
            if node.get("type") == "END":
                response = f"END {node.get('message', 'Goodbye')}"
            else:
                options = "\n".join([f"{k}. {v['text']}" for k, v in node.get("children", {}).items()])
                response = f"CON {node['text']}\n{options}"

    return HttpResponse(response, content_type="text/plain")