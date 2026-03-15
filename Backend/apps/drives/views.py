from rest_framework import generics, permissions
from apps.accounts.permissions import IsCompany, IsCompanyOrTPOOrAdmin, IsTPOOrAdmin
from apps.drives.models import Drive
from .serializers import DriveCreateSerializer, DriveSerializer, DriveApprovalSerializer
from django.utils import timezone


class DriveList(generics.ListAPIView):
    permission_classes = [permissions.IsAuthenticated]
    serializer_class = DriveSerializer
    queryset = Drive.objects.select_related("company", "job")

    def get_queryset(self):
        if self.request.user.is_company:
            return Drive.objects.filter(company__user=self.request.user)
        if hasattr(self.request.user, "is_tpo_or_admin") and self.request.user.is_tpo_or_admin:
            return Drive.objects.all()
        return Drive.objects.filter(status=Drive.Status.APPROVED)


class DriveCreate(generics.CreateAPIView):
    permission_classes = [permissions.IsAuthenticated, IsCompanyOrTPOOrAdmin]
    serializer_class = DriveCreateSerializer

    def perform_create(self, serializer):
        drive = serializer.save()
        from apps.accounts.models import User
        from apps.notifications.models import Notification
        
        tpo_users = User.objects.filter(role=User.Role.TPO)
        for tpo in tpo_users:
            Notification.objects.create(
                user=tpo,
                kind=Notification.Kind.DRIVE,
                title="New Drive Pending Approval",
                message=f"{drive.company.name} wants to schedule a drive for {drive.title}.",
                link=f"/drives/{drive.id}"
            )


class DriveDetail(generics.RetrieveUpdateDestroyAPIView):
    permission_classes = [permissions.IsAuthenticated]
    serializer_class = DriveSerializer

    def get_queryset(self):
        if self.request.user.is_company:
            return Drive.objects.filter(company__user=self.request.user)
        return Drive.objects.all()

class DriveApproval(generics.GenericAPIView):
    """TPO approves or rejects a drive."""
    permission_classes = [permissions.IsAuthenticated, IsTPOOrAdmin]
    serializer_class = DriveApprovalSerializer

    def post(self, request, pk):
        drive = get_object_or_404(Drive, pk=pk)
        if drive.status != Drive.Status.PENDING:
            return Response(
                {"error": "Drive is not pending approval."},
                status=status.HTTP_400_BAD_REQUEST,
            )
        ser = self.get_serializer(data=request.data)
        ser.is_valid(raise_exception=True)
        if ser.validated_data["approved"]:
            drive.status = Drive.Status.APPROVED
            drive.approved_at = timezone.now()
            drive.approved_by = request.user
            drive.rejection_feedback = ""
        else:
            drive.status = Drive.Status.REJECTED
            drive.rejection_feedback = ser.validated_data.get("rejection_feedback", "")
        drive.save()

        # Send notification to company
        from apps.notifications.models import Notification
        action = "Approved" if drive.status == Drive.Status.APPROVED else "Rejected"
        Notification.objects.create(
            user=drive.company.user,
            kind=Notification.Kind.DRIVE,
            title=f"Drive {action}",
            message=f"Your drive schedule '{drive.title}' was {action.lower()}.",
            link=f"/drives/{drive.id}"
        )

        return Response(DriveSerializer(drive).data)

from apps.applications.models import Application
from apps.applications.serializers import ApplicationSerializer
from django.shortcuts import get_object_or_404
from rest_framework.response import Response
from rest_framework import status

class DriveApplicationList(generics.ListAPIView):
    permission_classes = [permissions.IsAuthenticated]
    serializer_class = ApplicationSerializer

    def get_queryset(self):
        drive_id = self.kwargs["pk"]
        if self.request.user.is_company:
            drive = get_object_or_404(Drive, pk=drive_id, company__user=self.request.user)
        else:
            drive = get_object_or_404(Drive, pk=drive_id)
            
        if drive.job:
            return Application.objects.filter(job=drive.job).select_related("student", "student__user")
        return Application.objects.none()

class DriveApplicationAttendanceUpdate(generics.GenericAPIView):
    permission_classes = [permissions.IsAuthenticated]
    
    def patch(self, request, pk, app_id):
        if self.request.user.is_company:
            drive = get_object_or_404(Drive, pk=pk, company__user=self.request.user)
        else:
            drive = get_object_or_404(Drive, pk=pk)
            
        if not drive.job:
            return Response({"error": "Drive has no linked job"}, status=status.HTTP_400_BAD_REQUEST)
            
        app = get_object_or_404(Application, pk=app_id, job=drive.job)
        attended = request.data.get("attended", None)
        if attended is not None:
            if isinstance(attended, str) and attended.lower() == 'false':
                app.attended = False
            elif isinstance(attended, str) and attended.lower() == 'true':
                app.attended = True
            else:
                app.attended = bool(attended)
            app.save(update_fields=["attended"])
        return Response(ApplicationSerializer(app).data)

