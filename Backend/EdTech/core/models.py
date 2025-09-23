from django.db import models
from django.conf import settings
from django.utils import timezone
from decimal import Decimal
from django.contrib.auth.models import AbstractUser
from datetime import timedelta, date
import secrets
import uuid



    
# # ==============================
# # Custom User
# # ==============================
# class User(AbstractUser):
#     USER_TYPE = [
#         ('parent', 'Parent'),
#         ('teacher', 'Teacher'),
#         ('admin', 'Admin'),
#     ]

#     phone_number = models.CharField(max_length=20, blank=True, null=True)
#     user_type = models.CharField(max_length=20, choices=USER_TYPE)
#     is_phone_verified = models.BooleanField(default=False)   
#     is_email_verified = models.BooleanField(default=False) 
#     created_at = models.DateTimeField(auto_now_add=True)  
#     updated_at = models.DateTimeField(auto_now=True)  
#     def __str__(self):
#         return self.username


# # ==============================
# # OTP Model
# # ==============================
# class OTP(models.Model):
#     OTP_TYPE = [
#         ('login', 'Login'),
#         ('registration', 'Registration'),
#         ('password_reset', 'Password Reset'),
#         ('phone_verification', 'Phone Verification'),
#     ]

#     user = models.ForeignKey(
#         settings.AUTH_USER_MODEL,
#         on_delete=models.CASCADE,
#         related_name="otps",
#         null=True, blank=True
#     )
#     phone_number = models.CharField(max_length=20, blank=True, null=True)
#     email = models.EmailField(blank=True, null=True)
#     code = models.CharField(max_length=6)
#     otp_type = models.CharField(max_length=20, choices=OTP_TYPE)
#     expires_at = models.DateTimeField()
#     is_used = models.BooleanField(default=False)
#     created_at = models.DateTimeField(auto_now_add=True)  
#     updated_at = models.DateTimeField(auto_now=True)  

#     def save(self, *args, **kwargs):
#         if not self.code:
#             self.code = str(secrets.randbelow(1000000)).zfill(6)  
#         if not self.expires_at:
#             self.expires_at = timezone.now() + timedelta(minutes=5)

#         if self.user:
#             OTP.objects.filter(
#                 user=self.user, otp_type=self.otp_type, is_used=False
#             ).update(is_used=True)

#         super().save(*args, **kwargs)

#     def is_expired(self):
#         return timezone.now() > self.expires_at

#     def is_valid(self):
#         return not self.is_used and not self.is_expired()

#     def __str__(self):
#         return f"OTP for {self.user or self.phone_number or self.email} ({self.otp_type})"

# class PasswordResetToken(models.Model):
#     user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
#     token = models.CharField(max_length=128, unique=True, default=uuid.uuid4)
#     is_used = models.BooleanField(default=False)
#     created_at = models.DateTimeField(auto_now_add=True)
#     expires_at = models.DateTimeField()

#     def save(self, *args, **kwargs):
#         if not self.expires_at:
#             self.expires_at = timezone.now() + timedelta(minutes=10) 
#         super().save(*args, **kwargs)

#     def is_valid(self):
#         return not self.is_used and timezone.now() < self.expires_at

#     def __str__(self):
#         return f"PasswordResetToken({self.user.email}, used={self.is_used})"


# # ==============================
# # Clerk Custom User Model
# # ==============================
class User(AbstractUser):
    USER_TYPE = [
        ('parent', 'Parent'),
        ('teacher', 'Teacher'),
        ('admin', 'Admin'),
    ]
    clerk_id = models.CharField(max_length=255, unique=True)
    user_type = models.CharField(max_length=20, choices=USER_TYPE)
    
    def __str__(self):
        return f"{self.username} ({self.user_type})"
    
# -----------------------------
# Class / Grade Model
# -----------------------------
class Class(models.Model):
    name = models.CharField(max_length=50)
    academic_year = models.CharField(max_length=10)
    teachers = models.ManyToManyField(User, limit_choices_to={'user_type': 'teacher'}, related_name='classes')

    def __str__(self):
        return f"{self.name} ({self.academic_year})"


# -----------------------------
# Student Model
# -----------------------------
class Student(models.Model):
    student_id = models.CharField(max_length=64, unique=True)
    name = models.CharField(max_length=255)
    student_class = models.ForeignKey(Class, on_delete=models.SET_NULL, null=True, related_name='students')
    date_added = models.DateField(auto_now_add=True)
    status = models.CharField(max_length=32, default="Active")
    parent = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True,
                               limit_choices_to={'user_type': 'parent'}, related_name='students')
    created_at = models.DateTimeField(auto_now_add=True)  
    updated_at = models.DateTimeField(auto_now=True)  

    def __str__(self):
        return f"{self.student_id} - {self.name}"


