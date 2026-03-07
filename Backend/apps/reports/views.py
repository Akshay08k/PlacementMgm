from datetime import date
from rest_framework import generics, permissions
from rest_framework.views import APIView
from rest_framework.response import Response

from apps.accounts.permissions import IsTPOOrAdmin
from apps.students.models import StudentProfile
from apps.companies.models import CompanyProfile, Job
from apps.applications.models import Application
from apps.drives.models import Drive
from .models import Resource, InstituteConfig
from .serializers import ResourceSerializer, InstituteConfigSerializer


class AdminDashboardStats(APIView):
    permission_classes = [permissions.IsAuthenticated, IsTPOOrAdmin]

    def get(self, request):
        students_total = StudentProfile.objects.count()
        students_placed = StudentProfile.objects.filter(
            placement_status=StudentProfile.PlacementStatus.PLACED
        ).count()
        companies_total = CompanyProfile.objects.count()
        jobs_pending = Job.objects.filter(status=Job.Status.PENDING).count()
        jobs_approved = Job.objects.filter(status=Job.Status.APPROVED).count()
        applications_total = Application.objects.count()
        drives_upcoming = Drive.objects.filter(drive_date__gte=date.today()).count()
        placement_rate = (
            round(100 * students_placed / students_total, 1) if students_total else 0
        )

        config = InstituteConfig.objects.first()
        config_data = (
            InstituteConfigSerializer(config).data if config else None
        )

        return Response(
            {
                "students_total": students_total,
                "students_placed": students_placed,
                "placement_rate": placement_rate,
                "companies_total": companies_total,
                "jobs_pending": jobs_pending,
                "jobs_approved": jobs_approved,
                "applications_total": applications_total,
                "drives_upcoming": drives_upcoming,
                "institute_config": config_data,
            }
        )


class ResourceListCreateView(generics.ListCreateAPIView):
    """
    TPO/Admin can create resources; students (and others) can list them.
    """

    serializer_class = ResourceSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        qs = Resource.objects.filter(is_active=True)
        if user.is_student:
            return qs.filter(audience__in=[Resource.Audience.STUDENT, Resource.Audience.ALL])
        if user.is_company:
            return qs.filter(audience__in=[Resource.Audience.COMPANY, Resource.Audience.ALL])
        return qs

    def perform_create(self, serializer):
        if not self.request.user.is_tpo_or_admin:
            raise permissions.PermissionDenied("Only TPO/Admin can create resources.")
        serializer.save(created_by=self.request.user)


class InstituteConfigView(APIView):
    """
    Get or update institute configuration.
    TPO/Admin can update, others can only read.
    """

    permission_classes = [permissions.IsAuthenticated]

    def get_object(self):
        obj, _ = InstituteConfig.objects.get_or_create(id=1)
        return obj

    def get(self, request):
        obj = self.get_object()
        data = InstituteConfigSerializer(obj).data
        return Response(data)

    def patch(self, request):
        if not request.user.is_tpo_or_admin:
            raise permissions.PermissionDenied("Only TPO/Admin can update configuration.")
        obj = self.get_object()
        serializer = InstituteConfigSerializer(obj, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(serializer.data)

