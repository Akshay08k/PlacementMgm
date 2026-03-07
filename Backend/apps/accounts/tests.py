from django.contrib.auth import get_user_model
from django.urls import reverse
from rest_framework import status
from rest_framework.test import APITestCase


User = get_user_model()


class AuthAPITests(APITestCase):
	def setUp(self):
		self.register_url = reverse("register")
		self.login_url = reverse("token_obtain_pair")
		self.refresh_url = reverse("token_refresh")
		self.logout_url = reverse("logout")
		self.me_url = reverse("me")

		self.user_payload = {
			"username": "testuser",
			"email": "test@example.com",
			"password": "StrongPass123",
			"first_name": "Test",
			"last_name": "User",
		}

	def test_register_returns_tokens(self):
		response = self.client.post(self.register_url, self.user_payload, format="json")

		self.assertEqual(response.status_code, status.HTTP_201_CREATED)
		self.assertIn("access", response.data)
		self.assertIn("refresh", response.data)
		self.assertEqual(User.objects.count(), 1)

	def test_login_returns_tokens_for_valid_credentials(self):
		User.objects.create_user(
			username=self.user_payload["username"],
			email=self.user_payload["email"],
			password=self.user_payload["password"],
		)

		response = self.client.post(
			self.login_url,
			{
				"username": self.user_payload["username"],
				"password": self.user_payload["password"],
			},
			format="json",
		)

		self.assertEqual(response.status_code, status.HTTP_200_OK)
		self.assertIn("access", response.data)
		self.assertIn("refresh", response.data)

	def test_me_requires_authentication(self):
		response = self.client.get(self.me_url)
		self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

	def test_me_returns_user_when_authenticated(self):
		self.client.post(self.register_url, self.user_payload, format="json")
		login_response = self.client.post(
			self.login_url,
			{
				"username": self.user_payload["username"],
				"password": self.user_payload["password"],
			},
			format="json",
		)

		access = login_response.data["access"]
		self.client.credentials(HTTP_AUTHORIZATION=f"Bearer {access}")
		response = self.client.get(self.me_url)

		self.assertEqual(response.status_code, status.HTTP_200_OK)
		self.assertEqual(response.data["username"], self.user_payload["username"])

	def test_logout_blacklists_refresh_token(self):
		self.client.post(self.register_url, self.user_payload, format="json")
		login_response = self.client.post(
			self.login_url,
			{
				"username": self.user_payload["username"],
				"password": self.user_payload["password"],
			},
			format="json",
		)

		access = login_response.data["access"]
		refresh = login_response.data["refresh"]

		self.client.credentials(HTTP_AUTHORIZATION=f"Bearer {access}")
		logout_response = self.client.post(
			self.logout_url,
			{"refresh": refresh},
			format="json",
		)
		self.assertEqual(logout_response.status_code, status.HTTP_205_RESET_CONTENT)

		refresh_response = self.client.post(
			self.refresh_url,
			{"refresh": refresh},
			format="json",
		)
		self.assertEqual(refresh_response.status_code, status.HTTP_401_UNAUTHORIZED)
