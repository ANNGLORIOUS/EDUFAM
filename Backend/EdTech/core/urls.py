from django.urls import path
from .views import (
    AttendanceBulkUploadView, GradeBulkUploadView,
    StudentFlagView, EventView,
    UserApprovalView, AttendanceReportView, USSDConfigView
)
from rest_framework_simplejwt.views import (
    TokenObtainPairView,
    TokenRefreshView,
)
from .views import RegisterView

urlpatterns = [
    # Register
    path("auth/register/", RegisterView.as_view(), name="register"),

    # JWT login
    path("auth/token/", TokenObtainPairView.as_view(), name="token_obtain_pair"),
    path("auth/token/refresh/", TokenRefreshView.as_view(), name="token_refresh"),
    
    # Teacher APIs
    path("attendance/bulk/", AttendanceBulkUploadView.as_view()),
    path("grades/bulk/", GradeBulkUploadView.as_view()),
    path("flags/", StudentFlagView.as_view()),
    path("events/", EventView.as_view()),

    # Admin APIs
    path("admin/users/", UserApprovalView.as_view()),
    path("admin/reports/attendance/", AttendanceReportView.as_view()),
    path("admin/ussd-config/", USSDConfigView.as_view()),
]
