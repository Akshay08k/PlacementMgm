from django.contrib.auth import get_user_model
from rest_framework import serializers
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from rest_framework_simplejwt.tokens import RefreshToken

User = get_user_model()


class UserSerializer(serializers.ModelSerializer):
	class Meta:
		model = User
		fields = ["id", "username", "email", "first_name", "last_name"]


class RegisterSerializer(serializers.ModelSerializer):
	password = serializers.CharField(write_only=True, min_length=8)

	class Meta:
		model = User
		fields = ["username", "email", "password", "first_name", "last_name"]

	def create(self, validated_data):
		return User.objects.create_user(**validated_data)


class CustomTokenObtainPairSerializer(TokenObtainPairSerializer):
	@classmethod
	def get_token(cls, user):
		token = super().get_token(user)
		token["username"] = user.username
		token["email"] = user.email
		return token

	def validate(self, attrs):
		data = super().validate(attrs)
		data["user"] = UserSerializer(self.user).data
		return data


class LogoutSerializer(serializers.Serializer):
	refresh = serializers.CharField()

	def save(self, **kwargs):
		refresh_token = self.validated_data["refresh"]
		token = RefreshToken(refresh_token)
		token.blacklist()
