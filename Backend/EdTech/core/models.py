from django.db import models
from django.conf import settings
from django.utils import timezone
from django.core.exceptions import ValidationError
from django.contrib.auth.models import AbstractUser
from datetime import timedelta, date
import secrets
import uuid

# ==============================
# Custom User
# ==============================
class User(AbstractUser):
    ROLE_CHOICES = (
        ("parent", "Parent"),
        ("teacher", "Teacher"),
        ("admin", "Admin"),
    )
    role = models.CharField(max_length=20, choices=ROLE_CHOICES)
    phone_number = models.CharField(max_length=20, blank=True, null=True)
    is_phone_verified = models.BooleanField(default=False)
    is_email_verified = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.username} ({self.role})"


# ==============================
# Parent / Teacher Profiles
# ==============================
class Parent(models.Model):
    user = models.OneToOneField(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        limit_choices_to={"role": "parent"},
        related_name="parent_profile",
    )
    occupation = models.CharField(max_length=100, blank=True, null=True)
    address = models.TextField(blank=True, null=True)

    def __str__(self):
        return f"Parent: {self.user.get_full_name()}"


class Teacher(models.Model):
    user = models.OneToOneField(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    subject = models.CharField(max_length=100, blank=True)

    def __str__(self):
        return f"{self.user.username} - {self.subject or 'No subject'}"


# ==============================
# OTP + Password Reset
# ==============================
class OTP(models.Model):
    OTP_TYPE = [
        ("login", "Login"),
        ("registration", "Registration"),
        ("password_reset", "Password Reset"),
        ("phone_verification", "Phone Verification"),
    ]

    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="otps", null=True, blank=True)
    phone_number = models.CharField(max_length=20, blank=True, null=True)
    email = models.EmailField(blank=True, null=True)
    code = models.CharField(max_length=6)
    otp_type = models.CharField(max_length=20, choices=OTP_TYPE)
    expires_at = models.DateTimeField()
    is_used = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def save(self, *args, **kwargs):
        if not self.code:
            self.code = str(secrets.randbelow(1000000)).zfill(6)
        if not self.expires_at:
            self.expires_at = timezone.now() + timedelta(minutes=5)
        if self.user:
            OTP.objects.filter(user=self.user, otp_type=self.otp_type, is_used=False).update(is_used=True)
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
# Academic Models
# ==============================
class Class(models.Model):
    name = models.CharField(max_length=50)
    academic_year = models.CharField(max_length=10)
    teachers = models.ManyToManyField(User, limit_choices_to={'role': 'teacher'}, related_name='classes')

    def __str__(self):
        return f"{self.name} ({self.academic_year})"


class Student(models.Model):
    student_id = models.CharField(max_length=64, unique=True)
    first_name = models.CharField(max_length=100)
    last_name = models.CharField(max_length=100)
    student_class = models.ForeignKey(Class, on_delete=models.SET_NULL, null=True, related_name='students')
    status = models.CharField(max_length=32, default="Active")
    parents = models.ManyToManyField(settings.AUTH_USER_MODEL, related_name="children", limit_choices_to={"role": "parent"}, blank=True)
    date_added = models.DateField(auto_now_add=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.student_id} - {self.first_name} {self.last_name}"


class Subject(models.Model):
    name = models.CharField(max_length=100)
    teacher = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, limit_choices_to={'role': 'teacher'}, related_name='subjects')

    def __str__(self):
        return self.name


class Term(models.Model):
    name = models.CharField(max_length=20)
    start_date = models.DateField()
    end_date = models.DateField()

    def __str__(self):
        return self.name


class GradeRecord(models.Model):
    student = models.ForeignKey(Student, on_delete=models.CASCADE, related_name='results')
    term = models.ForeignKey(Term, on_delete=models.CASCADE, related_name='results')
    subject = models.ForeignKey(Subject, on_delete=models.CASCADE, related_name='results')
    marks = models.FloatField()
    grade = models.CharField(max_length=5)
    uploaded_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, limit_choices_to={'role': 'teacher'}, related_name='uploaded_results')
    upload_date = models.DateTimeField(auto_now_add=True)
    comments = models.TextField(blank=True, null=True)
    file = models.FileField(upload_to='results/', blank=True, null=True)

    def __str__(self):
        return f"{self.student} - {self.subject} ({self.term})"


# ==============================
# Attendance
# ==============================
class AttendanceRecord(models.Model):
    STATUS_CHOICES = (("present", "Present"), ("absent", "Absent"), ("late", "Late"), ("excused", "Excused"))
    student = models.ForeignKey(Student, on_delete=models.CASCADE, related_name='attendances')
    date = models.DateField()
    term = models.CharField(max_length=32, default="Term 1")
    weeks = models.JSONField(default=list, blank=True)
    attendance_percent = models.IntegerField(default=0)
    status = models.CharField(max_length=16, choices=STATUS_CHOICES, default="present")
    recorded_by = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, blank=True, limit_choices_to={"role": "teacher"})
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ('student', 'date')
        ordering = ['-date']

    def save(self, *args, **kwargs):
        if self.weeks:
            numeric_weeks = [int(w) for w in self.weeks if str(w).isdigit()]
            if numeric_weeks:
                self.attendance_percent = int((sum(numeric_weeks) / len(numeric_weeks)) * 100)
            else:
                self.attendance_percent = 0
        super().save(*args, **kwargs)

    def __str__(self):
        return f"{self.student} - {self.date} - {self.attendance_percent}%"


