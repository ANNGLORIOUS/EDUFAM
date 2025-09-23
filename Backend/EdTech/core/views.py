from django.shortcuts import get_object_or_404
from django.conf import settings
from django.db.models import F
from django.http import FileResponse
from django.contrib.auth import authenticate, get_user_model, update_session_auth_hash
from django.db.models import Q
from rest_framework import generics, status, permissions
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework_simplejwt.views import TokenObtainPairView
from rest_framework_simplejwt.tokens import RefreshToken
from google.oauth2 import id_token
from google.auth.transport import requests as google_requests
import logging
from .models import ( User , Student,Result,Attendance, Message, Fee,Feedback, Payment, Consent, Event)

from .serializers import (
    ParentProfileSerializer, MessageSerializer, EventSerializer,StudentSummarySerializer,
    FeeSerializer,PaymentSerializer, ConsentSerializer,FeePaymentSerializer,StudentGradesSerializer,StudentAttendanceSerializer,FeedbackSerializer)
from .permissions import IsParent, IsParentOfStudent
from .tasks import send_payment_sms, send_message_notification


logger = logging.getLogger(__name__)


# -----------------------
# DRF AUTHENTICATION
# -----------------------
# def get_tokens_for_user(user):
#     refresh = RefreshToken.for_user(user)
#     return {
#         'refresh': str(refresh),
#         'access': str(refresh.access_token)
#     }
# # -----------------------
# # AUTHENTICATION VIEWS
# # -----------------------

# class MyTokenObtainPairView(TokenObtainPairView):
#     serializer_class = MyTokenObtainPairSerializer


# class RegisterView(generics.CreateAPIView):
#     queryset = get_user_model().objects.all()
#     permission_classes = [AllowAny]
#     serializer_class = UserRegistrationSerializer

# class LoginView(APIView):    
#     permission_classes = [AllowAny]

#     def post(self, request):
#         username = request.data.get("username")
#         password = request.data.get("password")

#         user = authenticate(request, username=username, password=password)
#         if not user:
#             return Response({"detail": "Invalid credentials"}, status=status.HTTP_401_UNAUTHORIZED)
        
#         otp = OTP.objects.create(
#             phone_number=user.phone_number,
#             email=user.email,
#             otp_type="login"
#         )

#         if user.phone_number:
#             MockSMSService.send_sms(user.phone_number, f"Your OTP is {otp.code}")
#         elif user.email:
#             EmailService.send_email(
#                 subject="Your Login OTP",
#                 message=f"Your OTP is {otp.code}",
#                 recipient_email=user.email
#             )

#         return Response(
#             {"detail": "OTP sent. Please verify to complete login."},
#             status=status.HTTP_200_OK
#         )
        
# class OTPRequestView(APIView):
#     permission_classes = [AllowAny]

#     def post(self, request):
#         serializer = OTPRequestSerializer(data=request.data)
#         serializer.is_valid(raise_exception=True)

#         phone = serializer.validated_data.get("phone_number")
#         email = serializer.validated_data.get("email")
#         otp_type = serializer.validated_data.get("otp_type")

#         otp = OTP.objects.create(
#             phone_number=phone,
#             email=email,
#             otp_type=otp_type
#         )
#         if phone:
#             MockSMSService.send_otp(phone, otp.code, otp_type)
#         if email:
#             EmailService.send_otp_email(email, otp.code, otp_type)

#         return Response({"detail": "OTP sent successfully"}, status=200)

# class OTPVerifyView(APIView):
#     permission_classes = [AllowAny]
#     serializer_class = OTPVerifySerializer

#     def post(self, request):
#         serializer = self.serializer_class(data=request.data)
#         serializer.is_valid(raise_exception=True)
#         otp = serializer.validated_data["otp_instance"]
#         otp.is_used = True
#         otp.save()

#         user = User.objects.filter(phone_number=otp.phone_number).first() \
#             or User.objects.filter(email=otp.email).first()