# -----------------------------
# Subject Model
# -----------------------------
class Subject(models.Model):
    name = models.CharField(max_length=100)
    teacher = models.ForeignKey(User, on_delete=models.SET_NULL, null=True,
                                limit_choices_to={'user_type': 'teacher'}, related_name='subjects')

    def __str__(self):
        return self.name


# -----------------------------
# Term Model
# -----------------------------
class Term(models.Model):
    name = models.CharField(max_length=20)
    start_date = models.DateField()
    end_date = models.DateField()

    def __str__(self):
        return self.name


# -----------------------------
# Result / Grade Model
# -----------------------------
class Result(models.Model):
    student = models.ForeignKey(Student, on_delete=models.CASCADE, related_name='results')
    term = models.ForeignKey(Term, on_delete=models.CASCADE, related_name='results')
    subject = models.ForeignKey(Subject, on_delete=models.CASCADE, related_name='results')
    marks = models.FloatField()
    grade = models.CharField(max_length=5)
    uploaded_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True,
                                    limit_choices_to={'user_type': 'teacher'}, related_name='uploaded_results')
    upload_date = models.DateTimeField(auto_now_add=True)
    comments = models.TextField(blank=True, null=True)
    file = models.FileField(upload_to='results/', blank=True, null=True)

    def __str__(self):
        return f"{self.student} - {self.subject} ({self.term})"


# -----------------------------
# Attendance Model
# -----------------------------
class Attendance(models.Model):
    student = models.ForeignKey(Student, on_delete=models.CASCADE, related_name='attendances')
    date = models.DateField()
    status = models.CharField(max_length=10, choices=[('present','Present'),('absent','Absent'),('late','Late'),('excused','Excused')])
    recorded_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True,
                                    limit_choices_to={'user_type':'teacher'}, related_name='recorded_attendance')

    class Meta:
        unique_together = ('student', 'date')
        ordering = ['-date']


# -----------------------------
# Event Model
# -----------------------------
class Event(models.Model):
    title = models.CharField(max_length=255)
    description = models.TextField()
    start = models.DateTimeField()
    end = models.DateTimeField()
    event_type = models.CharField(max_length=50)
    target_audience = models.CharField(max_length=64, default='all')
    def __str__(self):
        return self.title


# -----------------------------
# Fee & Payment Models
# -----------------------------
class Fee(models.Model):
    student = models.ForeignKey(Student, on_delete=models.CASCADE, related_name='fees')
    term = models.ForeignKey(Term, on_delete=models.CASCADE, related_name='fees')
    total_fee = models.DecimalField(max_digits=10, decimal_places=2)
    paid_amount = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    due_date = models.DateField()

    def __str__(self):
        return f"{self.student} - {self.term}"


class Payment(models.Model):
    fee = models.ForeignKey(Fee, on_delete=models.CASCADE, related_name='payments')
    amount = models.DecimalField(max_digits=10, decimal_places=2)
    date = models.DateField(auto_now_add=True)
    method = models.CharField(max_length=50)
    transaction_id = models.CharField(max_length=64, blank=True, null=True)


# -----------------------------
# Feedback Model
# -----------------------------
class Feedback(models.Model):
    parent = models.ForeignKey(User, on_delete=models.CASCADE, limit_choices_to={'user_type':'parent'}, related_name='feedbacks')
    student = models.ForeignKey(Student, on_delete=models.CASCADE, related_name='feedbacks')
    concern_type = models.CharField(max_length=50)
    message = models.TextField()
    request_callback = models.BooleanField(default=False)
    schedule_meeting = models.BooleanField(default=False)
    status = models.CharField(max_length=20, choices=[('new','New'),('read','Read'),('responded','Responded')], default='new')
    assigned_to = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True,
                                    limit_choices_to={'user_type':'teacher'}, related_name='assigned_feedbacks')
    response = models.TextField(blank=True, null=True)
    timestamp = models.DateTimeField(auto_now_add=True)


# -----------------------------
# Message Model
# -----------------------------
class Message(models.Model):
    parent = models.ForeignKey(User, on_delete=models.CASCADE, related_name="messages")
    teacher = models.ForeignKey(User, on_delete=models.CASCADE, related_name="teacher_messages")
    subject = models.CharField(max_length=255)
    message = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)
    read = models.BooleanField(default=False)



# -----------------------------
# Consent Model
# -----------------------------
class Consent(models.Model):
    student = models.ForeignKey(Student, on_delete=models.CASCADE, related_name="consents")
    consent_type = models.CharField(max_length=100)
    status = models.CharField(max_length=20, choices=[("pending", "Pending"), ("granted", "Granted"), ("denied", "Denied")], default="pending")
    created_at = models.DateTimeField(auto_now_add=True)