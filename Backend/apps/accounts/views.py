from rest_framework import generics, permissions, status
from rest_framework.response import Response
from rest_framework_simplejwt.exceptions import TokenError
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework_simplejwt.views import TokenObtainPairView

from .serializers import (
	CustomTokenObtainPairSerializer,
	LogoutSerializer,
	RegisterSerializer,
	UserSerializer,
)


class RegisterAPIView(generics.CreateAPIView):
	permission_classes = [permissions.AllowAny]
	serializer_class = RegisterSerializer

	def create(self, request, *args, **kwargs):
		serializer = self.get_serializer(data=request.data)
		serializer.is_valid(raise_exception=True)
		user = serializer.save()
		refresh = RefreshToken.for_user(user)

		return Response(
			{
				"user": UserSerializer(user).data,
				"refresh": str(refresh),
				"access": str(refresh.access_token),
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
