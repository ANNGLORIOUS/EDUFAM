# from django.contrib.auth import get_user_model
# from django.http import HttpResponse
# from django.views.decorators.csrf import csrf_exempt
# from django.utils.timezone import now
# from .models import Student, Fee, Consent, Event
# from .serializers import (
#     StudentSummarySerializer,
#     FeeSerializer,
#     ConsentSerializer,
#     EventSerializer
# )

# User = get_user_model()

# @csrf_exempt
# def ussd_callback(request):
#     session_id = request.POST.get("sessionId", None)
#     service_code = request.POST.get("serviceCode", None)
#     phone_number = request.POST.get("phoneNumber", None)
#     text = request.POST.get("text", "")

#     # Find the parent user
#     try:
#         parent = User.objects.get(phone_number=phone_number, user_type="parent")
#     except User.DoesNotExist:
#         response = "END Your number is not registered as a parent. Please contact the school."
#         return HttpResponse(response, content_type="text/plain")

#     # --- USSD menu logic ---
#     if text == "":
#         response = "CON Welcome to EDUFAM\n"
#         response += "1. View Student Summary\n"
#         response += "2. View Fees\n"
#         response += "3. View Consents\n"
#         response += "4. Upcoming Events\n"
#     elif text == "1":
#         students = parent.students.all()
#         if not students:
#             response = "END No students linked to your account."
#         else:
#             student_data = StudentSummarySerializer(students, many=True).data
#             response = "CON Student Summary:\n"
#             for s in student_data:
#                 response += f"- {s['name']} (Class {s['class_name']})\n"
#             response += "\n0. Back"
#     elif text == "2":
#         try:
#             student = parent.students.first()
#             fee = Fee.objects.get(student=student)
#             fee_data = FeeSerializer(fee).data
#             response = f"END Fees for {student.name}:\n"
#             response += f"Total: {fee_data['total']}\n"
#             response += f"Paid: {fee_data['paid']}\n"
#             response += f"Balance: {fee_data['due']}"
#         except Fee.DoesNotExist:
#             response = "END No fee records found."
#         except AttributeError:
#             response = "END No students linked to your account."
#     elif text == "3":
#         consents = Consent.objects.filter(student__parent=parent)
#         if not consents:
#             response = "END No consent records found."
#         else:
#             consent_data = ConsentSerializer(consents, many=True).data
#             response = "CON Consents:\n"
#             for c in consent_data:
#                 response += f"- {c['consent_type']}: {c['status']}\n"
#             response += "\n0. Back"
#     elif text == "4":
#         events = Event.objects.filter(date__gte=now().date()).order_by("date")[:5]
#         if not events:
#             response = "END No upcoming events."
#         else:
#             event_data = EventSerializer(events, many=True).data
#             response = "END Upcoming Events:\n"
#             for e in event_data:
#                 response += f"- {e['title']} ({e['date']})\n"
#     elif text == "0":
#         # Back to main menu
#         response = "CON Welcome to EDUFAM\n"
#         response += "1. View Student Summary\n"
#         response += "2. View Fees\n"
#         response += "3. View Consents\n"
#         response += "4. Upcoming Events\n"
#     else:
#         response = "END Invalid choice."

#     return HttpResponse(response, content_type="text/plain")
