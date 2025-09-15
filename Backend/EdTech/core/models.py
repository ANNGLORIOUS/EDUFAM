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
# STUDENT MODEL
# ----------------------
class Student(models.Model):
    first_name = models.CharField(max_length=100)
    last_name = models.CharField(max_length=100)
    classroom = models.CharField(max_length=100)
    grade = models.CharField(max_length=10)
    parents = models.ManyToManyField(
        settings.AUTH_USER_MODEL,
        related_name="children",
        limit_choices_to={"role": "parent"},
        blank=True,
    )

    def __str__(self):
        return f"{self.first_name} {self.last_name}"


# ----------------------
# TEACHER TABLES
# ----------------------
class Teacher(models.Model):
    user = models.OneToOneField(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    subject = models.CharField(max_length=100, blank=True)

    def __str__(self):
        return f"{self.user.username} - {self.subject or 'No subject'}"


class AttendanceRecord(models.Model):
    STATUS_CHOICES = (("PRESENT", "Present"), ("ABSENT", "Absent"))
    student = models.ForeignKey(Student, on_delete=models.CASCADE)
    date = models.DateField()
    status = models.CharField(max_length=10, choices=STATUS_CHOICES)
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

    def __str__(self):
        return f"{self.student} - {self.date} - {self.status}"


class GradeRecord(models.Model):
    student = models.ForeignKey(Student, on_delete=models.CASCADE)
    subject = models.CharField(max_length=100)
    grade = models.DecimalField(max_digits=5, decimal_places=2)
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


class Event(models.Model):
    title = models.CharField(max_length=255)
    description = models.TextField(blank=True)
    date = models.DateTimeField()
    created_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        limit_choices_to={"role": "teacher"},
    )
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.title} ({self.date.date()})"


class FeeAccount(models.Model):
    student = models.OneToOneField(Student, on_delete=models.CASCADE)
    balance = models.DecimalField(max_digits=10, decimal_places=2, default=0)

    def __str__(self):
        return f"{self.student} - Balance: {self.balance}"


class Payment(models.Model):
    fee_account = models.ForeignKey(FeeAccount, on_delete=models.CASCADE)
    amount = models.DecimalField(max_digits=10, decimal_places=2)
    date = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.fee_account} - {self.amount} on {self.date}"


# ----------------------
# ADMIN TABLES
# ----------------------
class AuditLog(models.Model):
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, blank=True)
    action = models.CharField(max_length=255)
    timestamp = models.DateTimeField(auto_now_add=True)
    details = models.JSONField(default=dict, blank=True)

    def __str__(self):
        return f"{self.action} by {self.user} at {self.timestamp}"


def validate_menu_json(value):
    """
    Validate that menu_json has the expected schema.
    """
    if "welcome_text" not in value or "menus" not in value:
        raise ValidationError("menu_json must contain 'welcome_text' and 'menus' keys")


class USSDConfig(models.Model):
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