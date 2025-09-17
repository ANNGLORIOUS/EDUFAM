from django.urls import path, include
from django.urls import path, include
from . import views
from rest_framework_simplejwt.views import TokenRefreshView


urlpatterns = [
    # Authentication endpoints
    path('register/', views.RegisterView.as_view(), name='register'),
    path('login/', views.LoginView.as_view(), name='login'),
    path('logout/', views.LogoutView.as_view(), name='logout'),
    path('token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('otp/request/', views.OTPRequestView.as_view(), name='request_otp'),
    path('otp/verify/', views.OTPVerifyView.as_view(), name='verify_otp'),    
    path('google/', views.GoogleAuthView.as_view(), name='google_login'),    
    path('password/change/', views.PasswordChangeView.as_view(), name='change_password'),
    path('password/reset/', views.PasswordResetRequestView.as_view(), name='request_password_reset'),
    path('password/reset/confirm/', views.PasswordResetConfirmView.as_view(), name='confirm_password_reset'),


    # Parent endpoints
    path('parents/me/', views.ParentProfileView.as_view(), name='parent-profile'),
    # path('parents/dashboard/', views.ParentDashboardView.as_view(), name='parent-dashboard'),
    # path('parents/students/<int:pk>/summary/', views.StudentSummaryView.as_view(), name='student-summary'),
    # path('parents/students/<int:student_id>/grades/', views.StudentGradesView.as_view(), name='student-grades'),
    # path('parents/students/<int:student_id>/attendance/', views.StudentAttendanceView.as_view(), name='student-attendance'),
    # path('parents/students/<int:student_id>/payments/', views.StudentPaymentHistoryView.as_view(), name='student-payments'),
    path('parents/messages/threads/', views.MessageThreadListCreateView.as_view(), name='message-threads'),
    # path('parents/messages/threads/<int:pk>/', views.MessageThreadDetailView.as_view(), name='message-thread-detail'),
    path('parents/messages/', views.MessageListCreateView.as_view(), name='message-create'),
    path('parents/fees/pay/', views.FeePaymentView.as_view(), name='fee-payment'),
    path('parents/consent/', views.ConsentView.as_view(), name='consent-list'),
    path('parents/consent/action/', views.ConsentActionView.as_view(), name='consent-action'),




    # Teacher endpoints 
    


    # Admin endpoints   
    
    
]