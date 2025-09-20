from django.contrib import admin, messages
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin
from .models import (
    User,
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
from .services.sms_service import send_sms


# ----------------------
# USER ADMIN
# ----------------------
@admin.register(User)
class UserAdmin(BaseUserAdmin):
    list_display = ("username", "email", "role", "is_staff", "is_active")
    list_filter = ("role", "is_staff", "is_active")
    fieldsets = (
        (None, {"fields": ("username", "password")}),
        ("Personal info", {"fields": ("first_name", "last_name", "email")}),
        (
            "Permissions",
            {"fields": ("is_active", "is_staff", "is_superuser", "groups", "user_permissions", "role")},
        ),
        ("Important dates", {"fields": ("last_login", "date_joined")}),
    )
    add_fieldsets = (
        (
            None,
            {
                "classes": ("wide",),
                "fields": ("username", "email", "password1", "password2", "role"),
            },
        ),
    )
    search_fields = ("username", "email")
    ordering = ("username",)


# ----------------------
# STUDENT
# ----------------------
@admin.register(Student)
class StudentAdmin(admin.ModelAdmin):
    list_display = ("id", "student_id", "first_name", "last_name", "classroom", "grade", "status")
    search_fields = ("first_name", "last_name", "student_id", "parent_email", "classroom")
    list_filter = ("status", "grade", "classroom")
    filter_horizontal = ("parents",)


# ----------------------
# PARENT
# ----------------------
@admin.register(Parent)
class ParentAdmin(admin.ModelAdmin):
    list_display = ("user", "phone_number", "occupation", "address")
    search_fields = ("user__username", "user__email", "phone_number", "occupation")

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
    list_display = ("student", "subject", "term", "grade", "recorded_by", "created_at")
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
    list_display = ("title", "date", "start_time", "end_time", "created_by")
    search_fields = ("title", "description")
    list_filter = ("date",)


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
    list_display = ("fee_account", "amount", "date")
    search_fields = ("fee_account__student__first_name", "fee_account__student__last_name")
    list_filter = ("date",)


# ----------------------
# FEEDBACK
# ----------------------
@admin.register(Feedback)
class FeedbackAdmin(admin.ModelAdmin):
    list_display = ("student", "parent_name", "parent_email", "concern_type", "status", "timestamp")
    list_filter = ("status", "concern_type")
    search_fields = ("parent_email", "parent_name", "message")


# ----------------------
# SMS CAMPAIGNS
# ----------------------
@admin.register(SMSCampaign)
class SMSCampaignAdmin(admin.ModelAdmin):
    list_display = (
        "id", "message", "recipient_type", "recipient_count",
        "status", "scheduled_at", "created_by", "created_at"
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
                    if hasattr(parent, "parent_profile") and parent.parent_profile.phone_number:
                        try:
                            send_sms(parent.parent_profile.phone_number, campaign.message)
                            sent += 1
                        except Exception:
                            failed += 1

            campaign.delivery_stats = {"sent": sent, "failed": failed}
            campaign.recipient_count = sent + failed
            campaign.status = "sent"
            campaign.save()

            # 🔹 Log action
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
                level=messages.SUCCESS
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
