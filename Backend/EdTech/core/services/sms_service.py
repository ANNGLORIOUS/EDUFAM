# core/services/sms_service.py

import africastalking
import requests
from django.conf import settings

# Initialize Africa's Talking SDK (only once)
africastalking.initialize(settings.AT_USERNAME, settings.AT_SMS_API_KEY)
sms = africastalking.SMS


def send_sms(phone_number, message):
    """
    Send an SMS using Africa's Talking SDK first,
    fallback to REST API if SDK fails.
    """
    try:
        # SDK attempt
        response = sms.send(message, [phone_number])
        return response
    except Exception as e:
        # Fallback to REST API
        try:
            url = "https://api.sandbox.africastalking.com/version1/messaging"
            headers = {
                "apiKey": settings.AT_SMS_API_KEY,
                "Content-Type": "application/x-www-form-urlencoded",
                "Accept": "application/json",
            }
            data = {
                "username": settings.AT_USERNAME,
                "to": phone_number,
                "message": message,
            }
            resp = requests.post(url, headers=headers, data=data)
            return resp.json()
        except Exception as e2:
            return {"error": f"SDK failed: {str(e)} | REST failed: {str(e2)}"}
