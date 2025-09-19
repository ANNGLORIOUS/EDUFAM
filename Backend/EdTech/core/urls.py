from django.urls import path, include
from django.urls import path, include
from . import views,ussd_views
from rest_framework_simplejwt.views import TokenRefreshView


urlpatterns = [
    # Authentication endpoints
    path('auth/register/', views.RegisterView.as_view(), name='register'),
    path('auth/login/', views.LoginView.as_view(), name='login'),
    path('auth/logout/', views.LogoutView.as_view(), name='logout'),
    path('auth/token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('auth/otp/request/', views.OTPRequestView.as_view(), name='request_otp'),
    path('auth/otp/verify/', views.OTPVerifyView.as_view(), name='verify_otp'),    
    path('auth/google/', views.GoogleAuthView.as_view(), name='google_login'),    
    path('auth/password/change/', views.PasswordChangeView.as_view(), name='change_password'),
    path('auth/password/reset/', views.PasswordResetRequestView.as_view(), name='request_password_reset'),
    path('auth/password/reset/confirm/', views.PasswordResetConfirmView.as_view(), name='confirm_password_reset'),


    # Parent endpoints
    path('parents/me/', views.ParentProfileView.as_view(), name='parent-profile'),
    path('parents/students/<int:pk>/summary/', views.StudentSummaryView.as_view(), name='student-summary'),
    # path('parents/students/<int:student_id>/grades/', views.StudentGradesView.as_view(), name='student-grades'),
    # path('parents/students/<int:student_id>/attendance/', views.StudentAttendanceView.as_view(), name='student-attendance'),
    # path('parents/students/<int:student_id>/payments/', views.StudentPaymentHistoryView.as_view(), name='student-payments'),
    path('parents/messages/', views.MessageListCreateView.as_view(), name='message-create'),
    path('parents/students/<int:student_id>/fees/', views.StudentFeeView.as_view(), name='student-fees'),
    path('parents/fees/pay/', views.FeePaymentView.as_view(), name='fee-payment'),
    path('parents/consent/', views.ConsentListView.as_view(), name='consent-list'),
    path('parents/consent/<int:id>/action/', views.ConsentUpdateView.as_view(), name='consent-update'),
    path('parents/events/', views.EventListView.as_view(), name='event-list'),
    path("ussd/", ussd_views.ussd_callback, name="ussd"),




    # Teacher endpoints 
    


    # Admin endpoints   
    
    
]