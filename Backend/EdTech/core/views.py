import logging
from django.shortcuts import get_object_or_404
from django.conf import settings
from django.db.models import F, Q
from django.http import FileResponse, HttpResponse
from django.contrib.auth import authenticate, get_user_model, update_session_auth_hash
from rest_framework import generics, status
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework_simplejwt.views import TokenObtainPairView
from rest_framework_simplejwt.tokens import RefreshToken
from django.views.decorators.csrf import csrf_exempt
from google.oauth2 import id_token
from google.auth.transport import requests as google_requests
from django.utils.timezone import now

from .sms import send_sms


from .models import (
    User, OTP, Student, Teacher, Parent, AttendanceRecord, GradeRecord, Message, Fee, Feedback,
    Payment, Consent, Event, StudentFlag, AuditLog, USSDConfig, SMSCampaign
)
from .serializers import (
    MyTokenObtainPairSerializer, UserRegistrationSerializer, OTPRequestSerializer, OTPVerifySerializer,
    GoogleAuthSerializer, PasswordChangeSerializer, PasswordResetRequestSerializer, PasswordResetConfirmSerializer,
    ParentProfileSerializer, MessageSerializer, EventSerializer, StudentSummarySerializer,
    FeeSerializer, PaymentSerializer, ConsentSerializer, FeePaymentSerializer, StudentGradesSerializer,
    StudentAttendanceSerializer, FeedbackSerializer, StudentSerializer, ParentSerializer, TeacherSerializer,
    AttendanceRecordSerializer, StudentFlagSerializer, AuditLogSerializer, USSDConfigSerializer, SMSCampaignSerializer
)
from .permissions import IsParent, IsParentOfStudent, IsTeacher, IsAdmin
from .services import MockSMSService, EmailService, PasswordResetService
from .tasks import send_payment_sms, send_message_notification

logger = logging.getLogger(__name__)

# ----------------------
# UTILS
# ----------------------
def get_tokens_for_user(user):
    refresh = RefreshToken.for_user(user)
    return {"refresh": str(refresh), "access": str(refresh.access_token)}

# ----------------------
# AUTHENTICATION
# ----------------------
class MyTokenObtainPairView(TokenObtainPairView):
    serializer_class = MyTokenObtainPairSerializer

class RegisterView(generics.CreateAPIView):
    queryset = get_user_model().objects.all()
    permission_classes = [AllowAny]
    serializer_class = UserRegistrationSerializer

class LoginView(APIView):
    permission_classes = [AllowAny]
    def post(self, request):
        user = authenticate(request, username=request.data.get("username"), password=request.data.get("password"))
        if not user:
            return Response({"detail": "Invalid credentials"}, status=401)
        otp = OTP.objects.create(phone_number=user.phone_number, email=user.email, otp_type="login")
        if user.phone_number:
            MockSMSService.send_sms(user.phone_number, f"Your OTP is {otp.code}")
        elif user.email:
            EmailService.send_email("Login OTP", f"Your OTP is {otp.code}", user.email)
        return Response({"detail": "OTP sent"})

class OTPRequestView(APIView):
    permission_classes = [AllowAny]
    def post(self, request):
        serializer = OTPRequestSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        otp = OTP.objects.create(**serializer.validated_data)
        if otp.phone_number:
            MockSMSService.send_otp(otp.phone_number, otp.code, otp.otp_type)
        if otp.email:
            EmailService.send_otp_email(otp.email, otp.code, otp.otp_type)
        return Response({"detail": "OTP sent"})

class OTPVerifyView(APIView):
    permission_classes = [AllowAny]
    serializer_class = OTPVerifySerializer
    def post(self, request):
        serializer = self.serializer_class(data=request.data)
        serializer.is_valid(raise_exception=True)
        otp = serializer.validated_data["otp_instance"]
        otp.is_used = True; otp.save()
        user = User.objects.filter(phone_number=otp.phone_number).first() or User.objects.filter(email=otp.email).first()
        if not user:
            return Response({"detail": "User not found"}, status=404)
        if otp.phone_number: user.is_phone_verified = True
        if otp.email: user.is_email_verified = True
        user.save()
        return Response({**get_tokens_for_user(user), "user": {"id": user.id, "username": user.username, "role": user.role}})

