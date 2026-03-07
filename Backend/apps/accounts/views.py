from rest_framework import generics, permissions, status
from rest_framework.response import Response
from rest_framework_simplejwt.exceptions import TokenError
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework_simplejwt.views import TokenObtainPairView

from .permissions import IsTPOOrAdmin
from .serializers import (
    ChangePasswordSerializer,
    CompanyCreateByTPOSerializer,
    CustomTokenObtainPairSerializer,
    LogoutSerializer,
    TPOCreateSerializer,
    StudentRegisterSerializer,
    UserSerializer,
)


class StudentRegisterAPIView(generics.CreateAPIView):
    """Self-registration for students."""
    permission_classes = [permissions.AllowAny]
    serializer_class = StudentRegisterSerializer

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.save()
        try:
            from apps.notifications.tasks import send_student_registration_confirmation

            send_student_registration_confirmation.delay(user.id)
        except Exception:
            pass
        refresh = RefreshToken.for_user(user)
        return Response(
            {
                "user": UserSerializer(user).data,
                "refresh": str(refresh),
                "access": str(refresh.access_token),
                "role": user.role,
                "must_change_password": False,
            },
            status=status.HTTP_201_CREATED,
        )


class CompanyCreateByTPOAPIView(generics.CreateAPIView):
    """TPO/Admin creates company account; returns temp password and invite link."""
    permission_classes = [permissions.IsAuthenticated, IsTPOOrAdmin]
    serializer_class = CompanyCreateByTPOSerializer

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        result = serializer.save()
        return Response(result, status=status.HTTP_201_CREATED)


class TPOCreateAPIView(generics.CreateAPIView):
    """TPO/Admin creates another TPO user with given email/password."""
    permission_classes = [permissions.IsAuthenticated, IsTPOOrAdmin]
    serializer_class = TPOCreateSerializer

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.save()
        return Response(
            {
                "id": user.id,
                "email": user.email,
                "role": user.role,
            },
            status=status.HTTP_201_CREATED,
        )

class CustomTokenObtainPairView(TokenObtainPairView):
    permission_classes = [permissions.AllowAny]
    serializer_class = CustomTokenObtainPairSerializer


class MeAPIView(generics.RetrieveAPIView):
    permission_classes = [permissions.IsAuthenticated]
    serializer_class = UserSerializer

    def get_object(self):
        return self.request.user


class ChangePasswordAPIView(generics.GenericAPIView):
    permission_classes = [permissions.IsAuthenticated]
    serializer_class = ChangePasswordSerializer

    def post(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data, context={"request": request})
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response({"detail": "Password updated successfully."}, status=status.HTTP_200_OK)


class LogoutAPIView(generics.GenericAPIView):
    permission_classes = [permissions.IsAuthenticated]
    serializer_class = LogoutSerializer

    def post(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        try:
            serializer.save()
        except TokenError:
            return Response(
                {"detail": "Invalid or expired refresh token."},
                status=status.HTTP_400_BAD_REQUEST,
            )
        return Response(status=status.HTTP_205_RESET_CONTENT)
