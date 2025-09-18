from django.db import models
from django.conf import settings
from django.utils import timezone
from decimal import Decimal
from django.contrib.auth.models import AbstractUser
from datetime import timedelta, date
import secrets
import uuid



class TimeStampedModel(models.Model):
    created_at = models.DateTimeField(auto_now_add=True)  
    updated_at = models.DateTimeField(auto_now=True)      

    class Meta:
        abstract = True  


# ==============================
# Custom User
# ==============================
class User(AbstractUser, TimeStampedModel):
    USER_TYPE = [
        ('parent', 'Parent'),
        ('teacher', 'Teacher'),
        ('admin', 'Admin'),
    ]

    phone_number = models.CharField(max_length=20, blank=True, null=True)
    user_type = models.CharField(max_length=20, choices=USER_TYPE)
    is_phone_verified = models.BooleanField(default=False)   
    is_email_verified = models.BooleanField(default=False) 
    def __str__(self):
        return self.username


# ==============================
# OTP Model
# ==============================
class OTP(TimeStampedModel):
    OTP_TYPE = [
        ('login', 'Login'),
        ('registration', 'Registration'),
        ('password_reset', 'Password Reset'),
        ('phone_verification', 'Phone Verification'),
    ]

    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="otps",
        null=True, blank=True
    )
    phone_number = models.CharField(max_length=20, blank=True, null=True)
    email = models.EmailField(blank=True, null=True)
    code = models.CharField(max_length=6)
    otp_type = models.CharField(max_length=20, choices=OTP_TYPE)
    expires_at = models.DateTimeField()
    is_used = models.BooleanField(default=False)

    def save(self, *args, **kwargs):
        if not self.code:
            self.code = str(secrets.randbelow(1000000)).zfill(6)  
        if not self.expires_at:
            self.expires_at = timezone.now() + timedelta(minutes=5)

        if self.user:
            OTP.objects.filter(
                user=self.user, otp_type=self.otp_type, is_used=False
            ).update(is_used=True)

        super().save(*args, **kwargs)

    def is_expired(self):
        return timezone.now() > self.expires_at

    def is_valid(self):
        return not self.is_used and not self.is_expired()

    def __str__(self):
        return f"OTP for {self.user or self.phone_number or self.email} ({self.otp_type})"

class PasswordResetToken(models.Model):
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    token = models.CharField(max_length=128, unique=True, default=uuid.uuid4)
    is_used = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    expires_at = models.DateTimeField()

    def save(self, *args, **kwargs):
        if not self.expires_at:
            self.expires_at = timezone.now() + timedelta(minutes=10) 
        super().save(*args, **kwargs)

    def is_valid(self):
        return not self.is_used and timezone.now() < self.expires_at

    def __str__(self):
        return f"PasswordResetToken({self.user.email}, used={self.is_used})"


# ==============================
# Parent / Student Models
# ==============================


class Student(models.Model):
    parent = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="children")
    name = models.CharField(max_length=255)
    student_id = models.CharField(max_length=50, unique=True)
    class_name = models.CharField(max_length=50)

    def __str__(self):
        return self.name

class Grade(models.Model):
    student = models.ForeignKey(Student, on_delete=models.CASCADE, related_name="grades")
    subject = models.CharField(max_length=100)
    score = models.DecimalField(max_digits=5, decimal_places=2)  
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.student.name} - {self.subject}: {self.score}"


class Attendance(models.Model):
    STATUS_CHOICES = [
        ("present", "Present"),
        ("absent", "Absent"),
    ]
    student = models.ForeignKey(Student, on_delete=models.CASCADE, related_name="attendance_records")
    date = models.DateField()
    status = models.CharField(max_length=10, choices=STATUS_CHOICES)

    class Meta:
        unique_together = ("student", "date")  

    def __str__(self):
        return f"{self.student.name} - {self.date}: {self.status}"
    
class Message(models.Model):
    parent = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="messages")
    student = models.ForeignKey(Student, on_delete=models.CASCADE, related_name="messages")
    type = models.CharField(max_length=50)  
    message = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)


class Fee(models.Model):
    student = models.OneToOneField(Student, on_delete=models.CASCADE, related_name="fee")
    total = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    paid = models.DecimalField(max_digits=10, decimal_places=2, default=0)

    @property
    def due(self):
        return self.total - self.paid


class Payment(models.Model):
    fee = models.ForeignKey(Fee, on_delete=models.CASCADE, related_name="payments")
    amount = models.DecimalField(max_digits=10, decimal_places=2)
    method = models.CharField(max_length=50)  
    transaction_id = models.CharField(max_length=100, unique=True)
    date = models.DateTimeField(auto_now_add=True)


class Consent(models.Model):
    student = models.ForeignKey(Student, on_delete=models.CASCADE, related_name="consents")
    consent_type = models.CharField(max_length=100)  
    status = models.CharField(max_length=20, choices=[("pending", "Pending"), ("granted", "Granted"), ("denied", "Denied")], default="pending")
    created_at = models.DateTimeField(auto_now_add=True)


class Event(models.Model):
    title = models.CharField(max_length=255)
    description = models.TextField(blank=True)
    date = models.DateField()
    created_at = models.DateTimeField(auto_now_add=True)
