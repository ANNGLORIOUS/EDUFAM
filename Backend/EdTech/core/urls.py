from django.urls import path
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView
from .views import (
    RegisterView,
    AttendanceBulkUploadView,
    GradeBulkUploadView,
    StudentFlagView,
    EventView,
    UserApprovalView,
    AttendanceReportView,
    USSDConfigView,
    ussd_callback,

)

urlpatterns = [
    # Auth
    path("auth/register/", RegisterView.as_view(), name="register"),
    path("auth/token/", TokenObtainPairView.as_view(), name="token_obtain_pair"),
    path("auth/token/refresh/", TokenRefreshView.as_view(), name="token_refresh"),

    # Teacher
    path("attendance/bulk/", AttendanceBulkUploadView.as_view(), name="attendance-bulk"),
    path("grades/bulk/", GradeBulkUploadView.as_view(), name="grades-bulk"),
    path("flags/", StudentFlagView.as_view(), name="student-flag"),
    path("events/", EventView.as_view(), name="events"),

    # Admin
    path("admin/users/", UserApprovalView.as_view(), name="admin-users"),
    path("admin/reports/attendance/", AttendanceReportView.as_view(), name="attendance-report"),
    path("admin/ussd-config/", USSDConfigView.as_view(), name="ussd-config"),
    path("ussd/", ussd_callback, name="ussd-callback"),
]
