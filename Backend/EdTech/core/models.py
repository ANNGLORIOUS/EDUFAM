from django.db import models
from django.conf import settings
from django.utils import timezone
from decimal import Decimal
import uuid


class Parent(models.Model):
    """Parent/Guardian model linked to User"""
    user = models.OneToOneField(
        settings.AUTH_USER_MODEL, 
        on_delete=models.CASCADE,
        related_name='parent_profile'
    )
    address = models.TextField(blank=True, null=True)
    occupation = models.CharField(max_length=100, blank=True, null=True)
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
        default='parent'
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


class School(models.Model):
    """School model for multi-school support"""
    name = models.CharField(max_length=200)
    code = models.CharField(max_length=20, unique=True)
    address = models.TextField()
    phone = models.CharField(max_length=20)
    email = models.EmailField()
    logo = models.ImageField(upload_to='school_logos/', blank=True, null=True)
    established_date = models.DateField(blank=True, null=True)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.name


class AcademicYear(models.Model):
    """Academic Year model"""
    name = models.CharField(max_length=20)  # e.g., "2024-2025"
    start_date = models.DateField()
    end_date = models.DateField()
    is_current = models.BooleanField(default=False)
    school = models.ForeignKey(School, on_delete=models.CASCADE, related_name='academic_years')
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ['school', 'name']
        ordering = ['-start_date']

    def __str__(self):
        return f"{self.name} - {self.school.name}"

    def save(self, *args, **kwargs):
        if self.is_current:
            # Ensure only one academic year is current per school
            AcademicYear.objects.filter(school=self.school, is_current=True).update(is_current=False)
        super().save(*args, **kwargs)


class Term(models.Model):
    """Term/Semester model"""
    TERM_CHOICES = [
        (1, 'Term 1'),
        (2, 'Term 2'),
        (3, 'Term 3'),
    ]
    
    academic_year = models.ForeignKey(AcademicYear, on_delete=models.CASCADE, related_name='terms')
    term_number = models.IntegerField(choices=TERM_CHOICES)
    start_date = models.DateField()
    end_date = models.DateField()
    is_current = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ['academic_year', 'term_number']
        ordering = ['academic_year', 'term_number']

    def __str__(self):
        return f"{self.get_term_number_display()} - {self.academic_year}"

    def save(self, *args, **kwargs):
        if self.is_current:
            # Ensure only one term is current per academic year
            Term.objects.filter(academic_year=self.academic_year, is_current=True).update(is_current=False)
        super().save(*args, **kwargs)


class ClassRoom(models.Model):
    """Class/Grade model"""
    name = models.CharField(max_length=50)  # e.g., "Grade 1A", "Form 4 Blue"
    grade_level = models.IntegerField()  # 1-12 or as per system
    section = models.CharField(max_length=10, blank=True, null=True)  # A, B, C, etc.
    school = models.ForeignKey(School, on_delete=models.CASCADE, related_name='classes')
    academic_year = models.ForeignKey(AcademicYear, on_delete=models.CASCADE, related_name='classes')
    class_teacher = models.ForeignKey(
        settings.AUTH_USER_MODEL, 
        on_delete=models.SET_NULL, 
        null=True, 
        blank=True,
        related_name='classes_as_teacher',
        limit_choices_to={'user_type': 'teacher'}
    )
    capacity = models.IntegerField(default=30)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ['name', 'school', 'academic_year']
        ordering = ['grade_level', 'section']

    def __str__(self):
        return f"{self.name} - {self.school.name}"

    @property
    def student_count(self):
        return self.students.filter(is_active=True).count()


class Subject(models.Model):
    """Subject model"""
    name = models.CharField(max_length=100)
    code = models.CharField(max_length=10)
    description = models.TextField(blank=True, null=True)
    school = models.ForeignKey(School, on_delete=models.CASCADE, related_name='subjects')
    is_core = models.BooleanField(default=False)  # Core vs Optional subjects
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ['name', 'school']
        ordering = ['name']

    def __str__(self):
        return f"{self.name} ({self.code})"


class Student(models.Model):
    """Student model"""
    GENDER_CHOICES = [
        ('M', 'Male'),
        ('F', 'Female'),
    ]

    # Personal Information
    admission_number = models.CharField(max_length=20, unique=True)
    first_name = models.CharField(max_length=100)
    last_name = models.CharField(max_length=100)
    date_of_birth = models.DateField()
    gender = models.CharField(max_length=1, choices=GENDER_CHOICES)
    
    # School Information
    school = models.ForeignKey(School, on_delete=models.CASCADE, related_name='students')
    current_class = models.ForeignKey(ClassRoom, on_delete=models.SET_NULL, null=True, related_name='students')
    admission_date = models.DateField()
    
    # Parent/Guardian Relations
    parents = models.ManyToManyField(Parent, related_name='children', through='StudentParentRelation')
    
    # Contact Information
    address = models.TextField(blank=True, null=True)
    
    # Medical Information
    medical_conditions = models.TextField(blank=True, null=True)
    allergies = models.TextField(blank=True, null=True)
    blood_group = models.CharField(max_length=5, blank=True, null=True)
    
    # Status
    is_active = models.BooleanField(default=True)
    graduation_date = models.DateField(blank=True, null=True)
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['first_name', 'last_name']

    def __str__(self):
        return f"{self.admission_number} - {self.get_full_name()}"

    def get_full_name(self):
        return f"{self.first_name} {self.last_name}"

    @property
    def age(self):
        from datetime import date
        today = date.today()
        return today.year - self.date_of_birth.year - ((today.month, today.day) < (self.date_of_birth.month, self.date_of_birth.day))


