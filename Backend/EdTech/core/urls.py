from django.urls import path
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView
from . import views

urlpatterns = [
    # ------------------
    # Auth Endpoints
    # ------------------
    path("auth/register/", views.RegisterView.as_view(), name="register"),
    path("auth/login/", views.LoginView.as_view(), name="login"),
    path("auth/logout/", views.LogoutView.as_view(), name="logout"),
    path("auth/token/", TokenObtainPairView.as_view(), name="token_obtain_pair"),
    path("auth/token/refresh/", TokenRefreshView.as_view(), name="token_refresh"),
    path("auth/otp/request/", views.OTPRequestView.as_view(), name="request_otp"),
    path("auth/otp/verify/", views.OTPVerifyView.as_view(), name="verify_otp"),
    path("auth/google/", views.GoogleAuthView.as_view(), name="google_login"),
    path("auth/password/change/", views.PasswordChangeView.as_view(), name="change_password"),
    path("auth/password/reset/", views.PasswordResetRequestView.as_view(), name="request_password_reset"),
    path("auth/password/reset/confirm/", views.PasswordResetConfirmView.as_view(), name="confirm_password_reset"),

    # ------------------
    # Parent Endpoints
    # ------------------
    path("parent/me/", views.ParentProfileView.as_view(), name="parent-profile"),
    path("parent/children/", views.StudentSummaryView.as_view(), name="parent-children"),
    path("parent/results/", views.StudentGradesView.as_view(), name="parent-results"),
    path("parent/results/download/<int:result_id>/", views.ResultDownloadView.as_view(), name="result-download"),
    path("parent/attendance/", views.StudentAttendanceView.as_view(), name="parent-attendance"),
    path("parent/fees/", views.StudentFeeView.as_view(), name="parent-fees"),
    path("parent/fees/pay/", views.FeePaymentView.as_view(), name="parent-fee-payment"),
    path("parent/payments/history/", views.StudentPaymentHistoryView.as_view(), name="parent-payment-history"),
    path("parent/messages/", views.MessageListCreateView.as_view(), name="parent-messages"),
    path("parent/feedback/", views.FeedbackCreateView.as_view(), name="parent-feedback-create"),
    path("parent/feedback/history/", views.FeedbackListView.as_view(), name="parent-feedback-list"),
    path("parent/consent/", views.ConsentListView.as_view(), name="parent-consent-list"),
    path("parent/consent/<int:id>/", views.ConsentUpdateView.as_view(), name="parent-consent-update"),
    path("parent/events/", views.EventListView.as_view(), name="parent-events"),

    # ------------------
    # Student Endpoints
    # ------------------
    path("students/", views.StudentListCreateView.as_view(), name="students"),
    path("students/<int:pk>/", views.StudentDetailView.as_view(), name="student-detail"),

    # ------------------
    # Parent Admin Endpoints
    # ------------------
    path("parents/", views.ParentListView.as_view(), name="parents-list"),

    # ------------------
    # Teacher Endpoints
    # ------------------
    path("teachers/", views.TeacherView.as_view(), name="teachers"),

    # ------------------
    # Attendance & Grades
    # ------------------
    path("attendance/bulk/", views.AttendanceBulkUploadView.as_view(), name="attendance-bulk"),
    path("attendance/report/", views.AttendanceReportView.as_view(), name="attendance-report"),
    path("grades/bulk/", views.GradeBulkUploadView.as_view(), name="grades-bulk"),

    # ------------------
    # Flags & Events
    # ------------------
    path("flags/", views.StudentFlagView.as_view(), name="student-flag"),
    path("events/admin/", views.EventView.as_view(), name="events"),

    # ------------------
    # Finance Endpoints
    # ------------------
    # path("fees/<int:pk>/", views.FeeAccountView.as_view(), name="fee-account"),
    # path("FeePayment/", views.FeePaymentView.as_view(), name="FeePayment"),

    # ------------------
    # Feedback & Campaigns
    # ------------------
    path("feedback/", views.FeedbackView.as_view(), name="feedback"),
    path("sms-campaigns/", views.SMSCampaignView.as_view(), name="sms-campaigns"),

    # ------------------
    # Audit & USSD
    # ------------------
    path("audit-log/", views.AuditLogView.as_view(), name="audit-log"),
    path("ussd-config/", views.USSDConfigView.as_view(), name="ussd-config"),
    path("ussd-callback/",views.ussd_callback, name="ussd-callback"),
]