# ==============================
# Events
# ==============================
class Event(models.Model):
    title = models.CharField(max_length=255)
    description = models.TextField(blank=True)
    start = models.DateTimeField()
    end = models.DateTimeField()
    event_type = models.CharField(max_length=50)
    target_audience = models.CharField(max_length=64, default='all')
    start_time = models.TimeField(null=True, blank=True)
    end_time = models.TimeField(null=True, blank=True)
    created_by = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, blank=True, limit_choices_to={"role": "teacher"})
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.title


# ==============================
# Fees & Payments
# ==============================
class Fee(models.Model):
    student = models.ForeignKey(Student, on_delete=models.CASCADE, related_name='fees')
    term = models.ForeignKey(Term, on_delete=models.CASCADE, related_name='fees')
    total_fee = models.DecimalField(max_digits=10, decimal_places=2)
    paid_amount = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    due_date = models.DateField()

    def __str__(self):
        return f"{self.student} - {self.term}"


class FeeAccount(models.Model):
    student = models.OneToOneField(Student, on_delete=models.CASCADE)
    balance = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    currency = models.CharField(max_length=8, default="KES")
    next_payment_due = models.DateField(null=True, blank=True)

    @property
    def due_amount(self):
        return self.balance

    def __str__(self):
        return f"{self.student} - Balance: {self.balance}"


class Payment(models.Model):
    fee_account = models.ForeignKey(FeeAccount, on_delete=models.CASCADE, related_name="payments")
    amount = models.DecimalField(max_digits=10, decimal_places=2)
    date = models.DateTimeField(auto_now_add=True)
    method = models.CharField(max_length=50, blank=True, null=True)
    transaction_id = models.CharField(max_length=64, blank=True, null=True)

    def __str__(self):
        return f"{self.fee_account} - {self.amount}"


# ==============================
# Communication
# ==============================
class Feedback(models.Model):
    parent = models.ForeignKey(User, on_delete=models.CASCADE, limit_choices_to={'role':'parent'}, related_name='feedbacks')
    student = models.ForeignKey(Student, on_delete=models.CASCADE, related_name='feedbacks')
    concern_type = models.CharField(max_length=50)
    message = models.TextField()
    request_callback = models.BooleanField(default=False)
    schedule_meeting = models.BooleanField(default=False)
    status = models.CharField(max_length=20, choices=[('new','New'),('read','Read'),('responded','Responded')], default='new')
    assigned_to = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True, limit_choices_to={'role':'teacher'}, related_name='assigned_feedbacks')
    response = models.TextField(blank=True, null=True)
    timestamp = models.DateTimeField(auto_now_add=True)


class Message(models.Model):
    parent = models.ForeignKey(User, on_delete=models.CASCADE, related_name="messages")
    teacher = models.ForeignKey(User, on_delete=models.CASCADE, related_name="teacher_messages")
    subject = models.CharField(max_length=255)
    message = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)
    read = models.BooleanField(default=False)


# ==============================
# Student Flags & Consent
# ==============================
class StudentFlag(models.Model):
    FLAG_TYPES = (("HEALTH", "Health"), ("DISCIPLINE", "Discipline"))
    student = models.ForeignKey(Student, on_delete=models.CASCADE)
    flag_type = models.CharField(max_length=50, choices=FLAG_TYPES)
    description = models.TextField()
    created_by = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, blank=True, limit_choices_to={"role": "teacher"})
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.student} - {self.flag_type}"


class Consent(models.Model):
    student = models.ForeignKey(Student, on_delete=models.CASCADE, related_name="consents")
    consent_type = models.CharField(max_length=100)
    status = models.CharField(max_length=20, choices=[("pending", "Pending"), ("granted", "Granted"), ("denied", "Denied")], default="pending")
    created_at = models.DateTimeField(auto_now_add=True)


# ==============================
# Admin Tools (from v2)
# ==============================
class SMSCampaign(models.Model):
    message = models.TextField()
    recipient_type = models.CharField(max_length=64, default="all")
    recipient_filter = models.JSONField(null=True, blank=True)
    recipient_count = models.IntegerField(default=0)
    status = models.CharField(max_length=32, default="draft")
    created_by = models.CharField(max_length=255)
    created_at = models.DateTimeField(auto_now_add=True)
    delivery_stats = models.JSONField(null=True, blank=True)
    scheduled_at = models.DateTimeField(null=True, blank=True)

    def __str__(self):
        return f"SMS Campaign: {self.message[:30]}"


class AuditLog(models.Model):
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, blank=True)
    action = models.CharField(max_length=255)
    timestamp = models.DateTimeField(auto_now_add=True)
    details = models.JSONField(default=dict, blank=True)

    def __str__(self):
        return f"{self.action} by {self.user} at {self.timestamp}"


def validate_menu_json(value):
    if "welcome_text" not in value or "menus" not in value:
        raise ValidationError("menu_json must contain 'welcome_text' and 'menus' keys")


class USSDConfig(models.Model):
    name = models.CharField(max_length=100, unique=True)
    menu_json = models.JSONField(default=dict, blank=True, validators=[validate_menu_json])
    updated_by = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, blank=True, limit_choices_to={"role": "admin"})
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"USSD config: {self.name} (updated: {self.updated_at})"