class GoogleAuthView(generics.GenericAPIView):
    serializer_class = GoogleAuthSerializer
    permission_classes = [AllowAny]
    def post(self, request):
        serializer = self.get_serializer(data=request.data); serializer.is_valid(raise_exception=True)
        try:
            info = id_token.verify_oauth2_token(serializer.validated_data["token"], google_requests.Request(), settings.GOOGLE_CLIENT_ID)
            email = info.get("email"); first, last = info.get("given_name", ""), info.get("family_name", "")
            user, created = User.objects.get_or_create(email=email, defaults={"username": email.split("@")[0], "first_name": first, "last_name": last, "is_email_verified": True})
            return Response({"message": "Google login successful", "is_new": created, "user": {"id": user.id, "email": user.email}, **get_tokens_for_user(user)})
        except ValueError:
            return Response({"error": "Invalid Google token"}, status=400)

class LogoutView(APIView):
    permission_classes = [IsAuthenticated]
    def post(self, request):
        try:
            RefreshToken(request.data.get("refresh")).blacklist()
            return Response({"detail": "Logged out"}, status=205)
        except Exception:
            return Response({"detail": "Invalid refresh"}, status=400)

class PasswordChangeView(APIView):
    permission_classes = [IsAuthenticated]
    def post(self, request):
        serializer = PasswordChangeSerializer(data=request.data, context={'request': request}); serializer.is_valid(raise_exception=True); serializer.save()
        update_session_auth_hash(request, request.user)
        return Response({"detail": "Password changed"})

class PasswordResetRequestView(APIView):
    permission_classes = [AllowAny]
    def post(self, request):
        serializer = PasswordResetRequestSerializer(data=request.data)
        if serializer.is_valid():
            PasswordResetService.initiate(serializer.validated_data["email"])
        return Response({"message": "If the email exists, a reset link has been sent."})

class PasswordResetConfirmView(APIView):
    permission_classes = [AllowAny]
    def post(self, request):
        serializer = PasswordResetConfirmSerializer(data=request.data); serializer.is_valid(raise_exception=True)
        PasswordResetService.confirm(serializer.validated_data["token"], serializer.validated_data["new_password"])
        return Response({"message": "Password reset successful"})

# ----------------------
# PARENT VIEWS
# ----------------------
class ParentProfileView(generics.RetrieveAPIView):
    serializer_class = ParentProfileSerializer
    permission_classes = [IsAuthenticated, IsParent]
    def get_object(self): return self.request.user

class StudentSummaryView(generics.ListAPIView):
    serializer_class = StudentSummarySerializer
    permission_classes = [IsAuthenticated, IsParent]
    def get_queryset(self): return Student.objects.filter(parent=self.request.user)


class StudentGradesView(generics.ListAPIView):
    serializer_class = StudentGradesSerializer
    permission_classes = [IsAuthenticated, IsParent]
    def get_queryset(self):
        qs = GradeRecord.objects.filter(student__parent=self.request.user)
        sid, term = self.request.query_params.get("studentId"), self.request.query_params.get("term")
        if sid: qs = qs.filter(student__id=sid)
        if term: qs = qs.filter(term__name=term)
        return qs.select_related("student", "subject", "term", "uploaded_by")

class ResultDownloadView(generics.RetrieveAPIView):
    permission_classes = [IsAuthenticated, IsParent]
    def get(self, request, result_id):
        result = get_object_or_404(GradeRecord, id=result_id, student__parent=request.user)
        if not result.file: return Response({"error": "No file"}, status=404)
        return FileResponse(result.file.open(), as_attachment=True, filename=result.file.name)

class StudentAttendanceView(generics.ListAPIView):
    serializer_class = StudentAttendanceSerializer
    permission_classes = [IsAuthenticated, IsParent]
    def get_queryset(self):
        sid, term = self.request.query_params.get("studentId"), self.request.query_params.get("term")
        qs = AttendanceRecord.objects.filter(student__id=sid, student__parent=self.request.user)
        return qs.order_by("date")