#         if not user:
#             return Response({"detail": "User not found"}, status=status.HTTP_404_NOT_FOUND)

#         if otp.phone_number:
#             user.is_phone_verified = True
#         if otp.email:
#             user.is_email_verified = True
#         user.save()

#         refresh = RefreshToken.for_user(user)
#         return Response(
#             {
#                 "refresh": str(refresh),
#                 "access": str(refresh.access_token),
#                 "user": {
#                     "id": user.id,
#                     "username": user.username,
#                     "email": user.email,
#                     "phone_number": user.phone_number,
#                     "user_type": user.user_type,
#                 },
#             },
#             status=status.HTTP_200_OK
#         )


# class GoogleAuthView(generics.GenericAPIView):
#     serializer_class = GoogleAuthSerializer
#     permission_classes = [AllowAny]

#     def post(self, request):
#         serializer = self.get_serializer(data=request.data)
#         serializer.is_valid(raise_exception=True)
#         google_token = serializer.validated_data["token"]

#         try:
#             idinfo = id_token.verify_oauth2_token(
#                 google_token, google_requests.Request(), settings.GOOGLE_CLIENT_ID
#             )
#             email = idinfo.get("email")
#             if not email:
#                 return Response(
#                     {"error": "Email not provided by Google"},
#                     status=status.HTTP_400_BAD_REQUEST
#                 )

#             first_name = idinfo.get("given_name", "")
#             last_name = idinfo.get("family_name", "")

#             user, created = User.objects.get_or_create(
#                 email=email,
#                 defaults={
#                     "username": email.split("@")[0],
#                     "first_name": first_name,
#                     "last_name": last_name,
#                     "is_active": True,
#                     "is_email_verified": True,
#                 }
#             )

#             refresh = RefreshToken.for_user(user)
#             tokens = {
#                 "refresh": str(refresh),
#                 "access": str(refresh.access_token),
#             }

#             return Response(
#                 {
#                     "message": "Google login successful",
#                     "user": {
#                         "id": user.id,
#                         "username": user.username,
#                         "email": user.email,
#                         "user_type": user.user_type,
#                         "first_name": user.first_name,
#                         "last_name": user.last_name,
#                         "is_new_user": created,
#                     },
#                     **tokens,
#                 },
#                 status=status.HTTP_200_OK
#             )

#         except ValueError as e:
#             return Response(
#                 {"error": "Invalid Google token", "details": str(e)},
#                 status=status.HTTP_400_BAD_REQUEST
#             )
            
# class LogoutView(APIView):
#     permission_classes = [IsAuthenticated]
#     def post(self, request):
#         refresh_token = request.data.get("refresh")
#         if not refresh_token:
#             return Response({"detail": "Refresh token required."}, status=status.HTTP_400_BAD_REQUEST)

#         try:
#             token = RefreshToken(refresh_token)
#             token.blacklist()
#             return Response(
#                 {"detail": "Successfully logged out."},
#                 status=status.HTTP_205_RESET_CONTENT
#             )
#         except Exception as e:
#             return Response(
#                 {"detail": "Invalid or expired refresh token."},
#                 status=status.HTTP_400_BAD_REQUEST
#             )

# class PasswordChangeView(APIView):
#     permission_classes = [IsAuthenticated]
#     def post(self, request):
#         serializer = PasswordChangeSerializer(data=request.data, context={'request': request})
#         serializer.is_valid(raise_exception=True)
#         serializer.save()
#         update_session_auth_hash(request, request.user)  
#         return Response({"detail": "Password changed successfully"}, status=status.HTTP_200_OK)


# class PasswordResetRequestView(APIView):
#     permission_classes = [AllowAny]

#     def post(self, request):
#         serializer = PasswordResetRequestSerializer(data=request.data)
#         if serializer.is_valid():
#             email = serializer.validated_data.get('email')

#             try:
#                 user = User.objects.get(email=email)
#                 PasswordResetToken.objects.filter(user=user, is_used=False).update(is_used=True)

