from django.urls import path
from rest_framework_simplejwt.views import TokenRefreshView

from .views import (
    ChangePasswordAPIView,
    CompanyCreateByTPOAPIView,
    CustomTokenObtainPairView,
    LogoutAPIView,
    MeAPIView,
  PasswordResetConfirmAPIView,
  PasswordResetRequestAPIView,
    StudentRegisterAPIView,
    TPOCreateAPIView,
)

urlpatterns = [
    path("register/student/", StudentRegisterAPIView.as_view(), name="register-student"),
    path("register/company/", CompanyCreateByTPOAPIView.as_view(), name="register-company-by-tpo"),
    path("register/tpo/", TPOCreateAPIView.as_view(), name="register-tpo"),
    path("login/", CustomTokenObtainPairView.as_view(), name="token_obtain_pair"),
    path("token/refresh/", TokenRefreshView.as_view(), name="token_refresh"),
    path("logout/", LogoutAPIView.as_view(), name="logout"),
    path("me/", MeAPIView.as_view(), name="me"),
    path("change-password/", ChangePasswordAPIView.as_view(), name="change-password"),
    path("password-reset/request/", PasswordResetRequestAPIView.as_view(), name="password-reset-request"),
    path("password-reset/confirm/", PasswordResetConfirmAPIView.as_view(), name="password-reset-confirm"),
]
