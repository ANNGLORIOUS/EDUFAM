from django.shortcuts import get_object_or_404
from django.db import transaction
from django.utils import timezone
from django.conf import settings
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

from .models import (
    Parent, Student, FeeAccount, Payment, MessageThread, Message, Consent,
    User, OTP, PasswordResetToken
)
from .serializers import (
    MyTokenObtainPairSerializer,
    UserRegistrationSerializer, OTPRequestSerializer, OTPVerifySerializer,
    GoogleAuthSerializer, PasswordChangeSerializer,
    PasswordResetRequestSerializer, PasswordResetConfirmSerializer,
    ParentProfileSerializer, MessageThreadSerializer, MessageSerializer, MessageCreateSerializer,
    FeePaymentSerializer, ConsentSerializer, ConsentActionSerializer
)
from .permissions import IsParent, IsParentOfStudent
from .services import MockSMSService, EmailService ,PasswordResetService
from .tasks import send_payment_sms, send_message_notification


logger = logging.getLogger(__name__)

def get_tokens_for_user(user):
    refresh = RefreshToken.for_user(user)
    return {
        'refresh': str(refresh),
        'access': str(refresh.access_token)
    }
# -----------------------
# AUTHENTICATION VIEWS
# -----------------------

class MyTokenObtainPairView(TokenObtainPairView):
    serializer_class = MyTokenObtainPairSerializer


class RegisterView(generics.CreateAPIView):
    queryset = get_user_model().objects.all()
    permission_classes = [AllowAny]
    serializer_class = UserRegistrationSerializer

class LoginView(APIView):    
    permission_classes = [AllowAny]

    def post(self, request):
        username = request.data.get("username")
        password = request.data.get("password")

        user = authenticate(request, username=username, password=password)
        if not user:
            return Response({"detail": "Invalid credentials"}, status=status.HTTP_401_UNAUTHORIZED)
        
        otp = OTP.objects.create(
            phone_number=user.phone_number,
            email=user.email,
            otp_type="login"
        )

        if user.phone_number:
            MockSMSService.send_sms(user.phone_number, f"Your OTP is {otp.code}")
        elif user.email:
            EmailService.send_email(
                subject="Your Login OTP",
                message=f"Your OTP is {otp.code}",
                recipient_list=[user.email]
            )

        return Response(
            {"detail": "OTP sent. Please verify to complete login."},
            status=status.HTTP_200_OK
        )
        
class OTPRequestView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        serializer = OTPRequestSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        phone = serializer.validated_data.get("phone_number")
        email = serializer.validated_data.get("email")
        otp_type = serializer.validated_data.get("otp_type")

        otp = OTP.objects.create(
            phone_number=phone,
            email=email,
            otp_type=otp_type
        )
        if phone:
            MockSMSService.send_otp(phone, otp.code, otp_type)
        if email:
            EmailService.send_otp_email(email, otp.code, otp_type)

        return Response({"detail": "OTP sent successfully"}, status=200)

class OTPVerifyView(APIView):
    permission_classes = [AllowAny]
    serializer_class = OTPVerifySerializer

    def post(self, request):
        serializer = self.serializer_class(data=request.data)
        serializer.is_valid(raise_exception=True)
        otp = serializer.validated_data["otp_instance"]
        otp.is_used = True
        otp.save()

        user = User.objects.filter(phone_number=otp.phone_number).first() \
            or User.objects.filter(email=otp.email).first()

        if not user:
            return Response({"detail": "User not found"}, status=status.HTTP_404_NOT_FOUND)

        if otp.phone_number:
            user.is_phone_verified = True
        if otp.email:
            user.is_email_verified = True
        user.save()

        refresh = RefreshToken.for_user(user)
        return Response(
            {
                "refresh": str(refresh),
                "access": str(refresh.access_token),
                "user": {
                    "id": user.id,
                    "username": user.username,
                    "email": user.email,
                    "phone_number": user.phone_number,
                    "user_type": user.user_type,
                },
            },
            status=status.HTTP_200_OK
        )


