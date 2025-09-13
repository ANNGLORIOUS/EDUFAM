from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin
from .models import (
    User,
    Teacher,
    Student,
    AttendanceRecord,
    GradeRecord,
    StudentFlag,
    Event,
    FeeAccount,
    Payment,
    AuditLog,
    USSDConfig,
)


@admin.register(User)
class UserAdmin(BaseUserAdmin):
    list_display = ("username", "email", "role", "is_staff", "is_active")
    list_filter = ("role", "is_staff", "is_active")
    fieldsets = (
        (None, {"fields": ("username", "password")}),
        ("Personal info", {"fields": ("first_name", "last_name", "email")}),
        ("Permissions", {"fields": ("is_active", "is_staff", "is_superuser", "groups", "user_permissions", "role")}),
        ("Important dates", {"fields": ("last_login", "date_joined")}),
    )
    add_fieldsets = ((None, {"classes": ("wide",), "fields": ("username", "email", "password1", "password2", "role")}),)
    search_fields = ("username", "email")
    ordering = ("username",)


@admin.register(Student)
class StudentAdmin(admin.ModelAdmin):
    list_display = ("id", "first_name", "last_name", "classroom", "grade")
    search_fields = ("first_name", "last_name", "classroom")
    filter_horizontal = ("parents",)


@admin.register(Teacher)
class TeacherAdmin(admin.ModelAdmin):
    list_display = ("id", "user", "subject")
    search_fields = ("user__username", "subject")


@admin.register(AttendanceRecord)
class AttendanceAdmin(admin.ModelAdmin):
    list_display = ("student", "date", "status", "recorded_by", "created_at")
    list_filter = ("status", "date")
    search_fields = ("student__first_name", "student__last_name")


@admin.register(GradeRecord)
class GradeAdmin(admin.ModelAdmin):
    list_display = ("student", "subject", "grade", "recorded_by", "created_at")
    search_fields = ("student__first_name", "student__last_name", "subject")


@admin.register(StudentFlag)
class StudentFlagAdmin(admin.ModelAdmin):
    list_display = ("student", "flag_type", "created_by", "created_at")
    list_filter = ("flag_type",)


@admin.register(Event)
class EventAdmin(admin.ModelAdmin):
    list_display = ("title", "date", "created_by")
    search_fields = ("title",)


@admin.register(FeeAccount)
class FeeAccountAdmin(admin.ModelAdmin):
    list_display = ("student", "balance")


@admin.register(Payment)
class PaymentAdmin(admin.ModelAdmin):
    list_display = ("fee_account", "amount", "date")


@admin.register(AuditLog)
class AuditLogAdmin(admin.ModelAdmin):
    list_display = ("action", "user", "timestamp")
    search_fields = ("action", "user__username")


@admin.register(USSDConfig)
class USSDConfigAdmin(admin.ModelAdmin):
    list_display = ("updated_at", "updated_by")
