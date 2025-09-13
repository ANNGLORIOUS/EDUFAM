from rest_framework_simplejwt.views import TokenObtainPairView
from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework_simplejwt.tokens import RefreshToken
from django.contrib.auth import authenticate
from django.db.models import Q
from google.oauth2 import id_token
from google.auth.transport import requests as google_requests
from django.conf import settings
import logging

from .models import User, OTP, PasswordResetToken
from .serializers import (
    MyTokenObtainPairSerializer,
    UserRegistrationSerializer, 
    OTPRequestSerializer, 
    OTPVerifySerializer,
    GoogleAuthSerializer,
    UserProfileSerializer,
    PasswordChangeSerializer,
    PasswordResetRequestSerializer,
    PasswordResetConfirmSerializer
)
from .services import MockSMSService, EmailService, PasswordResetService
from django.contrib.auth import update_session_auth_hash
from django.utils import timezone

class MyTokenObtainPairView(TokenObtainPairView):
    serializer_class = MyTokenObtainPairSerializer

logger = logging.getLogger(__name__)

def get_tokens_for_user(user):
    """Generate JWT tokens for user"""
    refresh = RefreshToken.for_user(user)
    return {
        'access_token': str(refresh.access_token),
        'refresh_token': str(refresh),
    }


# Register user
@api_view(['POST'])
@permission_classes([AllowAny])
def register_user(request):
    """Register a new user"""
    serializer = UserRegistrationSerializer(data=request.data)
    if serializer.is_valid():
        user = serializer.save()
        tokens = get_tokens_for_user(user)
        
        return Response({
            'message': 'User registered successfully',
            'user': {
                'id': user.id,
                'username': user.username,
                'email': user.email,
                'user_type': user.user_type,
                'phone_number': str(user.phone_number) if user.phone_number else None,
            },
            **tokens
        }, status=status.HTTP_201_CREATED)
    
    return Response({
        'error': 'Registration failed',
        'details': serializer.errors
    }, status=status.HTTP_400_BAD_REQUEST)


# Login user
@api_view(['POST'])
@permission_classes([AllowAny])
def login_user(request):
    """Login with username/email and password"""
    username_or_email = request.data.get('username')
    password = request.data.get('password')
    
    if not username_or_email or not password:
        return Response({
            'error': 'Username/email and password are required'
        }, status=status.HTTP_400_BAD_REQUEST)
    
    user = authenticate(username=username_or_email, password=password)
    
    if not user:
        try:
            user_obj = User.objects.get(email=username_or_email)
            user = authenticate(username=user_obj.username, password=password)
        except User.DoesNotExist:
            pass
    
    if user and user.is_active:
        tokens = get_tokens_for_user(user)
        return Response({
            'message': 'Login successful',
            'user': {
                'id': user.id,
                'username': user.username,
                'email': user.email,
                'user_type': user.user_type,
                'phone_number': str(user.phone_number) if user.phone_number else None,
            },
            **tokens
        })
    
    return Response({
        'error': 'Invalid credentials'
    }, status=status.HTTP_401_UNAUTHORIZED)