#                 reset_token = PasswordResetToken.objects.create(user=user)

#                 success = PasswordResetService.send_password_reset_email(
#                     user_email=user.email,
#                     token=reset_token.token,
#                     username=user.username
#                 )

#                 if success:
#                     logger.info(f"Password reset email sent to {email}")
#                 else:
#                     logger.error(f"Failed to send reset email to {email}")

#             except User.DoesNotExist:
#                 logger.info(f"Password reset requested for non-existent email: {email}")
#                 pass

#             return Response({
#                 "message": "If an account with that email exists, a reset link has been sent.",
#                 "expires_in": 3600
#             })

#         return Response({
#             "error": "Invalid request data",
#             "details": serializer.errors
#         }, status=status.HTTP_400_BAD_REQUEST)

# class PasswordResetConfirmView(APIView):
#     permission_classes = [AllowAny]

#     def post(self, request):
#         serializer = PasswordResetConfirmSerializer(data=request.data)
#         if serializer.is_valid():
#             token = serializer.validated_data.get('token')
#             new_password = serializer.validated_data.get('new_password')

#             try:
#                 reset_token = PasswordResetToken.objects.get(token=token, is_used=False)

#                 if not reset_token.is_valid():
#                     return Response({
#                         "error": "Reset link has expired. Please request a new one."
#                     }, status=status.HTTP_400_BAD_REQUEST)

#                 user = reset_token.user
#                 user.set_password(new_password)
#                 user.save()

#                 reset_token.is_used = True
#                 reset_token.save()

#                 logger.info(f"Password reset completed for user {user.username}")

#                 tokens = get_tokens_for_user(user)

#                 return Response({
#                     "message": "Password reset successful. You are now logged in.",
#                     "user": {
#                         "id": user.id,
#                         "username": user.username,
#                         "email": user.email,
#                     },
#                     **tokens
#                 })

#             except PasswordResetToken.DoesNotExist:
#                 return Response({
#                     "error": "Invalid or expired reset link"
#                 }, status=status.HTTP_400_BAD_REQUEST)

#         return Response({
#             "error": "Invalid request data",
#             "details": serializer.errors
#         }, status=status.HTTP_400_BAD_REQUEST)


# -----------------------
# CLERK AUTHENTICATION
# -----------------------



# -----------------------
# PARENT-SIDE VIEWS
# -----------------------


class ParentProfileView(generics.RetrieveAPIView):
    permission_classes = [IsAuthenticated]
    serializer_class = ParentProfileSerializer

    def get_object(self):
        return self.request.user


class StudentSummaryView(generics.ListAPIView):
    permission_classes = [IsAuthenticated]
    serializer_class = StudentSummarySerializer

    def get_queryset(self):
        return Student.objects.filter(parent=self.request.user)


class StudentGradesView(generics.ListAPIView):

    permission_classes = [IsAuthenticated]
    serializer_class = StudentGradesSerializer

    def get_queryset(self):
        student_id = self.request.query_params.get("studentId")
        term = self.request.query_params.get("term")
        queryset = Result.objects.filter(student__parent=self.request.user)

        if student_id:
            queryset = queryset.filter(student__id=student_id)

        if term:
            queryset = queryset.filter(term__name=term)

        return queryset.select_related("student", "subject", "term", "uploaded_by")


class ResultDownloadView(generics.RetrieveAPIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, result_id, *args, **kwargs):
        result = get_object_or_404(Result, id=result_id, student__parent=request.user)
        if not result.file:
            return Response({"error": "No file available"}, status=status.HTTP_404_NOT_FOUND)
        return FileResponse(result.file.open(), as_attachment=True, filename=result.file.name)


