from django.contrib import admin, messages
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin
from .models import (
    User,
    OTP,
    Student,
    Teacher,
    Parent,
    AttendanceRecord,
    GradeRecord,
    StudentFlag,
    Event,
    FeeAccount,
    Payment,
    Feedback,
    SMSCampaign,
    AuditLog,
    USSDConfig,
)
# from core.services.sms_service import send_sms


# ----------------------
# USER ADMIN
# ----------------------
@admin.register(User)
class UserAdmin(BaseUserAdmin):
    list_display = ("username", "email", "phone_number", "role", "is_active", "is_staff", "date_joined")
    list_filter = ("role", "is_active", "is_staff", "is_phone_verified", "is_email_verified")
    search_fields = ("username", "email", "phone_number", "first_name", "last_name")

    fieldsets = BaseUserAdmin.fieldsets + (
        (
            "Additional Info",
            {"fields": ("role", "phone_number", "is_phone_verified", "is_email_verified")},
        ),
    )
    add_fieldsets = (
        (
            None,
            {
                "classes": ("wide",),
                "fields": ("username", "email", "phone_number", "password1", "password2", "role"),
            },
        ),
    )
    ordering = ("username",)


# ----------------------
# OTP ADMIN
# ----------------------
@admin.register(OTP)
class OTPAdmin(admin.ModelAdmin):
    list_display = ("code", "phone_number", "email", "otp_type", "is_used", "created_at", "expires_at")
    list_filter = ("otp_type", "is_used")
    search_fields = ("phone_number", "email", "code")
    readonly_fields = ("code", "created_at", "expires_at")


# ----------------------
# STUDENT
# ----------------------
@admin.register(Student)
class StudentAdmin(admin.ModelAdmin):
    list_display = ("id", "student_id", "first_name", "last_name", "status")
    search_fields = ("first_name", "last_name", "student_id", "parents__user__email")
    list_filter = ("status",)
    filter_horizontal = ("parents",)


# ----------------------
# PARENT
# ----------------------
@admin.register(Parent)
class ParentAdmin(admin.ModelAdmin):
    list_display = ("user", "occupation", "address")
    search_fields = ("user__username", "user__email")


# ----------------------
# TEACHER
# ----------------------
@admin.register(Teacher)
class TeacherAdmin(admin.ModelAdmin):
    list_display = ("id", "user", "subject")
    search_fields = ("user__username", "user__email", "subject")


# ----------------------
# ATTENDANCE
# ----------------------
@admin.register(AttendanceRecord)
class AttendanceAdmin(admin.ModelAdmin):
    list_display = ("student", "term", "date", "attendance_percent", "status", "recorded_by", "created_at")
    list_filter = ("status", "term", "date")
    search_fields = ("student__first_name", "student__last_name", "student__student_id")


# ----------------------
# GRADES
# ----------------------
@admin.register(GradeRecord)
class GradeAdmin(admin.ModelAdmin):
    list_display = ("student", "subject", "term", "grade")
    list_filter = ("term", "subject")
    search_fields = ("student__first_name", "student__last_name", "student__student_id", "subject")


# ----------------------
# FLAGS
# ----------------------
@admin.register(StudentFlag)
class StudentFlagAdmin(admin.ModelAdmin):
    list_display = ("student", "flag_type", "created_by", "created_at")
    list_filter = ("flag_type",)
    search_fields = ("student__first_name", "student__last_name")


# ----------------------
# EVENTS
# ----------------------
@admin.register(Event)
class EventAdmin(admin.ModelAdmin):
    list_display = ("title", "start", "end", "start_time", "end_time", "created_by")
    search_fields = ("title", "description")
    list_filter = ("start", "end", "event_type", "target_audience")


# ----------------------
# FEES & PAYMENTS
# ----------------------
@admin.register(FeeAccount)
class FeeAccountAdmin(admin.ModelAdmin):
    list_display = ("student", "balance", "currency", "next_payment_due")
    list_filter = ("currency",)
    search_fields = ("student__first_name", "student__last_name", "student__student_id")


@admin.register(Payment)
class PaymentAdmin(admin.ModelAdmin):
    list_display = ("fee", "amount", "date", "method", "transaction_id")  # Changed from fee_account to fee
    search_fields = ("fee__student__first_name", "fee__student__last_name", "transaction_id")
    list_filter = ("date", "method")
    readonly_fields = ("date",)

    # Optional: Add a method to display student name
    def student_name(self, obj):
        return obj.fee.student.name if obj.fee and obj.fee.student else "N/A"
    student_name.short_description = "Student"
    

# ----------------------
# FEEDBACK
# ----------------------
@admin.register(Feedback)
class FeedbackAdmin(admin.ModelAdmin):
    list_display = ("student", "concern_type", "status", "timestamp")
    list_filter = ("status", "concern_type")
    search_fields = ("student__first_name", "student__last_name", "message")


# ----------------------
# SMS CAMPAIGNS
# ----------------------
@admin.register(SMSCampaign)
class SMSCampaignAdmin(admin.ModelAdmin):
    list_display = (
        "id",
        "message",
        "recipient_type",
        "recipient_count",
        "status",
        "scheduled_at",
        "created_by",
        "created_at",
    )
    list_filter = ("status", "recipient_type")
    search_fields = ("message",)
    actions = ["send_campaign"]

    def send_campaign(self, request, queryset):
        for campaign in queryset:
            if campaign.status == "sent":
                self.message_user(request, f"Campaign {campaign.id} already sent.", level=messages.WARNING)
                continue

            sent, failed = 0, 0
            students = Student.objects.all()

            for student in students:
                for parent in student.parents.all():
                    if hasattr(parent, "phone_number") and parent.phone_number:
                        try:
                            # send_sms(parent.phone_number, campaign.message)
                            sent += 1
                        except Exception:
                            failed += 1

            campaign.delivery_stats = {"sent": sent, "failed": failed}
            campaign.recipient_count = sent + failed
            campaign.status = "sent"
            campaign.save()

            AuditLog.objects.create(
                user=request.user,
                action="SMS Campaign Sent",
                details={
                    "campaign_id": campaign.id,
                    "message": campaign.message[:50],
                    "sent": sent,
                    "failed": failed,
                },
            )

            self.message_user(
                request,
                f"✅ Campaign {campaign.id} sent! Delivered: {sent}, Failed: {failed}.",
                level=messages.SUCCESS,
            )

    send_campaign.short_description = "🚀 Send selected SMS Campaign(s)"


# ----------------------
# AUDIT LOG
# ----------------------
@admin.register(AuditLog)
class AuditLogAdmin(admin.ModelAdmin):
    list_display = ("action", "user", "timestamp")
    search_fields = ("action", "user__username", "user__email")
    list_filter = ("timestamp",)


# ----------------------
# USSD CONFIG
# ----------------------
@admin.register(USSDConfig)
class USSDConfigAdmin(admin.ModelAdmin):
    list_display = ("name", "updated_at", "updated_by")
    search_fields = ("name",)
    list_filter = ("updated_at",)
