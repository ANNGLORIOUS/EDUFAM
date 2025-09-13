from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin
from .models import User, OTP

# Register your models here.

@admin.register(User)
class UserAdmin(BaseUserAdmin):
    list_display = ('username', 'email', 'phone_number', 'user_type', 'is_active', 'created_at')
    list_filter = ('user_type', 'is_active', 'is_phone_verified', 'is_email_verified')
    search_fields = ('username', 'email', 'phone_number', 'first_name', 'last_name')
    
    fieldsets = BaseUserAdmin.fieldsets + (
        ('Additional Info', {
            'fields': ('user_type', 'phone_number', 'preferred_language', 
                      'is_phone_verified', 'is_email_verified')
        }),
    )

@admin.register(OTP)
class OTPAdmin(admin.ModelAdmin):
    list_display = ('code', 'phone_number', 'email', 'otp_type', 'is_used', 'created_at', 'expires_at')
    list_filter = ('otp_type', 'is_used')
    search_fields = ('phone_number', 'email', 'code')
    readonly_fields = ('code', 'created_at', 'expires_at')
