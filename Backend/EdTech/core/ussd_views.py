from django.contrib.auth import get_user_model
from django.http import HttpResponse
from django.views.decorators.csrf import csrf_exempt
from django.utils.timezone import now
from .models import Student, Fee, Consent, Event, GradeRecord
from .serializers import (
    StudentSummarySerializer,
    FeeSerializer,
    ConsentSerializer,
    EventSerializer,
)
from datetime import datetime

User = get_user_model()

def main_menu_text():
    return (
        "CON Welcome to EDUFAM\n"
        "1. Student Summary\n"
        "2. Fees\n"
        "3. Events\n"
        "4. Attendance\n"
        "5. Results\n"
    )

@csrf_exempt
def ussd_callback(request):
    session_id = request.POST.get("sessionId")
    phone_number = request.POST.get("phoneNumber")
    text = request.POST.get("text", "").strip()

    steps = text.split("*") if text else []

    try:
        parent = User.objects.get(phone_number=phone_number, role="parent")
    except User.DoesNotExist:
        return HttpResponse("END Your number is not registered as a parent.", content_type="text/plain")

    # --- STEP 0: Main Menu ---
    if text == "":
        response = main_menu_text()

    # --- STEP 1: Student Summary ---
    elif steps[0] == "1":
        students = parent.children.all()
        if len(steps) == 1:
            if not students:
                response = "END No students linked to your account."
            else:
                response = "CON Select student:\n"
                for i, s in enumerate(students, start=1):
                    data = StudentSummarySerializer(s).data
                    response += f"{i}. {data['name']} ({data['class_name']})\n"
        elif len(steps) == 2:
            try:
                idx = int(steps[1]) - 1
                student = students[idx]
                data = StudentSummarySerializer(student).data
                response = (
                    f"END {data['name']} - Class {data['class_name']}\n"
                    f"{data['attendance_summary']}\n"
                    f"{data['grade_summary']}"
                )
            except (ValueError, IndexError):
                response = "END Invalid choice."

    # --- STEP 2: Fees ---
    elif steps[0] == "2":
        students = parent.children.all()
        if len(steps) == 1:
            if not students:
                response = "END No students linked to your account."
            else:
                response = "CON Select student for fees:\n"
                for i, s in enumerate(students, start=1):
                    response += f"{i}. {s.name}\n"
        elif len(steps) == 2:
            try:
                idx = int(steps[1]) - 1
                student = students[idx]
                fee = Fee.objects.filter(student=student).first()
                if fee:
                    fee_data = FeeSerializer(fee).data
                    response = (
                        f"END Fees for {student.name}:\n"
                        f"Total: {fee_data['total_fee']}\n"
                        f"Paid: {fee_data['paid_amount']}\n"
                        f"Balance: {fee_data['due_amount']}"
                    )
                else:
                    response = f"END No fee record for {student.name}."
            except (ValueError, IndexError):
                response = "END Invalid choice."


    # --- STEP 4: Events ---
    elif steps[0] == "3":
        events = Event.objects.filter(start__date__gte=now().date()).order_by("start")[:5]
        if not events:
            response = "END No upcoming events."
        else:
            event_data = EventSerializer(events, many=True).data
            response = "END Upcoming Events:\n"
            for e in event_data:
                start_dt = datetime.fromisoformat(e['start'].replace("Z", "+00:00"))
                formatted = start_dt.strftime("%d %b %Y, %I:%M %p")
                response += f"- {e['title']} ({formatted})\n"

    # --- STEP 5: Attendance ---
    elif steps[0] == "4":
        students = parent.children.all()
        if len(steps) == 1:
            if not students:
                response = "END No students linked to your account."
            else:
                response = "CON Select student for attendance:\n"
                for i, s in enumerate(students, start=1):
                    response += f"{i}. {s.name}\n"
        elif len(steps) == 2:
            try:
                idx = int(steps[1]) - 1
                student = students[idx]
                data = StudentSummarySerializer(student).data
                response = f"END Attendance for {student.name}:\n{data['attendance_summary']}"
            except (ValueError, IndexError):
                response = "END Invalid choice."

    # --- STEP 6: Results ---
    elif steps[0] == "5":
        students = parent.children.all()
        if len(steps) == 1:
            if not students:
                response = "END No students linked to your account."
            else:
                response = "CON Select student for results:\n"
                for i, s in enumerate(students, start=1):
                    response += f"{i}. {s.name}\n"
        elif len(steps) == 2:
            try:
                idx = int(steps[1]) - 1
                student = students[idx]
                grades = GradeRecord.objects.filter(student=student)
                if not grades.exists():
                    response = f"END No results for {student.name}."
                else:
                    response = f"END Results for {student.name}:\n"
                    total_marks = 0
                    count = 0
                    for g in grades:
                        response += f"{g.subject.name}: {g.marks:.2f} ({g.grade})\n"
                        total_marks += g.marks
                        count += 1
                    avg = total_marks / count if count else 0
                    response += f"Average: {avg:.2f}"
            except (ValueError, IndexError):
                response = "END Invalid choice."

    else:
        response = "END Invalid choice. Please try again."

    return HttpResponse(response, content_type="text/plain")
