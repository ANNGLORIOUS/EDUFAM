from django.db import models
from django.conf import settings
from django.utils import timezone
from decimal import Decimal
from django.contrib.auth.models import AbstractUser
from phonenumber_field.modelfields import PhoneNumberField
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
class Parent(models.Model):
    user = models.OneToOneField(
        settings.AUTH_USER_MODEL, 
        on_delete=models.CASCADE,
        related_name='parent_profile'
    )
    address = models.TextField(blank=True, null=True)
    emergency_contact = models.CharField(max_length=20, blank=True, null=True)
    relationship_to_student = models.CharField(
        max_length=20,
        choices=[
            ('mother', 'Mother'),
            ('father', 'Father'),
            ('guardian', 'Guardian'),
            ('grandparent', 'Grandparent'),
            ('other', 'Other')
        ],
        default='guardian'
    )    
    is_primary_contact = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name_plural = "Parents"
        ordering = ['user__first_name', 'user__last_name']

    def __str__(self):
        return f"{self.user.get_full_name() or self.user.username}"

    @property
    def full_name(self):
        return self.user.get_full_name() or self.user.username

    @property
    def phone_number(self):
        return self.user.phone_number


class Student(models.Model):
    GENDER_CHOICES = [
        ('M', 'Male'),
        ('F', 'Female'),
    ]

    admission_number = models.CharField(max_length=20, unique=True)
    first_name = models.CharField(max_length=100)
    last_name = models.CharField(max_length=100)
    date_of_birth = models.DateField()
    gender = models.CharField(max_length=1, choices=GENDER_CHOICES)
    classroom = models.CharField(max_length=100)
    grade = models.CharField(max_length=10)
    parents = models.ManyToManyField(Parent, related_name='children', through='StudentParentRelation')
    is_active = models.BooleanField(default=True)
    graduation_date = models.DateField(blank=True, null=True)
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['first_name', 'last_name']

    def __str__(self):
        return f"{self.admission_number} - {self.full_name}"

    @property
    def full_name(self):
        return f"{self.first_name} {self.last_name}"

    @property
    def age(self):
        today = date.today()
        return today.year - self.date_of_birth.year - (
            (today.month, today.day) < (self.date_of_birth.month, self.date_of_birth.day)
        )


class StudentParentRelation(models.Model):
    student = models.ForeignKey(Student, on_delete=models.CASCADE)
    parent = models.ForeignKey(Parent, on_delete=models.CASCADE)
    relationship_type = models.CharField(
        max_length=20,
        choices=[
            ('mother', 'Mother'),
            ('father', 'Father'),
            ('guardian', 'Guardian'),
            ('grandparent', 'Grandparent'),
            ('other', 'Other')
        ]
    )
    is_emergency_contact = models.BooleanField(default=False)
    is_fee_responsible = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ['student', 'parent']

    def __str__(self):
        return f"{self.parent} - {self.student} ({self.relationship_type})"


# ==============================
# Fees & Payments
# ==============================
class FeeStructure(models.Model):
    name = models.CharField(max_length=100)  
    amount = models.DecimalField(max_digits=10, decimal_places=2)
    is_mandatory = models.BooleanField(default=True)
    due_date = models.DateField()
    description = models.TextField(blank=True, null=True)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['name', 'due_date']

    def __str__(self):
        return f"{self.name} - {self.amount}"


class FeeAccount(models.Model):
    student = models.OneToOneField(Student, on_delete=models.CASCADE, related_name='fee_account')
    total_fee_due = models.DecimalField(max_digits=10, decimal_places=2, default=Decimal('0.00'))
    total_paid = models.DecimalField(max_digits=10, decimal_places=2, default=Decimal('0.00'))
    balance = models.DecimalField(max_digits=10, decimal_places=2, default=Decimal('0.00'))
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.student} - Balance: {self.balance}"

    @property
    def is_fee_paid(self):
        return self.balance <= 0

    def update_balance(self):
        self.balance = self.total_fee_due - self.total_paid
        self.save()