class StudentFeeView(generics.RetrieveAPIView):
    serializer_class = FeeSerializer
    permission_classes = [IsAuthenticated, IsParent]
    def get_object(self):
        return get_object_or_404(Fee, student__id=self.request.query_params.get("studentId"), student__parent=self.request.user)
class GradeBulkUploadView(generics.CreateAPIView):
    """
    Upload multiple grade records in bulk.
    Expected payload: list of grade objects.
    """
    queryset = GradeRecord.objects.all()
    serializer_class = StudentGradesSerializer  # or create a dedicated GradeRecordSerializer
    permission_classes = [IsAuthenticated, IsTeacher]

    def create(self, request, *args, **kwargs):
        # Handle bulk insert
        data = request.data if isinstance(request.data, list) else [request.data]
        serializer = self.get_serializer(data=data, many=True)
        serializer.is_valid(raise_exception=True)
        self.perform_create(serializer)
        return Response(serializer.data, status=201)

class EventView(generics.ListCreateAPIView):
    queryset = Event.objects.all().order_by("-start") 
    serializer_class = EventSerializer
    permission_classes = [IsAuthenticated]  



class FeePaymentView(generics.CreateAPIView):
    serializer_class = FeePaymentSerializer
    permission_classes = [IsAuthenticated, IsParent]
    def create(self, request, *args, **kwargs):
        s_id, amt, method, tx = request.data.get("studentId"), request.data.get("amount"), request.data.get("paymentMethod"), request.data.get("transactionId")
        fee = get_object_or_404(Fee, student__id=s_id, student__parent=request.user)
        fee.paid_amount = F("paid_amount") + amt; fee.save(update_fields=["paid_amount"]); fee.refresh_from_db()
        payment = Payment.objects.create(fee=fee, amount=amt, method=method, transaction_id=tx)
        return Response({"status": "success", "newBalance": fee.total_fee - fee.paid_amount, "payment": PaymentSerializer(payment).data}, status=201)

class StudentPaymentHistoryView(generics.ListAPIView):
    serializer_class = PaymentSerializer
    permission_classes = [IsAuthenticated, IsParent]
    def get_queryset(self):
        fee = get_object_or_404(Fee, student__id=self.request.query_params.get("studentId"), student__parent=self.request.user)
        return Payment.objects.filter(fee=fee).order_by("-date")

class MessageListCreateView(generics.ListCreateAPIView):
    serializer_class = MessageSerializer
    permission_classes = [IsAuthenticated, IsParent]
    def get_queryset(self): return Message.objects.filter(parent=self.request.user).order_by("-created_at")
    def perform_create(self, serializer): serializer.save(parent=self.request.user)

class FeedbackCreateView(generics.CreateAPIView):
    serializer_class = FeedbackSerializer
    permission_classes = [IsAuthenticated, IsParent]
    def perform_create(self, serializer): serializer.save(parent=self.request.user)

class FeedbackListView(generics.ListAPIView):
    serializer_class = FeedbackSerializer
    permission_classes = [IsAuthenticated, IsParent]
    def get_queryset(self): return Feedback.objects.filter(parent=self.request.user).order_by("-timestamp")

class ConsentListView(generics.ListAPIView):
    serializer_class = ConsentSerializer
    permission_classes = [IsAuthenticated, IsParent]

    def get_queryset(self):
        user = self.request.user
        return Consent.objects.filter(student__parent=user)  # if ForeignKey
        # OR if ManyToMany:
        # return Consent.objects.filter(student__parents=user)

class ConsentUpdateView(generics.UpdateAPIView):
    serializer_class = ConsentSerializer
    permission_classes = [IsAuthenticated, IsParent]
    lookup_field = "id"
    def get_queryset(self): return Consent.objects.filter(student__parent=self.request.user)

