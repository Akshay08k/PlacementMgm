from rest_framework import generics, permissions
from rest_framework.views import APIView
from rest_framework.response import Response

from .models import Notification
from .serializers import NotificationSerializer


class NotificationList(generics.ListAPIView):
    permission_classes = [permissions.IsAuthenticated]
    serializer_class = NotificationSerializer

    def get_queryset(self):
        return Notification.objects.filter(user=self.request.user)


class NotificationMarkRead(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, pk):
        n = Notification.objects.filter(user=request.user, pk=pk).first()
        if n:
            n.read = True
            n.save()
        return Response({"detail": "ok"})
