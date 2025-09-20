import os
import django
from datetime import datetime

os.environ.setdefault("DJANGO_SETTINGS_MODULE", "your_project.settings")
django.setup()

from .models import Parent, Student, Teacher, GradeRecord, Feedback, AttendanceRecord, Event


def run():
    # --- USERS DATA ---
    parents_data = [
        {
            "id": 1,
            "name": "Jane Doe Parent",
            "email": "janedoe.parent@email.com",
            "children": ["12A"],
            "status": "approved",
            "dateAdded": "2025-01-10",
            "lastLogin": "2025-09-17",
        },
        {
            "id": 4,
            "name": "John Doe Parent",
            "email": "johndoe.parent@email.com",
            "children": ["13B"],
            "status": "pending",
            "dateAdded": "2025-01-12",
            "lastLogin": None,
        },
        {
            "id": 7,
            "name": "Sarah Wilson Parent",
            "email": "sarahwilson.parent@email.com",
            "children": ["14C"],
            "status": "approved",
            "dateAdded": "2025-01-15",
            "lastLogin": "2025-09-18",
        },
    ]

    students_data = [
        {
            "id": 2,
            "name": "Jane Doe",
            "studentId": "12A",
            "studentClass": "Class 1",
            "parentId": 1,
            "status": "active",
            "dateAdded": "2025-01-10",
            "fee": {
                "totalFee": 30000,
                "paidAmount": 25000,
                "balance": 5000,
                "dueDate": "2025-09-30",
                "status": "pending",
                "paymentDate": None,
            },
            "lastLogin": "2025-09-15",
        },
        {
            "id": 5,
            "name": "John Doe",
            "studentId": "13B",
            "studentClass": "Class 2",
            "parentId": 4,
            "status": "inactive",
            "dateAdded": "2025-01-12",
            "fee": {
                "totalFee": 30000,
                "paidAmount": 30000,
                "balance": 0,
                "dueDate": "2025-09-30",
                "status": "paid",
                "paymentDate": "2025-09-10",
            },
            "lastLogin": "2025-09-15",
        },
        {
            "id": 8,
            "name": "Sarah Wilson",
            "studentId": "14C",
            "studentClass": "Class 3",
            "parentId": 7,
            "status": "active",
            "dateAdded": "2025-01-15",
            "fee": {
                "totalFee": 30000,
                "paidAmount": 0,
                "balance": 30000,
                "dueDate": "2025-09-30",
                "status": "overdue",
                "paymentDate": None,
            },
            "lastLogin": "2025-09-15",
        },
    ]

    teachers_data = [
        {
            "id": 3,
            "name": "Mr. Smith",
            "email": "mr.smith@email.com",
            "subject": "Mathematics",
            "studentClass": "Class 1",
            "status": "approved",
            "dateAdded": "2025-01-05",
            "lastLogin": "2025-09-18",
        },
        {
            "id": 6,
            "name": "Ms. Johnson",
            "email": "ms.johnson@email.com",
            "subject": "English",
            "studentClass": "Class 2",
            "status": "approved",
            "dateAdded": "2025-01-06",
            "lastLogin": "2025-09-18",
        },
        {
            "id": 9,
            "name": "David Brown",
            "email": "david.brown@email.com",
            "subject": "Science",
            "studentClass": "Class 3",
            "status": "pending",
            "dateAdded": "2025-01-07",
            "lastLogin": "2025-09-18",
        },
    ]

    # --- RESULTS ---
    results_data = [
        {
            "studentId": "12A",
            "studentName": "Jane Doe",
            "studentClass": "Class 1",
            "term": "Term 1",
            "grade": "A",
            "fileName": "JaneDoe_Term1_Results.pdf",
            "fileDataUrl": "data:application/pdf;base64,JVBERi0xLjQKJcfs...fakebase64...",
            "parentEmail": "janedoeparent@gmail.com",
        },
        {
            "studentId": "7B",
            "studentName": "John Smith",
            "studentClass": "Class 2",
            "term": "Term 2",
            "grade": "B+",
            "fileName": "JohnSmith_Term2_Results.pdf",
            "fileDataUrl": "data:application/pdf;base64,JVBERi0xLjQKJcfs...fakebase64...",
            "parentEmail": "johnsmith.parent@email.com",
        },
        {
            "studentId": "5C",
            "studentName": "Mary Johnson",
            "studentClass": "Class 3",
            "term": "Term 3",
            "grade": "A-",
            "fileName": "MaryJohnson_Term3_Results.pdf",
            "fileDataUrl": "data:application/pdf;base64,JVBERi0xLjQKJcfs...fakebase64...",
            "parentEmail": "maryjohnson.parent@gmail.com",
        },
    ]

    # --- FEEDBACK ---
    feedback_data = [
        {
            "concernType": "academic",
            "message": "My child is struggling with the math homework. Can you provide extra help?",
            "requestCallback": True,
            "scheduleMeeting": False,
            "parentEmail": "janedoeparent@gmail.com",
        },
        {
            "concernType": "attendance",
            "message": "John will be absent next week due to family reasons.",
            "requestCallback": False,
            "scheduleMeeting": False,
            "parentEmail": "johnsmith.parent@gmail.com",
        },
        {
            "concernType": "results",
            "message": "Can I get more details about the last test results?",
            "requestCallback": False,
            "scheduleMeeting": True,
            "parentEmail": "maryjohnson.parent@gmail.com",
        },
    ]

    # --- ATTENDANCE ---
    attendance_data = [
        {
            "studentId": "12A",
            "studentName": "Jane Doe",
            "studentClass": "Class 1",
            "term": "Term 1",
            "weeks": [True, True, True, True, True, True, True, False, False],
            "attendancePercent": 78,
            "parentEmail": "sandranyambura62@gmail.com",
        },
        {
            "studentId": "7B",
            "studentName": "John Smith",
            "studentClass": "Class 2",
            "term": "Term 2",
            "weeks": [True, True, True, True, True, True, True, True, True],
            "attendancePercent": 100,
            "parentEmail": "johnsmith.parent@email.com",
        },
        {
            "studentId": "5C",
            "studentName": "Mary Johnson",
            "studentClass": "Class 3",
            "term": "Term 3",
            "weeks": [True, False, True, False, True, False, True, False, True],
            "attendancePercent": 56,
            "parentEmail": "maryjohnson.parent@email.com",
        },
        {
            "studentId": "8D",
            "studentName": "Samuel Lee",
            "studentClass": "Class 1",
            "term": "Term 2",
            "weeks": [True, True, False, False, True, True, False, False, False],
            "attendancePercent": 44,
            "parentEmail": "samuellee.parent@email.com",
        },
        {
            "studentId": "9E",
            "studentName": "Emily Clark",
            "studentClass": "Class 2",
            "term": "Term 3",
            "weeks": [True, True, True, True, False, False, False, False, False],
            "attendancePercent": 44,
            "parentEmail": "emilyclark.parent@email.com",
        },
        {
            "studentId": "10F",
            "studentName": "Michael Brown",
            "studentClass": "Class 3",
            "term": "Term 1",
            "weeks": [True, True, True, True, True, True, True, True, False],
            "attendancePercent": 89,
            "parentEmail": "michaelbrown.parent@email.com",
        },
    ]

    # --- EVENTS ---
    events_data = [
        {
            "id": 1,
            "title": "Maths Contest",
            "start": "2025-09-22T10:00:00",
            "end": "2025-09-22T12:00:00",
            "description": "Annual maths contest for all grades.",
        },
        {
            "id": 2,
            "title": "Parents Meeting",
            "start": "2025-09-25T14:00:00",
            "end": "2025-09-25T16:00:00",
            "description": "Meet with teachers to discuss your child’s progress.",
        },
        {
            "id": 3,
            "title": "School Holiday",
            "start": "2025-09-28T00:00:00",
            "end": "2025-09-28T23:59:00",
            "description": "School will be closed for a public holiday.",
        },
        {
            "id": 4,
            "title": "Science Fair",
            "start": "2025-10-02T09:00:00",
            "end": "2025-10-02T15:00:00",
            "description": "Annual science fair for all students.",
        },
    ]

    # --- SAVE TO DB ---
    for parent in parents_data:
        Parent.objects.update_or_create(id=parent["id"], defaults=parent)

    for student in students_data:
        Student.objects.update_or_create(id=student["id"], defaults=student)

    for teacher in teachers_data:
        Teacher.objects.update_or_create(id=teacher["id"], defaults=teacher)

    for result in results_data:
        GradeRecord.objects.create(**result)

    for fb in feedback_data:
        Feedback.objects.create(**fb)

    for att in attendance_data:
        AttendanceRecord.objects.create(**att)

    for ev in events_data:
        Event.objects.update_or_create(id=ev["id"], defaults=ev)

    print("✅ Database seeded successfully!")