class EventListView(generics.ListAPIView):
    serializer_class = EventSerializer
    permission_classes = [IsAuthenticated]
    def get_queryset(self):
        qs = Event.objects.filter(Q(target_audience="all") | Q(target_audience="parents"))
        return qs.order_by("start")

# ----------------------
# ADMIN & TEACHER VIEWS
# ----------------------
class StudentListCreateView(generics.ListCreateAPIView):
    queryset = Student.objects.all()
    serializer_class = StudentSerializer
    permission_classes = [IsAuthenticated, IsTeacher|IsAdmin]

class TeacherView(generics.ListCreateAPIView):
    queryset = Teacher.objects.all()
    serializer_class = TeacherSerializer
    permission_classes = [IsAuthenticated, IsAdmin]

# class TeacherView(generics.ListCreateAPIView):
#     queryset = Teacher.objects.all()
#     serializer_class = TeacherSerializer

class ParentListView(generics.ListAPIView):
    queryset = Parent.objects.select_related("user").all()
    serializer_class = ParentSerializer
    permission_classes = [IsAuthenticated, IsAdmin|IsTeacher]

class AttendanceBulkUploadView(generics.CreateAPIView):
    queryset = AttendanceRecord.objects.all()
    serializer_class = AttendanceRecordSerializer
    permission_classes = [IsAuthenticated, IsTeacher]

class AttendanceReportView(APIView):
    def get(self, request, *args, **kwargs):
        attendance_data = AttendanceRecord.objects.select_related("student").all()

        report = {}
        for record in attendance_data:
            student_name = record.student.name
            if student_name not in report:
                report[student_name] = {"present": 0, "absent": 0}
            if record.status.lower() == "present":
                report[student_name]["present"] += 1
            else:
                report[student_name]["absent"] += 1

        return Response(report)

class StudentFlagView(generics.CreateAPIView):
    queryset = StudentFlag.objects.all()
    serializer_class = StudentFlagSerializer
    permission_classes = [IsAuthenticated, IsTeacher]


class StudentDetailView(generics.RetrieveAPIView):
    queryset = Student.objects.all()
    serializer_class = StudentSerializer

class FeedbackView(generics.ListAPIView):
    queryset = Feedback.objects.all()
    serializer_class = FeedbackSerializer
    permission_classes = [IsAuthenticated, IsAdmin|IsTeacher]

class SMSCampaignView(generics.ListCreateAPIView):
    queryset = SMSCampaign.objects.all()
    serializer_class = SMSCampaignSerializer
    permission_classes = [IsAuthenticated, IsAdmin]

class AuditLogView(generics.ListAPIView):
    queryset = AuditLog.objects.all()
    serializer_class = AuditLogSerializer
    permission_classes = [IsAuthenticated, IsAdmin]

class USSDConfigView(generics.CreateAPIView):
    queryset = USSDConfig.objects.all()
    serializer_class = USSDConfigSerializer
    permission_classes = [IsAuthenticated, IsAdmin]
    
class EventCreateView(generics.CreateAPIView):
    queryset = Event.objects.all()
    serializer_class = EventSerializer

    def perform_create(self, serializer):
        event = serializer.save()
        recipients = list(Parent.objects.values_list("user__phone_number", flat=True))
        event_date = event.start.strftime("%d %B %Y")  # e.g., 25 September 2025
        message = f"📢 Dear Parent, upcoming event: {event.title} on {event_date}"

    
        send_sms(recipients, message)


# class ConsentCreateView(generics.CreateAPIView):
#     queryset = Consent.objects.all()
#     serializer_class = ConsentSerializer
#     permission_classes = [IsAuthenticated]  # or custom IsAdmin/IsTeacher

#     def perform_create(self, serializer):
#         consent = serializer.save()
#         recipients = [
#             p.user.phone_number for p in consent.parents.all() if p.user.phone_number
#         ]
#         message = f"📝 Consent required for {consent.student.name}: {consent.message}"
#         if recipients:
#             send_sms(recipients, message)
#         else:
#             print("⚠️ No parent phone numbers found for this consent. SMS not sent.")
