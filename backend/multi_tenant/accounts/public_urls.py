from rest_framework_simplejwt.views import TokenRefreshView

from django.urls import path

from . import views


urlpatterns = [
    path('register/', views.RegistrationAPIView.as_view(), name='register'),
    path('login/', views.LoginView.as_view(), name='login'),

    path('token/refresh/', TokenRefreshView.as_view(), name='token-refresh'),

    path('password-reset/', views.RequestPasswordResetAPIView.as_view(), name='password-reset-request'),
    path('password-reset-confirm/<str:token>/', views.ConfirmPasswordResetAPIView.as_view(), name='password-reset-confirm'),
]