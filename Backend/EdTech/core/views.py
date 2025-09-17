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
from .services import MockSMSService, EmailService
from .tasks import send_payment_sms, send_message_notification


logger = logging.getLogger(__name__)


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
        
class OTPRequestView(generics.CreateAPIView):
    permission_classes = [AllowAny]
    serializer_class = OTPRequestSerializer


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

    def post(self, request):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        return Response(serializer.validated_data, status=status.HTTP_200_OK)

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


class PasswordResetRequestView(generics.CreateAPIView):
    permission_classes = [AllowAny]
    serializer_class = PasswordResetRequestSerializer


class PasswordResetConfirmView(generics.CreateAPIView):
    permission_classes = [AllowAny]
    serializer_class = PasswordResetConfirmSerializer


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
