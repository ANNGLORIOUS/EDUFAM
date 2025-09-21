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


from .models import (
    User, OTP, Student, Teacher, Parent, Attendance, Result, Message, Fee, Feedback,
    Payment, Consent, Event, StudentFlag, AuditLog, USSDConfig, SMSCampaign
)
from .serializers import (
    MyTokenObtainPairSerializer, UserRegistrationSerializer, OTPRequestSerializer, OTPVerifySerializer,
    GoogleAuthSerializer, PasswordChangeSerializer, PasswordResetRequestSerializer, PasswordResetConfirmSerializer,
    ParentProfileSerializer, MessageSerializer, EventSerializer, StudentSummarySerializer,
    FeeSerializer, PaymentSerializer, ConsentSerializer, FeePaymentSerializer, StudentGradesSerializer,
    StudentAttendanceSerializer, FeedbackSerializer, StudentSerializer, ParentSerializer, TeacherSerializer,
    AttendanceSerializer, StudentFlagSerializer, AuditLogSerializer, USSDConfigSerializer, SMSCampaignSerializer
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
        qs = Result.objects.filter(student__parent=self.request.user)
        sid, term = self.request.query_params.get("studentId"), self.request.query_params.get("term")
        if sid: qs = qs.filter(student__id=sid)
        if term: qs = qs.filter(term__name=term)
        return qs.select_related("student", "subject", "term", "uploaded_by")

class ResultDownloadView(generics.RetrieveAPIView):
    permission_classes = [IsAuthenticated, IsParent]
    def get(self, request, result_id):
        result = get_object_or_404(Result, id=result_id, student__parent=request.user)
        if not result.file: return Response({"error": "No file"}, status=404)
        return FileResponse(result.file.open(), as_attachment=True, filename=result.file.name)

class StudentAttendanceView(generics.ListAPIView):
    serializer_class = StudentAttendanceSerializer
    permission_classes = [IsAuthenticated, IsParent]
    def get_queryset(self):
        sid, term = self.request.query_params.get("studentId"), self.request.query_params.get("term")
        qs = Attendance.objects.filter(student__id=sid, student__parent=self.request.user)
        return qs.order_by("date")

class StudentFeeView(generics.RetrieveAPIView):
    serializer_class = FeeSerializer
    permission_classes = [IsAuthenticated, IsParent]
    def get_object(self):
        return get_object_or_404(Fee, student__id=self.request.query_params.get("studentId"), student__parent=self.request.user)

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
    def get_queryset(self): return Consent.objects.filter(student__parent=self.request.user)

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

class TeacherListView(generics.ListCreateAPIView):
    queryset = Teacher.objects.all()
    serializer_class = TeacherSerializer
    permission_classes = [IsAuthenticated, IsAdmin]

class ParentListView(generics.ListAPIView):
    queryset = Parent.objects.select_related("user").all()
    serializer_class = ParentSerializer
    permission_classes = [IsAuthenticated, IsAdmin|IsTeacher]

class AttendanceBulkUploadView(generics.CreateAPIView):
    queryset = Attendance.objects.all()
    serializer_class = AttendanceSerializer
    permission_classes = [IsAuthenticated, IsTeacher]

class StudentFlagView(generics.CreateAPIView):
    queryset = StudentFlag.objects.all()
    serializer_class = StudentFlagSerializer
    permission_classes = [IsAuthenticated, IsTeacher]

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

@csrf_exempt
def ussd_callback(request):
    # ✅ Optional API Key check
    api_key = request.headers.get("X-API-Key")
    if api_key and api_key != getattr(settings, "AT_USSD_API_KEY", None):
        return HttpResponse("END Unauthorized", content_type="text/plain")

    session_id = request.POST.get("sessionId")
    phone_number = request.POST.get("phoneNumber")
    text = request.POST.get("text", "")

    # ✅ Get dynamic menus
    config = USSDConfig.objects.latest("updated_at")
    menus = config.menu_json.get("menus", {})

    # ✅ Find parent
    try:
        parent = User.objects.get(phone_number=phone_number, user_type="parent")
    except User.DoesNotExist:
        return HttpResponse("END Your number is not registered as a parent. Please contact the school.", content_type="text/plain")

    # ✅ Track navigation path
    steps = text.split("*") if text else []
    node, current = None, menus
    for step in steps:
        if step in current:
            node = current[step]
            current = node.get("children", {})
        else:
            return HttpResponse("END Invalid choice", content_type="text/plain")

    # ✅ Handle school-specific actions
    if node and node.get("action") == "student_summary":
        students = parent.students.all()
        if not students:
            return HttpResponse("END No students linked to your account.", content_type="text/plain")
        data = StudentSummarySerializer(students, many=True).data
        msg = "CON Student Summary:\n" + "\n".join(
            [f"- {s['name']} (Class {s['student_class']})" for s in data]
        )
        return HttpResponse(msg, content_type="text/plain")

    elif node and node.get("action") == "fees":
        student = parent.students.first()
        if not student:
            return HttpResponse("END No students linked to your account.", content_type="text/plain")
        try:
            fee = Fee.objects.get(student=student)
            fee_data = FeeSerializer(fee).data
            msg = (
                f"END Fees for {student.name}:\n"
                f"Total: {fee_data['total_fee']}\n"
                f"Paid: {fee_data['paid_amount']}\n"
                f"Balance: {fee_data['due_amount']}"
            )
            return HttpResponse(msg, content_type="text/plain")
        except Fee.DoesNotExist:
            return HttpResponse("END No fee records found.", content_type="text/plain")

    elif node and node.get("action") == "consents":
        consents = Consent.objects.filter(student__parent=parent)
        if not consents:
            return HttpResponse("END No consent records found.", content_type="text/plain")
        data = ConsentSerializer(consents, many=True).data
        msg = "CON Consents:\n" + "\n".join(
            [f"- {c['consent_type']}: {c['status']}" for c in data]
        )
        return HttpResponse(msg, content_type="text/plain")

    elif node and node.get("action") == "events":
        events = Event.objects.filter(date__gte=now().date()).order_by("date")[:5]
        if not events:
            return HttpResponse("END No upcoming events.", content_type="text/plain")
        data = EventSerializer(events, many=True).data
        msg = "END Upcoming Events:\n" + "\n".join(
            [f"- {e['title']} ({e['date']})" for e in data]
        )
        return HttpResponse(msg, content_type="text/plain")

    # ✅ Handle plain END nodes
    if node and node.get("type") == "END":
        return HttpResponse(f"END {node.get('message', 'Goodbye')}", content_type="text/plain")

    # ✅ Render generic menu text
    if node:
        options = "\n".join([f"{k}. {v['text']}" for k, v in current.items()])
        return HttpResponse(f"CON {node['text']}\n{options}", content_type="text/plain")

    # Default: show root menu
    options = "\n".join([f"{k}. {v['text']}" for k, v in menus.items()])
    return HttpResponse(f"CON Welcome to EDUFAM\n{options}", content_type="text/plain")