# Request OTP
@api_view(['POST'])
@permission_classes([AllowAny])
def request_otp(request):
    """Request OTP via SMS or Email"""
    serializer = OTPRequestSerializer(data=request.data)
    if serializer.is_valid():
        phone_number = serializer.validated_data.get('phone_number')
        email = serializer.validated_data.get('email')
        otp_type = serializer.validated_data.get('otp_type', 'login')

        otp = OTP.objects.create(
            phone_number=phone_number,
            email=email,
            otp_type=otp_type
        )

        success = False
        if phone_number:
            result = MockSMSService.send_otp(phone_number, otp.code, otp_type)
            success = result.get('status') == 'success'
        elif email:
            success = EmailService.send_otp_email(email, otp.code, otp_type)

        if success:
            return Response({
                'message': 'OTP sent successfully',
                'expires_in': 600,  
                'otp_type': otp_type,
                'contact': str(phone_number) if phone_number else email
            })
        else:
            return Response({
                'error': 'Failed to send OTP'
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    return Response({
        'error': 'Invalid request data',
        'details': serializer.errors
    }, status=status.HTTP_400_BAD_REQUEST)



# Verify OTP
@api_view(['POST'])
@permission_classes([AllowAny])
def verify_otp(request):
    """Verify OTP and login user"""
    serializer = OTPVerifySerializer(data=request.data)
    if serializer.is_valid():
        phone_number = serializer.validated_data.get('phone_number')
        email = serializer.validated_data.get('email')
        code = serializer.validated_data.get('code')
        
        try:
            otp_query = Q(code=code, is_used=False)
            if phone_number:
                otp_query &= Q(phone_number=phone_number)
            elif email:
                otp_query &= Q(email=email)
            
            otp = OTP.objects.get(otp_query)
            
            if not otp.is_valid():
                return Response({
                    'error': 'OTP has expired or is invalid'
                }, status=status.HTTP_400_BAD_REQUEST)
            
            otp.is_used = True
            otp.save()
            
            user = None
            created = False
            
            if phone_number:
                user, created = User.objects.get_or_create(
                    phone_number=phone_number,
                    defaults={
                        'username': str(phone_number).replace('+', '').replace(' ', ''),
                        'is_phone_verified': True
                    }
                )
            elif email:
                user, created = User.objects.get_or_create(
                    email=email,
                    defaults={
                        'username': email.split('@')[0],
                        'is_email_verified': True
                    }
                )
            
            if user:
                tokens = get_tokens_for_user(user)
                return Response({
                    'message': 'OTP verified successfully',
                    'user': {
                        'id': user.id,
                        'username': user.username,
                        'email': user.email,
                        'user_type': user.user_type,
                        'phone_number': str(user.phone_number) if user.phone_number else None,
                        'is_new_user': created
                    },
                    **tokens
                })
            
        except OTP.DoesNotExist:
            return Response({
                'error': 'Invalid OTP code'
            }, status=status.HTTP_400_BAD_REQUEST)
    
    return Response({
        'error': 'Invalid request data',
        'details': serializer.errors
    }, status=status.HTTP_400_BAD_REQUEST)


# Login with Google OAuth
@api_view(['POST'])
@permission_classes([AllowAny])
def google_login(request):
    """Login with Google OAuth token"""
    serializer = GoogleAuthSerializer(data=request.data)
    if serializer.is_valid():
        token = serializer.validated_data['token']
        
        try:
            idinfo = id_token.verify_oauth2_token(
                    token, google_requests.Request(), settings.GOOGLE_CLIENT_ID
                )
            
            email = idinfo.get('email')
            if not email:
                return Response({
                    'error': 'Email not provided by Google'
                }, status=status.HTTP_400_BAD_REQUEST)
            
            user, created = User.objects.get_or_create(
                email=email,
                defaults={
                    'username': email.split('@')[0],
                    'first_name': idinfo.get('given_name', ''),
                    'last_name': idinfo.get('family_name', ''),
                    'is_active': True,
                    'is_email_verified': True
                }
            )
            
            tokens = get_tokens_for_user(user)
            return Response({
                'message': 'Google login successful',
                'user': {
                    'id': user.id,
                    'username': user.username,
                    'email': user.email,
                    'user_type': user.user_type,
                    'first_name': user.first_name,
                    'last_name': user.last_name,
                    'is_new_user': created
                },
                **tokens
            })
            
        except ValueError as e:
            return Response({
                'error': 'Invalid Google token',
                'details': str(e)
            }, status=status.HTTP_400_BAD_REQUEST)
    
    return Response({
        'error': 'Invalid request data',
        'details': serializer.errors
    }, status=status.HTTP_400_BAD_REQUEST)


# Get user profile
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_profile(request):
    """Get user profile"""
    serializer = UserProfileSerializer(request.user)
    return Response({
        'user': serializer.data
    })


# Update user profile
@api_view(['PUT'])
@permission_classes([IsAuthenticated])
def update_profile(request):
    """Update user profile"""
    serializer = UserProfileSerializer(request.user, data=request.data, partial=True)
    if serializer.is_valid():
        serializer.save()
        return Response({
            'message': 'Profile updated successfully',
            'user': serializer.data
        })
    
    return Response({
        'error': 'Update failed',
        'details': serializer.errors
    }, status=status.HTTP_400_BAD_REQUEST)


# Logout user
@api_view(['POST'])
@permission_classes([IsAuthenticated])
def logout_user(request):
    """Logout user (blacklist refresh token)"""
    try:
        refresh_token = request.data.get('refresh_token')
        if refresh_token:
            token = RefreshToken(refresh_token)
            token.blacklist()
        
        return Response({
            'message': 'Logged out successfully'
        })
    except Exception as e:
        return Response({
            'error': 'Logout failed',
            'details': str(e)
        }, status=status.HTTP_400_BAD_REQUEST)

# Change password
@api_view(['POST'])
@permission_classes([IsAuthenticated])
def change_password(request):
    """Change user password when logged in"""
    serializer = PasswordChangeSerializer(data=request.data, context={'request': request})
    
    if serializer.is_valid():
        user = request.user
        new_password = serializer.validated_data['new_password']
        
        user.set_password(new_password)
        user.save()
        
        update_session_auth_hash(request, user)
        
        logger.info(f"Password changed for user {user.username}")
        
        return Response({
            'message': 'Password changed successfully',
            'timestamp': timezone.now().isoformat()
        })
    
    return Response({
        'error': 'Password change failed',
        'details': serializer.errors
    }, status=status.HTTP_400_BAD_REQUEST)

# Request password reset
@api_view(['POST'])
@permission_classes([AllowAny])
def request_password_reset(request):
    """Request password reset via email"""
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

@api_view(['POST'])
@permission_classes([AllowAny])
def confirm_password_reset(request):
    """Confirm password reset with token"""
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

            # Reset password
            user = reset_token.user
            user.set_password(new_password)
            user.save()

            # Mark token as used
            reset_token.is_used = True
            reset_token.save()

            logger.info(f"Password reset completed for user {user.username}")

            # Generate new JWT tokens
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