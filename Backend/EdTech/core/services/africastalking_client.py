# core/services/africastalking_client.py
import requests
from django.conf import settings

def send_sms(message, recipients):
    """
    Send SMS via Africa's Talking REST API (Sandbox or Production).
    :param message: str - The message to send
    :param recipients: list[str] - List of phone numbers in international format
    :return: dict - API response as JSON
    """
    url = "https://api.sandbox.africastalking.com/version1/messaging"
    headers = {
        "apiKey": settings.AT_SMS_API_KEY,
        "Content-Type": "application/x-www-form-urlencoded",
        "Accept": "application/json"
    }
    data = {
        "username": settings.AT_USERNAME,
        "to": ",".join(recipients),
        "message": message
    }

    response = requests.post(url, headers=headers, data=data)

    try:
        return response.json()
    except Exception:
        return {"error": "Invalid response", "status_code": response.status_code, "text": response.text}
