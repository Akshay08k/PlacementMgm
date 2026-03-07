from rest_framework import serializers, status
from rest_framework.response import Response
from apps.notifications.models import Notification


class NotificationSerializer(serializers.ModelSerializer):
    class Meta:
        model = Notification
        fields = ["id", "kind", "title", "message", "link", "read", "created_at"]
