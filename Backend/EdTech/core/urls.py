from django.urls import path, include
from django.urls import path, include
from core.views.parent_views import (
    ParentProfileView,
    StudentSummaryView,
    StudentGradesView,
    StudentAttendanceView,
    StudentPaymentHistoryView,
    MessageThreadListView,
    MessageThreadDetailView,
    MessageCreateView,
    FeePaymentView,
    ConsentListView,
    ConsentActionView,
    ParentDashboardView,
    FilterOptionsView,
)


urlpatterns = [
    # Parent endpoints
    # Parent Profile
    path('parents/me/', ParentProfileView.as_view(), name='parent-profile'),
    path('parents/dashboard/', ParentDashboardView.as_view(), name='parent-dashboard'),
    
    # Student Data Access
    path('parents/students/<int:pk>/summary/', StudentSummaryView.as_view(), name='student-summary'),
    path('parents/students/<int:student_id>/grades/', StudentGradesView.as_view(), name='student-grades'),
    path('parents/students/<int:student_id>/attendance/', StudentAttendanceView.as_view(), name='student-attendance'),
    path('parents/students/<int:student_id>/payments/', StudentPaymentHistoryView.as_view(), name='student-payments'),

    # Messaging
    path('parents/messages/threads/', MessageThreadListView.as_view(), name='message-threads'),
    path('parents/messages/threads/<int:pk>/', MessageThreadDetailView.as_view(), name='message-thread-detail'),
    path('parents/messages/', MessageCreateView.as_view(), name='message-create'),

    # Fee Management
    path('parents/fees/pay/', FeePaymentView.as_view(), name='fee-payment'),

    # Consent Management
    path('parents/consent/', ConsentListView.as_view(), name='consent-list'),
    path('parents/consent/action/', ConsentActionView.as_view(), name='consent-action'),

    # Utility Endpoints
    path('parents/filter-options/', FilterOptionsView.as_view(), name='filter-options'),




    # Teacher endpoints 
    


    # Admin endpoints   
    
    
]