class GoogleAuthView(generics.GenericAPIView):
    serializer_class = GoogleAuthSerializer
    permission_classes = [AllowAny]

    def post(self, request):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        google_token = serializer.validated_data["token"]

        try:
            idinfo = id_token.verify_oauth2_token(
                google_token, google_requests.Request(), settings.GOOGLE_CLIENT_ID
            )
            email = idinfo.get("email")
            if not email:
                return Response(
                    {"error": "Email not provided by Google"},
                    status=status.HTTP_400_BAD_REQUEST
                )

            first_name = idinfo.get("given_name", "")
            last_name = idinfo.get("family_name", "")

            user, created = User.objects.get_or_create(
                email=email,
                defaults={
                    "username": email.split("@")[0],
                    "first_name": first_name,
                    "last_name": last_name,
                    "is_active": True,
                    "is_email_verified": True,
                }
            )

            refresh = RefreshToken.for_user(user)
            tokens = {
                "refresh": str(refresh),
                "access": str(refresh.access_token),
            }

            return Response(
                {
                    "message": "Google login successful",
                    "user": {
                        "id": user.id,
                        "username": user.username,
                        "email": user.email,
                        "user_type": user.user_type,
                        "first_name": user.first_name,
                        "last_name": user.last_name,
                        "is_new_user": created,
                    },
                    **tokens,
                },
                status=status.HTTP_200_OK
            )

        except ValueError as e:
            return Response(
                {"error": "Invalid Google token", "details": str(e)},
                status=status.HTTP_400_BAD_REQUEST
            )
            
class LogoutView(APIView):
    permission_classes = [IsAuthenticated]
    def post(self, request):
        refresh_token = request.data.get("refresh")
        if not refresh_token:
            return Response({"detail": "Refresh token required."}, status=status.HTTP_400_BAD_REQUEST)

        try:
            token = RefreshToken(refresh_token)
            token.blacklist()
            return Response(
                {"detail": "Successfully logged out."},
                status=status.HTTP_205_RESET_CONTENT
            )
        except Exception as e:
            return Response(
                {"detail": "Invalid or expired refresh token."},
                status=status.HTTP_400_BAD_REQUEST
            )

class PasswordChangeView(APIView):
    permission_classes = [IsAuthenticated]
    def post(self, request):
        serializer = PasswordChangeSerializer(data=request.data, context={'request': request})
        serializer.is_valid(raise_exception=True)
        serializer.save()
        update_session_auth_hash(request, request.user)  
        return Response({"detail": "Password changed successfully"}, status=status.HTTP_200_OK)


class PasswordResetRequestView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        serializer = PasswordResetRequestSerializer(data=request.data)
        if serializer.is_valid():
            email = serializer.validated_data.get('email')

            try:
                user = User.objects.get(email=email)
                PasswordResetToken.objects.filter(user=user, is_used=False).update(is_used=True)

                reset_token = PasswordResetToken.objects.create(user=user)

                success = PasswordResetService.send_password_reset_email(
                    user_email=user.email,
                    token=reset_token.token,
                    username=user.username
                )

                if success:
                    logger.info(f"Password reset email sent to {email}")
                else:
                    logger.error(f"Failed to send reset email to {email}")

            except User.DoesNotExist:
                logger.info(f"Password reset requested for non-existent email: {email}")
                pass

            return Response({
                "message": "If an account with that email exists, a reset link has been sent.",
                "expires_in": 3600
            })

        return Response({
            "error": "Invalid request data",
            "details": serializer.errors
        }, status=status.HTTP_400_BAD_REQUEST)

