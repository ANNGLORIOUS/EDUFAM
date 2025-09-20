import os
import sys
from datetime import datetime
import django

# Add project root to sys.path
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

os.environ.setdefault("DJANGO_SETTINGS_MODULE", "EdTech.settings")
django.setup()

from core.models import (
    User, Parent, Student, Teacher, GradeRecord,
    Feedback, AttendanceRecord, Event, FeeAccount
)


def run():
    # --- CLEAR OLD DATA ---
    print("🧹 Clearing old data...")
    User.objects.all().delete()
    Parent.objects.all().delete()
    Student.objects.all().delete()
    Teacher.objects.all().delete()
    GradeRecord.objects.all().delete()
    Feedback.objects.all().delete()
    AttendanceRecord.objects.all().delete()
    Event.objects.all().delete()
    FeeAccount.objects.all().delete()

    # --- PARENTS ---
    parent_users = [
        {"username": "parent1", "first_name": "Jane", "last_name": "Doe", "email": "janedoe.parent@email.com"},
        {"username": "parent2", "first_name": "John", "last_name": "Doe", "email": "johndoe.parent@email.com"},
        {"username": "parent3", "first_name": "Sarah", "last_name": "Wilson", "email": "sarahwilson.parent@email.com"},
    ]

    parents = []
    for data in parent_users:
        user, _ = User.objects.update_or_create(
            username=data["username"],
            defaults={**data, "role": "parent"}
        )
        parent, _ = Parent.objects.update_or_create(user=user)
        parents.append(parent)

    # --- TEACHERS ---
    teacher_users = [
        {"username": "teacher1", "first_name": "Mr.", "last_name": "Smith", "email": "mr.smith@email.com", "subject": "Mathematics"},
        {"username": "teacher2", "first_name": "Ms.", "last_name": "Johnson", "email": "ms.johnson@email.com", "subject": "English"},
        {"username": "teacher3", "first_name": "David", "last_name": "Brown", "email": "david.brown@email.com", "subject": "Science"},
    ]

    teachers = []
    for data in teacher_users:
        subject = data.pop("subject")  # ⚡ don’t let User eat this
        user, _ = User.objects.update_or_create(
            username=data["username"],
            defaults={**data, "role": "teacher"}
        )
        teacher, _ = Teacher.objects.update_or_create(user=user, defaults={"subject": subject})
        teachers.append(teacher)

    # --- STUDENTS + FEES ---
    students_data = [
        {
            "student_id": "12A",
            "first_name": "Jane",
            "last_name": "Doe",
            "classroom": "Class 1",
            "grade": "Grade 1",
            "status": "active",
            "parent_email": "janedoe.parent@email.com",
            "fee": {"balance": 5000, "currency": "KES", "next_payment_due": "2025-09-30"},
        },
        {
            "student_id": "13B",
            "first_name": "John",
            "last_name": "Doe",
            "classroom": "Class 2",
            "grade": "Grade 2",
            "status": "inactive",
            "parent_email": "johndoe.parent@email.com",
            "fee": {"balance": 0, "currency": "KES", "next_payment_due": "2025-09-30"},
        },
        {
            "student_id": "14C",
            "first_name": "Sarah",
            "last_name": "Wilson",
            "classroom": "Class 3",
            "grade": "Grade 3",
            "status": "active",
            "parent_email": "sarahwilson.parent@email.com",
            "fee": {"balance": 30000, "currency": "KES", "next_payment_due": "2025-09-30"},
        },
    ]

    students = []
    for data in students_data:
        fee = data.pop("fee")
        student, _ = Student.objects.update_or_create(
            student_id=data["student_id"],
            defaults={
                "first_name": data["first_name"],
                "last_name": data["last_name"],
                "classroom": data["classroom"],
                "grade": data["grade"],
                "status": data["status"],
                "parent_email": data["parent_email"],
            },
        )
        students.append(student)

        # Link student to parent
        parent_user = User.objects.filter(email=data["parent_email"]).first()
        if parent_user:
            student.parents.add(parent_user)

        # Add fee account
        FeeAccount.objects.update_or_create(
            student=student,
            defaults={
                "balance": fee["balance"],
                "currency": fee["currency"],
                "next_payment_due": datetime.strptime(fee["next_payment_due"], "%Y-%m-%d").date(),
            },
        )

    # --- GRADES ---
    GradeRecord.objects.update_or_create(
        student=students[0],
        subject="Math",
        term="Term 1",
        grade="A",
        parent_email=students[0].parent_email
    )

    # --- ATTENDANCE ---
    AttendanceRecord.objects.update_or_create(
        student=students[0],
        date=datetime.now().date(),
        defaults={"term": "Term 1", "weeks": [1, 1, 1, 1, 0], "status": "present"},
    )

    # --- FEEDBACK ---
    Feedback.objects.update_or_create(
        parent_email=students[0].parent_email,
        student=students[0],
        defaults={
            "parent_name": "Jane Doe",
            "concern_type": "academic",
            "message": "My child is struggling with math homework.",
            "request_callback": True,
            "schedule_meeting": False,
        },
    )

    # --- EVENTS ---
    Event.objects.update_or_create(
        title="Maths Contest",
        date=datetime(2025, 9, 22).date(),
        start_time=datetime(2025, 9, 22, 10, 0).time(),
        end_time=datetime(2025, 9, 22, 12, 0).time(),
        description="Annual maths contest for all grades.",
    )

    print("✅ Database seeded with clean data!")


if __name__ == "__main__":
    run()
