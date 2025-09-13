import logging
import requests
from django.conf import settings
from django.core.mail import send_mail
from .models import OTP

logger = logging.getLogger(__name__)

class MockSMSService:
    """Mock SMS service for testing - replace with real SMS provider"""
    
    @staticmethod
    def send_sms(phone_number, message):
        # In production, integrate with AfricasTalking, Twilio, etc.
        logger.info(f"SMS to {phone_number}: {message}")
        print(f"📱 SMS to {phone_number}: {message}")
        return {"status": "success", "message": "SMS sent"}
    
    @classmethod
    def send_otp(cls, phone_number, code, otp_type):
        message = f"Your OTP code is: {code}. Valid for 10 minutes. Don't share this code."
        return cls.send_sms(phone_number, message)

class EmailService:
    @staticmethod
    def _send_via_mailtrap_api(subject: str, message: str, recipient: str) -> bool:
        """Send email using Mailtrap API"""
        try:
            token = getattr(settings, "MAILTRAP_API_TOKEN", None)
            if not token:
                logger.error("MAILTRAP_API_TOKEN not set in settings")
                print("MAILTRAP_API_TOKEN not configured")
                return False

            # Use sandbox API endpoint with inbox ID
            inbox_id = getattr(settings, "MAILTRAP_INBOX_ID", None)
            if inbox_id:
                # Sandbox API (for testing)
                api_url = f"https://sandbox.api.mailtrap.io/api/send/{inbox_id}"
                headers = {
                    "Api-Token": token,
                    "Content-Type": "application/json"
                }
                payload = {
                    "from": {"email": "noreply@schoolsystem.com", "name": "School System"},
                    "to": [{"email": recipient}],
                    "subject": subject,
                    "text": message,
                    "html": f"<pre>{message}</pre>"  
                }
            else:
                # Production API (requires domain verification)
                api_url = "https://send.api.mailtrap.io/api/send"
                headers = {
                    "Authorization": f"Bearer {token}",  
                    "Content-Type": "application/json"
                }
                payload = {
                    "from": {"email": "noreply@schoolsystem.com", "name": "School System"},
                    "to": [{"email": recipient}],
                    "subject": subject,
                    "text": message,
                    "category": "password_reset"
                }

            print(f" Sending email to {recipient} via Mailtrap API...")
            print(f" API URL: {api_url}")
            print(f" Using token: {token[:10]}...")
            
            response = requests.post(api_url, json=payload, headers=headers, timeout=15)
            
            print(f"Response Status: {response.status_code}")
            print(f"Response Body: {response.text}")
            
            if response.status_code in [200, 201, 202]:
                logger.info(f"Email sent successfully via Mailtrap API to {recipient}")
                print(f"Email sent successfully to {recipient}")
                return True
            else:
                logger.error(f"Mailtrap API failed: Status {response.status_code}, Body: {response.text}")
                print(f" Mailtrap API error: {response.status_code} - {response.text}")
                return False

        except requests.exceptions.Timeout:
            logger.error(f"Timeout sending email to {recipient}")
            print(f"Timeout sending email to {recipient}")
            return False
        except requests.exceptions.RequestException as e:
            logger.error(f"Request error sending email to {recipient}: {str(e)}")
            print(f"Request error: {str(e)}")
            return False
        except Exception as e:
            logger.error(f"Unexpected error sending email to {recipient}: {str(e)}")
            print(f"Unexpected error: {str(e)}")
            return False

    @staticmethod
    def _send_via_smtp(subject: str, message: str, recipient: str) -> bool:
        """Send email using Django's SMTP backend"""
        try:
            send_mail(
                subject,
                message,
                settings.DEFAULT_FROM_EMAIL,
                [recipient],
                fail_silently=False
            )
            logger.info(f"Email sent via SMTP to {recipient}")
            print(f"Email sent via SMTP to {recipient}")
            return True
        except Exception as e:
            logger.error(f"SMTP error sending email to {recipient}: {str(e)}")
            print(f"SMTP error: {str(e)}")
            return False

    @classmethod
    def send_email(cls, subject: str, message: str, recipient_email: str) -> bool:
        """Main email sending method with fallback"""
        print(f"\n Attempting to send email...")
        print(f"   To: {recipient_email}")
        print(f"   Subject: {subject}")
        print(f"   Use API: {getattr(settings, 'EMAIL_USE_API', False)}")
        
        if getattr(settings, "EMAIL_USE_API", False):
            success = cls._send_via_mailtrap_api(subject, message, recipient_email)
            if success:
                return True
            
            print(" API failed, trying SMTP fallback...")
            return cls._send_via_smtp(subject, message, recipient_email)
        else:
            return cls._send_via_smtp(subject, message, recipient_email)

    @classmethod
    def send_otp_email(cls, email: str, code: str, otp_type: str) -> bool:
        """Send OTP via email"""
        subject = f"Your OTP Code - {otp_type.replace('_', ' ').title()}"
        message = f"""Hello!

        Your verification code is: {code}

        This code is valid for 10 minutes.
        Please don't share this code with anyone.

        If you didn't request this code, please ignore this email.

        Best regards,
        School Communication System"""
        
        return cls.send_email(subject, message, email)
    
class PasswordResetService:
    @staticmethod
    def send_password_reset_email(user_email: str, token: str, username: str = None) -> bool:
        """Send password reset email with token"""
        subject = "Password Reset Request - School System"
        reset_url = f"{settings.FRONTEND_URL}/reset-password?token={token}"
        display_name = username or "User"

        message = f"""Hello {display_name}!

You requested a password reset for your school system account.

Please click the link below to reset your password:
{reset_url}

This link will expire in 10 minutes.

If you didn't request this password reset, please ignore this email.
Your password will remain unchanged.

Best regards,
School Communication System
"""

        return EmailService.send_email(subject, message, user_email)
