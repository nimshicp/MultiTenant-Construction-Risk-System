from django.urls import path
from . import views

urlpatterns = [
    # Invite & Accept
    path('invite/', views.InviteEmployeeAPIView.as_view(), name='invite-employee'),
    path('accept-invitation/<uuid:token>/', views.InvitationDetailAPIView.as_view(), name='invitation-detail'),
    path('accept-invitation/<uuid:token>/complete/', views.AcceptInvitationAPIView.as_view(), name='accept-invitation'),
    
    # List & Management
    path('list/', views.EmployeeListView.as_view(), name='employee-list'),
    path('manage/<uuid:employee_id>/', views.EmployeeManagementView.as_view(), name='employee-manage'),
]