class StudentParentRelation(models.Model):
    """Through model for Student-Parent relationship"""
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


class GradeRecord(models.Model):
    """Grade/Marks record"""
    ASSESSMENT_TYPES = [
        ('assignment', 'Assignment'),
        ('quiz', 'Quiz'),
        ('midterm', 'Mid-term Exam'),
        ('final', 'Final Exam'),
        ('project', 'Project'),
        ('participation', 'Participation'),
    ]

    student = models.ForeignKey(Student, on_delete=models.CASCADE, related_name='grades')
    subject = models.ForeignKey(Subject, on_delete=models.CASCADE, related_name='grades')
    term = models.ForeignKey(Term, on_delete=models.CASCADE, related_name='grades')
    teacher = models.ForeignKey(
        settings.AUTH_USER_MODEL, 
        on_delete=models.CASCADE,
        limit_choices_to={'user_type': 'teacher'},
        related_name='recorded_grades'
    )
    
    assessment_type = models.CharField(max_length=20, choices=ASSESSMENT_TYPES)
    assessment_name = models.CharField(max_length=100)  # e.g., "Math Quiz 1"
    total_marks = models.DecimalField(max_digits=6, decimal_places=2)
    obtained_marks = models.DecimalField(max_digits=6, decimal_places=2)
    
    assessment_date = models.DateField()
    recorded_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    comments = models.TextField(blank=True, null=True)

    class Meta:
        ordering = ['-assessment_date', 'subject__name']

    def __str__(self):
        return f"{self.student} - {self.subject} - {self.assessment_name}"

    @property
    def percentage(self):
        if self.total_marks > 0:
            return round((self.obtained_marks / self.total_marks) * 100, 2)
        return 0

    @property
    def grade_letter(self):
        percentage = self.percentage
        if percentage >= 90:
            return 'A'
        elif percentage >= 80:
            return 'B'
        elif percentage >= 70:
            return 'C'
        elif percentage >= 60:
            return 'D'
        else:
            return 'F'


class AttendanceRecord(models.Model):
    """Attendance record"""
    STATUS_CHOICES = [
        ('present', 'Present'),
        ('absent', 'Absent'),
        ('late', 'Late'),
        ('excused', 'Excused Absence'),
    ]

    student = models.ForeignKey(Student, on_delete=models.CASCADE, related_name='attendance')
    date = models.DateField()
    status = models.CharField(max_length=10, choices=STATUS_CHOICES)
    
    # Optional: Track by period/subject
    subject = models.ForeignKey(Subject, on_delete=models.CASCADE, blank=True, null=True)
    period = models.IntegerField(blank=True, null=True)  # Period number
    
    recorded_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        limit_choices_to={'user_type__in': ['teacher', 'admin']},
        related_name='recorded_attendance'
    )
    
    notes = models.TextField(blank=True, null=True)
    recorded_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ['student', 'date', 'subject', 'period']
        ordering = ['-date', 'student__first_name']

    def __str__(self):
        subject_info = f" - {self.subject}" if self.subject else ""
        return f"{self.student} - {self.date} - {self.get_status_display()}{subject_info}"


class FeeStructure(models.Model):
    """Fee structure for different classes/grades"""
    name = models.CharField(max_length=100)  # e.g., "Tuition Fee", "Transport Fee"
    amount = models.DecimalField(max_digits=10, decimal_places=2)
    class_rooms = models.ManyToManyField(ClassRoom, related_name='fee_structures')
    term = models.ForeignKey(Term, on_delete=models.CASCADE, related_name='fee_structures')
    
    is_mandatory = models.BooleanField(default=True)
    due_date = models.DateField()
    
    description = models.TextField(blank=True, null=True)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['name', 'due_date']

    def __str__(self):
        return f"{self.name} - {self.amount} ({self.term})"


class FeeAccount(models.Model):
    """Student fee account"""
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
        """Recalculate balance based on payments"""
        self.balance = self.total_fee_due - self.total_paid
        self.save()


class Payment(models.Model):
    """Payment record"""
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
    
    # Payment details
    transaction_reference = models.CharField(max_length=100, blank=True, null=True)
    mpesa_receipt = models.CharField(max_length=20, blank=True, null=True)
    
    status = models.CharField(max_length=20, choices=PAYMENT_STATUS, default='pending')
    
    # Tracking
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
        
        # Update fee account balance when payment is completed
        if self.status == 'completed':
            fee_account, created = FeeAccount.objects.get_or_create(student=self.student)
            fee_account.total_paid += self.amount
            fee_account.update_balance()


class MessageThread(models.Model):
    """Message thread between parent and teacher/admin"""
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
    """Individual message in a thread"""
    thread = models.ForeignKey(MessageThread, on_delete=models.CASCADE, related_name='messages')
    sender = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='sent_messages')
    content = models.TextField()
    
    is_read = models.BooleanField(default=False)
    read_at = models.DateTimeField(blank=True, null=True)
    
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['created_at']

    def __str__(self):
        return f"Message from {self.sender} - {self.created_at}"


class Consent(models.Model):
    """Data consent management"""
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


class AuditLog(models.Model):
    """Audit log for tracking important actions"""
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
    model_name = models.CharField(max_length=50)  # Model that was affected
    object_id = models.CharField(max_length=50)  # ID of affected object
    
    changes = models.JSONField(blank=True, null=True)  # Store what changed
    ip_address = models.GenericIPAddressField(blank=True, null=True)
    user_agent = models.TextField(blank=True, null=True)
    
    timestamp = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-timestamp']

    def __str__(self):
        return f"{self.user} - {self.action_type} - {self.model_name} - {self.timestamp}"