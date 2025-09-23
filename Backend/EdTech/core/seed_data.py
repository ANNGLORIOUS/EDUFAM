# core/seed_data.py
import os
import django
import random
from django.utils.timezone import now, timedelta

os.environ.setdefault("DJANGO_SETTINGS_MODULE", "EdTech.settings")
django.setup()

from core.models import (
    User, Parent, Teacher,
    Class, Student, Subject, Term, GradeRecord,
    AttendanceRecord, Event,
    Fee, FeeAccount, Payment,
    Feedback, Message,
    StudentFlag, Consent,
    SMSCampaign, AuditLog, USSDConfig
)

def run():
    # ----------------------
    # Sample Data
    # ----------------------
    parent_names = [
        ("Grace", "Wanjiku"),
        ("James", "Otieno"),
        ("Mary", "Achieng"),
        ("Peter", "Kamau"),
        ("Lucy", "Mwikali"),
    ]

    teacher_names = [
        ("Samuel", "Mwangi", "Math"),
        ("Ann", "Atieno", "English"),
        ("David", "Omondi", "Science"),
        ("Rose", "Njeri", "History"),
        ("Brian", "Mutua", "ICT"),
    ]

    student_names = [
        ("Kevin", "Kamau"),
        ("Linda", "Achieng"),
        ("Eric", "Otieno"),
        ("Sophia", "Wanjiru"),
        ("Victor", "Mwangi"),
    ]

    # ----------------------
    # Parents
    # ----------------------
    parents = []
    for i, (fname, lname) in enumerate(parent_names, start=1):
        user, _ = User.objects.get_or_create(
            username=f"parent{i}",
            defaults={
                "email": f"parent{i}@example.com",
                "role": "parent",
                "first_name": fname,
                "last_name": lname,
                "phone_number": f"+25470000000{i}",
            },
        )
        user.set_password("test1234")
        user.save()
        parent, _ = Parent.objects.get_or_create(
            user=user,
            defaults={
                "occupation": "Businessperson",
                "address": f"Nairobi, Kenya {i}",
            },
        )
        parents.append(parent)

    # ----------------------
    # Teachers + Subjects
    # ----------------------
    teachers = []
    subjects = []
    for i, (fname, lname, subject_name) in enumerate(teacher_names, start=1):
        user, created = User.objects.get_or_create(
            username=f"teacher{i}",
            defaults={
                "email": f"teacher{i}@example.com",
                "role": "teacher",
                "first_name": fname,
                "last_name": lname,
                "phone_number": f"+25471100000{i}",
            },
        )
        if created:
            user.set_password("test1234")
            user.save()
        teacher, _ = Teacher.objects.get_or_create(user=user, defaults={"subject": subject_name})
        subj, _ = Subject.objects.get_or_create(name=subject_name, defaults={"teacher": user})
        teachers.append(teacher)
        subjects.append(subj)

    # ----------------------
    # Classes
    # ----------------------
    classes = []
    for i, teacher in enumerate(teachers, start=1):
        cls, _ = Class.objects.get_or_create(
            name=f"Class {i}",
            academic_year="2025",
        )
        cls.teacher = teacher
        cls.save()
        classes.append(cls)

    # ----------------------
    # Students
    # ----------------------
    students = []
    for i, (fname, lname) in enumerate(student_names, start=1):
        parent = parents[i % len(parents)]
        cls = classes[i % len(classes)]
        student, _ = Student.objects.get_or_create(
            student_id=f"STD{i:03}",
            defaults={
                "first_name": fname,
                "last_name": lname,
                "student_class": cls,
            },
        )
        student.parents.add(parent.user)
        students.append(student)

    # ----------------------
    # Term
    # ----------------------
    term, _ = Term.objects.get_or_create(
        name="Term 1",
        defaults={"start_date": now().date(), "end_date": now().date() + timedelta(days=90)},
    )

    # ----------------------
    # Grades & Attendance
    # ----------------------
    for student in students:
        for subj in subjects:
            GradeRecord.objects.get_or_create(
                student=student,
                subject=subj,
                term=term,
                defaults={
                    "marks": random.uniform(50, 100),
                    "grade": random.choice(["A", "B", "C"]),
                    "uploaded_by": random.choice(teachers).user
                }
            )
        AttendanceRecord.objects.get_or_create(
            student=student,
            date=now().date(),
            defaults={"status": random.choice(["present", "absent"])}
        )

    # ----------------------
    # Events
    # ----------------------
    Event.objects.get_or_create(
        title="Sports Day",
        defaults={"start": now(), "end": now(), "description": "Annual school sports day", "event_type": "school", "target_audience": "all"}
    )
    Event.objects.get_or_create(
        title="Parents Meeting",
        defaults={"start": now(), "end": now(), "description": "Meeting for all parents", "event_type": "school", "target_audience": "all"}
    )

    # ----------------------
    # Fees
    # ----------------------
    for student in students:
        total_fee = 10000
        paid = random.randint(3000, 8000)
        due = total_fee - paid
        fee, _ = Fee.objects.get_or_create(
            student=student,
            term=term,
            defaults={"total_fee": total_fee, "paid_amount": paid, "due_date": now().date() + timedelta(days=30)}
        )
        fee_account, _ = FeeAccount.objects.get_or_create(student=student, defaults={"balance": due})
        Payment.objects.get_or_create(fee_account=fee_account, defaults={"amount": paid})

    # ----------------------
    # Feedback, Messages, Flags, Consents
    # ----------------------
    for student in students:
        Feedback.objects.get_or_create(student=student, defaults={"parent": parents[0].user, "concern_type": "General", "message": "Improving steadily."})
        Message.objects.get_or_create(student=student, defaults={"parent": parents[0].user, "teacher": teachers[0].user, "subject": "Reminder", "message": "Please attend remedial classes."})
        StudentFlag.objects.get_or_create(student=student, defaults={"flag_type": "DISCIPLINE", "description": "Needs monitoring", "created_by": teachers[0].user})
        Consent.objects.get_or_create(student=student, defaults={"consent_type": "Trip", "status": random.choice(["granted", "pending"])})

    # ----------------------
    # SMS, Audit, USSD
    # ----------------------
    SMSCampaign.objects.get_or_create(title="Welcome", defaults={"message": "Welcome parents!", "created_by": "system", "sent_at": now()})
    AuditLog.objects.get_or_create(action="Seed data inserted", defaults={"created_at": now()})
    USSDConfig.objects.get_or_create(
        name="Default",
        defaults={
            "menu_json": {
                "welcome_text": "Welcome to EdTech USSD",
                "menus": {
                    "1": {"text": "View Student Summary", "action": "student_summary"},
                    "2": {"text": "Check Fees", "action": "fees"},
                    "3": {"text": "View Consents", "action": "consents"},
                    "4": {"text": "Upcoming Events", "action": "events"},
                }
            }
        }
    )

    print("✅ Seeder completed successfully (idempotent)!")

if __name__ == "__main__":
    run()
