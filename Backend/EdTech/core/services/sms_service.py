import africastalking
from django.conf import settings

# Initialize Africa's Talking SDK
africastalking.initialize(settings.AT_USERNAME, settings.AT_SMS_API_KEY)
sms = africastalking.SMS

def send_sms(phone_number: str, message: str) -> dict:
    """
    Sends SMS using Africa's Talking SDK.
    :param phone_number: str - single recipient in international format
    :param message: str - the message to send
    :return: dict - API response
    """
    try:
        response = sms.send(message, [phone_number])
        return response
    except Exception as e:
        return {"error": str(e)}
