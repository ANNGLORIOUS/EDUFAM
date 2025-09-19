from django.urls import path
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView
from .views import (
    RegisterView,
    StudentListCreateView,
    StudentDetailView,
    ParentProfileView,
    ParentListView,
    TeacherView,
    AttendanceBulkUploadView,
    AttendanceReportView,
    GradeBulkUploadView,
    StudentFlagView,
    EventView,
    FeeAccountView,
    PaymentView,
    FeedbackView,
    SMSCampaignView,
    AuditLogView,
    USSDConfigView,
    ussd_callback,
)

urlpatterns = [
    # Auth
    path("auth/register/", RegisterView.as_view(), name="register"),
    path("auth/token/", TokenObtainPairView.as_view(), name="token_obtain_pair"),
    path("auth/token/refresh/", TokenRefreshView.as_view(), name="token_refresh"),

    # Students
    path("students/", StudentListCreateView.as_view(), name="students"),
    path("students/<int:pk>/", StudentDetailView.as_view(), name="student-detail"),

    # Parents
    path("parents/me/", ParentProfileView.as_view(), name="parent-profile"),
    path("parents/", ParentListView.as_view(), name="parents-list"),

    # Teachers
    path("teachers/", TeacherView.as_view(), name="teachers"),

    # Attendance
    path("attendance/bulk/", AttendanceBulkUploadView.as_view(), name="attendance-bulk"),
    path("attendance/report/", AttendanceReportView.as_view(), name="attendance-report"),

    # Grades
    path("grades/bulk/", GradeBulkUploadView.as_view(), name="grades-bulk"),

    # Flags
    path("flags/", StudentFlagView.as_view(), name="student-flag"),

    # Events
    path("events/", EventView.as_view(), name="events"),

    # Fees
    path("fees/<int:pk>/", FeeAccountView.as_view(), name="fee-account"),
    path("payments/", PaymentView.as_view(), name="payments"),

    # Feedback
    path("feedback/", FeedbackView.as_view(), name="feedback"),

    # SMS Campaigns
    path("sms-campaigns/", SMSCampaignView.as_view(), name="sms-campaigns"),

    # Audit & USSD
    path("audit-log/", AuditLogView.as_view(), name="audit-log"),
    path("ussd-config/", USSDConfigView.as_view(), name="ussd-config"),
    path("ussd/", ussd_callback, name="ussd-callback"),
]
