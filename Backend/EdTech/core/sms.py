import africastalking
from django.conf import settings

# Initialize ONLY SMS
sms = africastalking.SMSService(
    username=settings.AFRICASTALKING_USERNAME,
    api_key=settings.AFRICASTALKING_API_KEY
)

def send_sms(recipients, message):
    
    try:
        response = sms.send(message, recipients)
        return response
    except Exception as e:
        return {"error": str(e)}
