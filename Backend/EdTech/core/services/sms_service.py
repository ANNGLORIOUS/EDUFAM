import africastalking

sms = africastalking.SMS

def send_sms(phone_number, message):
    """
    Send an SMS using Africa's Talking.
    """
    try:
        response = sms.send(message, [phone_number])
        return response
    except Exception as e:
        return {"error": str(e)}