class PasswordResetConfirmView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        serializer = PasswordResetConfirmSerializer(data=request.data)
        if serializer.is_valid():
            token = serializer.validated_data.get('token')
            new_password = serializer.validated_data.get('new_password')

            try:
                reset_token = PasswordResetToken.objects.get(token=token, is_used=False)

                if not reset_token.is_valid():
                    return Response({
                        "error": "Reset link has expired. Please request a new one."
                    }, status=status.HTTP_400_BAD_REQUEST)

                user = reset_token.user
                user.set_password(new_password)
                user.save()

                reset_token.is_used = True
                reset_token.save()

                logger.info(f"Password reset completed for user {user.username}")

                tokens = get_tokens_for_user(user)

                return Response({
                    "message": "Password reset successful. You are now logged in.",
                    "user": {
                        "id": user.id,
                        "username": user.username,
                        "email": user.email,
                    },
                    **tokens
                })

            except PasswordResetToken.DoesNotExist:
                return Response({
                    "error": "Invalid or expired reset link"
                }, status=status.HTTP_400_BAD_REQUEST)

        return Response({
            "error": "Invalid request data",
            "details": serializer.errors
        }, status=status.HTTP_400_BAD_REQUEST)

# -----------------------
# PARENT-SIDE VIEWS
# -----------------------

class ParentProfileView(APIView):
    permission_classes = [IsAuthenticated, IsParent]
    def get(self, request):
        parent = get_object_or_404(Parent, user=request.user)
        serializer = ParentProfileSerializer(parent)
        return Response(serializer.data)


# class StudentSummaryView(APIView):
#     permission_classes = [IsAuthenticated, IsParentOfStudent]
#     def get(self, request, student_id):
#         student = get_object_or_404(Student, id=student_id)
#         self.check_object_permissions(request, student)

#         serializer = StudentSummarySerializer(student)
#         return Response(serializer.data)


# class StudentGradesView(APIView):
#     permission_classes = [IsAuthenticated, IsParentOfStudent]
#     def get(self, request, student_id):
#         student = get_object_or_404(Student, id=student_id)
#         self.check_object_permissions(request, student)

#         grades = []

#         return Response({
#             "student": student.get_full_name(),
#             "grades": grades
#         }, status=status.HTTP_200_OK)


# class StudentAttendanceView(APIView):
#     permission_classes = [IsAuthenticated, IsParentOfStudent]

#     def get(self, request, student_id):
#         student = get_object_or_404(Student, id=student_id)
#         self.check_object_permissions(request, student)

#         attendance = []

#         return Response({
#             "student": student.get_full_name(),
#             "attendance": attendance
#         }, status=status.HTTP_200_OK)


class MessageThreadListCreateView(generics.ListCreateAPIView):
    permission_classes = [IsAuthenticated, IsParent]
    serializer_class = MessageThreadSerializer

    def get_queryset(self):
        return self.request.user.message_threads.all()

    def perform_create(self, serializer):
        thread = serializer.save()
        thread.participants.add(self.request.user)


class MessageListCreateView(generics.ListCreateAPIView):
    permission_classes = [IsAuthenticated, IsParent]
    serializer_class = MessageSerializer

    def get_queryset(self):
        thread_id = self.kwargs['thread_id']
        return Message.objects.filter(thread_id=thread_id)

    def perform_create(self, serializer):
        thread_id = self.kwargs['thread_id']
        thread = get_object_or_404(MessageThread, id=thread_id)
        serializer.save(sender=self.request.user, thread=thread)
        send_message_notification.delay(thread.id)


class FeePaymentView(generics.CreateAPIView):
    permission_classes = [IsAuthenticated, IsParent]
    serializer_class = FeePaymentSerializer

    @transaction.atomic
    def perform_create(self, serializer):
        payment = serializer.save(paid_by=self.request.user.parent_profile)
        send_payment_sms.delay(payment.id)


class ConsentView(generics.ListCreateAPIView):
    permission_classes = [IsAuthenticated, IsParent]
    serializer_class = ConsentSerializer

    def get_queryset(self):
        return Consent.objects.filter(parent=self.request.user.parent_profile)


class ConsentActionView(APIView):
    permission_classes = [IsAuthenticated, IsParent]

    def post(self, request, consent_id):
        consent = get_object_or_404(Consent, id=consent_id, parent=request.user.parent_profile)
        serializer = ConsentActionSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        action = serializer.validated_data.get("action")
        if action == "grant":
            consent.grant_consent()
        else:
            consent.revoke_consent()

        return Response(ConsentSerializer(consent).data, status=status.HTTP_200_OK)
