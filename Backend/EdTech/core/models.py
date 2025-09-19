from django.db import models
from django.contrib.auth.models import AbstractUser
from django.conf import settings
from django.core.exceptions import ValidationError


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
# PARENT MODEL
# ----------------------
class Parent(models.Model):
    user = models.OneToOneField(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        limit_choices_to={"role": "parent"},
        related_name="parent_profile",
    )
    phone_number = models.CharField(max_length=20, blank=True, null=True)
    occupation = models.CharField(max_length=100, blank=True, null=True)
    address = models.TextField(blank=True, null=True)

    def __str__(self):
        return f"Parent: {self.user.get_full_name()} ({self.phone_number or 'No phone'})"



# ----------------------
# STUDENT MODEL
# ----------------------
class Student(models.Model):
    student_id = models.CharField(max_length=64, unique=True, default="")
    first_name = models.CharField(max_length=100)
    last_name = models.CharField(max_length=100)
    classroom = models.CharField(max_length=100)
    grade = models.CharField(max_length=10)
    status = models.CharField(max_length=32, default="Active")
    parent_email = models.EmailField(blank=True, null=True)

    parents = models.ManyToManyField(
        settings.AUTH_USER_MODEL,
        related_name="children",
        limit_choices_to={"role": "parent"},
        blank=True,
    )

    def __str__(self):
        return f"{self.student_id} - {self.first_name} {self.last_name}"


# ----------------------
# TEACHER MODEL
# ----------------------
class Teacher(models.Model):
    user = models.OneToOneField(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    subject = models.CharField(max_length=100, blank=True)

    def __str__(self):
        return f"{self.user.username} - {self.subject or 'No subject'}"


# ----------------------
# ATTENDANCE
# ----------------------
class AttendanceRecord(models.Model):
    STATUS_CHOICES = (
        ("present", "Present"),
        ("absent", "Absent"),
        ("late", "Late"),
        ("excused", "Excused"),
    )
    student = models.ForeignKey(Student, on_delete=models.CASCADE)
    date = models.DateField()
    term = models.CharField(max_length=32, default="Term 1")
    weeks = models.JSONField(default=list, blank=True)  # e.g. [true, false, ...]
    attendance_percent = models.IntegerField(default=0)
    status = models.CharField(max_length=16, choices=STATUS_CHOICES, default="present")
    recorded_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        limit_choices_to={"role": "teacher"},
    )
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-date"]

    def save(self, *args, **kwargs):
        if self.weeks:
            self.attendance_percent = int((sum(self.weeks) / len(self.weeks)) * 100)
        super().save(*args, **kwargs)

    def __str__(self):
        return f"{self.student} - {self.date} - {self.attendance_percent}%"


# ----------------------
# GRADES / RESULTS
# ----------------------
class GradeRecord(models.Model):
    student = models.ForeignKey(Student, on_delete=models.CASCADE)
    subject = models.CharField(max_length=100)
    term = models.CharField(max_length=32, default="Term 1")
    grade = models.CharField(max_length=8)
    file = models.FileField(upload_to="results/", null=True, blank=True)
    parent_email = models.EmailField(blank=True, null=True)
    recorded_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        limit_choices_to={"role": "teacher"},
    )
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.student} - {self.subject}: {self.grade}"


# ----------------------
# FLAGS
# ----------------------
class StudentFlag(models.Model):
    FLAG_TYPES = (("HEALTH", "Health"), ("DISCIPLINE", "Discipline"))
    student = models.ForeignKey(Student, on_delete=models.CASCADE)
    flag_type = models.CharField(max_length=50, choices=FLAG_TYPES)
    description = models.TextField()
    created_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        limit_choices_to={"role": "teacher"},
    )
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.student} - {self.flag_type}"


# ----------------------
# EVENTS
# ----------------------
class Event(models.Model):
    title = models.CharField(max_length=255)
    description = models.TextField(blank=True)
    date = models.DateField()
    start_time = models.TimeField(null=True, blank=True)
    end_time = models.TimeField(null=True, blank=True)
    created_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        limit_choices_to={"role": "teacher"},
    )
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.title} ({self.date})"


# ----------------------
# FEES
# ----------------------
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
    fee_account = models.ForeignKey(FeeAccount, on_delete=models.CASCADE)
    amount = models.DecimalField(max_digits=10, decimal_places=2)
    date = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.fee_account} - {self.amount} on {self.date}"


# ----------------------
# FEEDBACK
# ----------------------
class Feedback(models.Model):
    parent_name = models.CharField(max_length=255)
    parent_email = models.EmailField()
    student = models.ForeignKey(Student, on_delete=models.CASCADE)
    concern_type = models.CharField(max_length=64)
    message = models.TextField()
    request_callback = models.BooleanField(default=False)
    schedule_meeting = models.BooleanField(default=False)
    timestamp = models.DateTimeField(auto_now_add=True)
    status = models.CharField(max_length=32, default="new")

    def __str__(self):
        return f"Feedback from {self.parent_email}"


# ----------------------
# SMS CAMPAIGNS
# ----------------------
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


# ----------------------
# ADMIN TOOLS
# ----------------------
class AuditLog(models.Model):
    """
    Tracks who did what and when.
    Useful for accountability, debugging, and admin dashboards.
    """
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
    """
    Stores USSD menu configuration in JSON format.
    Allows dynamic updates without code changes.
    """
    name = models.CharField(max_length=100, default="default", unique=True)
    menu_json = models.JSONField(default=dict, blank=True, validators=[validate_menu_json])
    updated_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        limit_choices_to={"role": "admin"},
    )
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"USSD config: {self.name} (updated: {self.updated_at})"