class StudentAttendanceView(generics.ListAPIView):
    permission_classes = [IsAuthenticated]
    serializer_class = StudentAttendanceSerializer

    def get_queryset(self):
        student_id = self.request.query_params.get("studentId")
        term = self.request.query_params.get("term")
        queryset = Attendance.objects.filter(student__id=student_id, student__parent=self.request.user)
        if term:
            term_obj = Result.objects.filter(student__id=student_id, term__name=term).first()
            if term_obj:
                queryset = queryset.filter(date__gte=term_obj.term.start_date,
                                           date__lte=term_obj.term.end_date)
        return queryset.order_by('date')



class StudentFeeView(generics.RetrieveAPIView):
    permission_classes = [IsAuthenticated]
    serializer_class = FeeSerializer

    def get_object(self):
        student_id = self.request.query_params.get("studentId")
        return get_object_or_404(Fee, student__id=student_id, student__parent=self.request.user)


class FeePaymentView(generics.CreateAPIView):
    permission_classes = [IsAuthenticated]
    serializer_class = FeePaymentSerializer

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        student_id = serializer.validated_data["studentId"]
        amount = serializer.validated_data["amount"]
        method = serializer.validated_data["paymentMethod"]
        transaction_id = serializer.validated_data["transactionId"]

        fee = get_object_or_404(Fee, student__id=student_id, student__parent=request.user)
        fee.paid_amount = F('paid_amount') + amount
        fee.save(update_fields=['paid_amount'])
        fee.refresh_from_db()

        payment = Payment.objects.create(
            fee=fee,
            amount=amount,
            method=method,
            transaction_id=transaction_id
        )

        return Response({
            "status": "success",
            "message": "Payment recorded successfully",
            "newBalance": fee.total_fee - fee.paid_amount,
            "payment": PaymentSerializer(payment).data
        }, status=status.HTTP_201_CREATED)


class StudentPaymentHistoryView(generics.ListAPIView):
    permission_classes = [IsAuthenticated]
    serializer_class = PaymentSerializer

    def get_queryset(self):
        student_id = self.request.query_params.get("studentId")
        fee = get_object_or_404(Fee, student__id=student_id, student__parent=self.request.user)
        return Payment.objects.filter(fee=fee).order_by('-date')



class MessageListCreateView(generics.ListCreateAPIView):
    permission_classes = [IsAuthenticated]
    serializer_class = MessageSerializer

    def get_queryset(self):
        return Message.objects.filter(parent=self.request.user).order_by('-created_at')

    def perform_create(self, serializer):
        serializer.save(parent=self.request.user)


class FeedbackCreateView(generics.CreateAPIView):
    permission_classes = [IsAuthenticated]
    serializer_class = FeedbackSerializer

    def perform_create(self, serializer):
        serializer.save(parent=self.request.user)


class FeedbackListView(generics.ListAPIView):
    permission_classes = [IsAuthenticated]
    serializer_class = FeedbackSerializer

    def get_queryset(self):
        status_param = self.request.query_params.get("status")
        queryset = Feedback.objects.filter(parent=self.request.user)
        if status_param:
            queryset = queryset.filter(status=status_param)
        return queryset.order_by('-timestamp')



class ConsentListView(generics.ListAPIView):
    permission_classes = [IsAuthenticated]
    serializer_class = ConsentSerializer

    def get_queryset(self):
        return Consent.objects.filter(student__parent=self.request.user)


class ConsentUpdateView(generics.UpdateAPIView):
    permission_classes = [IsAuthenticated]
    serializer_class = ConsentSerializer
    lookup_field = "id"

    def get_queryset(self):
        return Consent.objects.filter(student__parent=self.request.user)


class EventListView(generics.ListAPIView):
    permission_classes = [IsAuthenticated]
    serializer_class = EventSerializer

    def get_queryset(self):
        queryset = Event.objects.filter(
            Q(target_audience="all") | Q(target_audience="parents")
        )

        start_date = self.request.query_params.get("start")
        end_date = self.request.query_params.get("end")
        if start_date and end_date:
            queryset = queryset.filter(start__gte=start_date, end__lte=end_date)

        return queryset.order_by("start")
