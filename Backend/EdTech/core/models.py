from django.db import models
from django.contrib.auth.models import AbstractUser

# Create your models here.
# ----------------------
# USER MODEL
# ----------------------
class User(AbstractUser):
    ROLE_CHOICES = (
        ("parent", "Parent"),
        ("teacher", "Teacher"),
        ("admin", "Admin"),
    )
    role = models.CharField(max_length=20, choices=ROLE_CHOICES)

    def __str__(self):
        return f"{self.username} ({self.role})"
    
# ----------------------
# STUDENT MODEL
# ----------------------
class Student(models.Model):
    first_name = models.CharField(max_length=100)
    last_name = models.CharField(max_length=100)
    classroom = models.CharField(max_length=100)
    grade = models.CharField(max_length=10)
    parents = models.ManyToManyField(User, related_name="children", limit_choices_to={"role": "parent"})

    def __str__(self):
        return f"{self.first_name} {self.last_name}"


# ----------------------
# TEACHER TABLES
# ----------------------
class AttendanceRecord(models.Model):
    student = models.ForeignKey(Student, on_delete=models.CASCADE)
    date = models.DateField()
    status = models.CharField(max_length=10, choices=[("PRESENT","Present"),("ABSENT","Absent")])
    recorded_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, limit_choices_to={"role": "teacher"})
    created_at = models.DateTimeField(auto_now_add=True)


class GradeRecord(models.Model):
    student = models.ForeignKey(Student, on_delete=models.CASCADE)
    subject = models.CharField(max_length=100)
    grade = models.DecimalField(max_digits=5, decimal_places=2)
    recorded_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, limit_choices_to={"role": "teacher"})
    created_at = models.DateTimeField(auto_now_add=True)


class StudentFlag(models.Model):
    student = models.ForeignKey(Student, on_delete=models.CASCADE)
    flag_type = models.CharField(max_length=50, choices=[("HEALTH","Health"),("DISCIPLINE","Discipline")])
    description = models.TextField()
    created_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, limit_choices_to={"role": "teacher"})
    created_at = models.DateTimeField(auto_now_add=True)


class Event(models.Model):
    title = models.CharField(max_length=255)
    description = models.TextField(blank=True)
    date = models.DateTimeField()
    created_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, limit_choices_to={"role": "teacher"})
    created_at = models.DateTimeField(auto_now_add=True)


# ----------------------
# ADMIN TABLES
# ----------------------
class AuditLog(models.Model):
    user = models.ForeignKey(User, on_delete=models.SET_NULL, null=True)
    action = models.CharField(max_length=255)
    timestamp = models.DateTimeField(auto_now_add=True)
    details = models.JSONField(default=dict)


class USSDConfig(models.Model):
    menu_json = models.JSONField(default=dict)
    updated_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, limit_choices_to={"role": "admin"})
    updated_at = models.DateTimeField(auto_now=True)