class Payment(models.Model):
    PAYMENT_METHODS = [
        ('mpesa', 'M-Pesa'),
        ('bank', 'Bank Transfer'),
        ('cash', 'Cash'),
        ('cheque', 'Cheque'),
        ('card', 'Credit/Debit Card'),
    ]

    PAYMENT_STATUS = [
        ('pending', 'Pending'),
        ('completed', 'Completed'),
        ('failed', 'Failed'),
        ('refunded', 'Refunded'),
    ]

    student = models.ForeignKey(Student, on_delete=models.CASCADE, related_name='payments')
    payment_id = models.CharField(max_length=50, unique=True, default=uuid.uuid4)
    amount = models.DecimalField(max_digits=10, decimal_places=2)
    payment_method = models.CharField(max_length=20, choices=PAYMENT_METHODS)
    
    transaction_reference = models.CharField(max_length=100, blank=True, null=True)
    mpesa_receipt = models.CharField(max_length=20, blank=True, null=True)
    status = models.CharField(max_length=20, choices=PAYMENT_STATUS, default='pending')
    
    paid_by = models.ForeignKey(Parent, on_delete=models.CASCADE, related_name='payments')
    recorded_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        blank=True,
        null=True,
        limit_choices_to={'user_type__in': ['admin', 'teacher']},
        related_name='recorded_payments'
    )
    
    payment_date = models.DateTimeField(default=timezone.now)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    notes = models.TextField(blank=True, null=True)

    class Meta:
        ordering = ['-payment_date']

    def __str__(self):
        return f"Payment {self.payment_id} - {self.student} - {self.amount}"

    def save(self, *args, **kwargs):
        if not self.payment_id:
            self.payment_id = str(uuid.uuid4())
        super().save(*args, **kwargs)
        
        if self.status == 'completed':
            fee_account, created = FeeAccount.objects.get_or_create(student=self.student)
            fee_account.total_paid = sum(
                p.amount for p in self.student.payments.filter(status='completed')
            )
            fee_account.update_balance()


# ==============================
# Messaging
# ==============================
class MessageThread(models.Model):
    participants = models.ManyToManyField(settings.AUTH_USER_MODEL, related_name='message_threads')
    student = models.ForeignKey(Student, on_delete=models.CASCADE, blank=True, null=True, related_name='message_threads')
    subject = models.CharField(max_length=200)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-updated_at']

    def __str__(self):
        return f"Thread: {self.subject}"

    @property
    def last_message(self):
        return self.messages.last()


class Message(models.Model):
    thread = models.ForeignKey(MessageThread, on_delete=models.CASCADE, related_name='messages')
    sender = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='sent_messages')
    content = models.TextField()
    is_read = models.BooleanField(default=False)
    read_at = models.DateTimeField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['created_at']

    def __str__(self):
        return f"Message from {self.sender}: {self.content[:30]}..."


# ==============================
# Consent
# ==============================
class Consent(models.Model):
    CONSENT_TYPES = [
        ('data_sharing', 'Data Sharing'),
        ('medical_info', 'Medical Information'),
        ('photo_video', 'Photo/Video Usage'),
        ('communication', 'Communication Preferences'),
        ('emergency_contact', 'Emergency Contact Authorization'),
    ]

    student = models.ForeignKey(Student, on_delete=models.CASCADE, related_name='consents')
    parent = models.ForeignKey(Parent, on_delete=models.CASCADE, related_name='given_consents')
    consent_type = models.CharField(max_length=50, choices=CONSENT_TYPES)
    is_granted = models.BooleanField(default=False)
    granted_at = models.DateTimeField(blank=True, null=True)
    revoked_at = models.DateTimeField(blank=True, null=True)
    notes = models.TextField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        unique_together = ['student', 'parent', 'consent_type']
        ordering = ['-updated_at']

    def __str__(self):
        status = "Granted" if self.is_granted else "Revoked"
        return f"{self.student} - {self.get_consent_type_display()} - {status}"

    def grant_consent(self):
        self.is_granted = True
        self.granted_at = timezone.now()
        self.revoked_at = None
        self.save()

    def revoke_consent(self):
        self.is_granted = False
        self.revoked_at = timezone.now()
        self.save()


# ==============================
# Audit Log
# ==============================
class AuditLog(models.Model):
    ACTION_TYPES = [
        ('create', 'Create'),
        ('update', 'Update'),
        ('delete', 'Delete'),
        ('login', 'Login'),
        ('logout', 'Logout'),
        ('payment', 'Payment'),
        ('grade_entry', 'Grade Entry'),
        ('consent_change', 'Consent Change'),
    ]

    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='audit_logs')
    action_type = models.CharField(max_length=20, choices=ACTION_TYPES)
    model_name = models.CharField(max_length=50)  
    object_id = models.CharField(max_length=50)  
    changes = models.JSONField(blank=True, null=True)  
    ip_address = models.GenericIPAddressField(blank=True, null=True)
    user_agent = models.TextField(blank=True, null=True)
    timestamp = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-timestamp']

    def __str__(self):
        return f"{self.user} - {self.action_type} - {self.model_name} - {self.timestamp}"
