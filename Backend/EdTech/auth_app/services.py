import logging
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
    def send_otp_email(email, code, otp_type):
        subject = f"Your OTP Code - {otp_type.title()}"
        message = f"""
        Your OTP code is: {code}
        
        This code is valid for 10 minutes.
        Don't share this code with anyone.
        
        If you didn't request this code, please ignore this email.
        """
        
        try:
            send_mail(
                subject,
                message,
                settings.DEFAULT_FROM_EMAIL,
                [email],
                fail_silently=False,
            )
            return True
        except Exception as e:
            logger.error(f"Failed to send email to {email}: {str(e)}")
            return False
