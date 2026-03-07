from rest_framework import generics, permissions

from apps.accounts.permissions import IsCompany
from apps.drives.models import Drive
from .serializers import DriveCreateSerializer, DriveSerializer


class DriveList(generics.ListAPIView):
    permission_classes = [permissions.IsAuthenticated]
    serializer_class = DriveSerializer
    queryset = Drive.objects.select_related("company", "job")

    def get_queryset(self):
        if self.request.user.is_company:
            return Drive.objects.filter(company__user=self.request.user)
        return Drive.objects.all()


class DriveCreate(generics.CreateAPIView):
    permission_classes = [permissions.IsAuthenticated, IsCompany]
    serializer_class = DriveCreateSerializer


class DriveDetail(generics.RetrieveUpdateDestroyAPIView):
    permission_classes = [permissions.IsAuthenticated]
    serializer_class = DriveSerializer

    def get_queryset(self):
        if self.request.user.is_company:
            return Drive.objects.filter(company__user=self.request.user)
        return Drive.objects.all()
