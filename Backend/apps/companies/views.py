from rest_framework import generics, permissions, status
from rest_framework.generics import get_object_or_404
from rest_framework.response import Response
from django.utils import timezone

from apps.accounts.permissions import IsTPOOrAdmin, IsCompany
from apps.companies.models import CompanyProfile, Job
from .serializers import (
    CompanyProfileListSerializer,
    CompanyProfileSerializer,
    JobApprovalSerializer,
    JobListSerializer,
    JobSerializer,
)


class CompanyProfileList(generics.ListAPIView):
    permission_classes = [permissions.IsAuthenticated]
    serializer_class = CompanyProfileListSerializer
    queryset = CompanyProfile.objects.all()

    def get_queryset(self):
        if self.request.user.is_company:
            return CompanyProfile.objects.filter(user=self.request.user)
        return CompanyProfile.objects.all()


class CompanyProfileDetail(generics.RetrieveUpdateAPIView):
    permission_classes = [permissions.IsAuthenticated]
    serializer_class = CompanyProfileSerializer

    def get_queryset(self):
        if self.request.user.is_company:
            return CompanyProfile.objects.filter(user=self.request.user)
        return CompanyProfile.objects.all()

    def get_object(self):
        if self.request.user.is_company:
            return self.request.user.company_profile
        return super().get_object()


class JobListCreate(generics.ListCreateAPIView):
    permission_classes = [permissions.IsAuthenticated]
    serializer_class = JobSerializer

    def get_queryset(self):
        if self.request.user.is_company:
            return Job.objects.filter(company__user=self.request.user)
        if self.request.user.is_tpo_or_admin:
            return Job.objects.all()
        return Job.objects.filter(status=Job.Status.APPROVED)

    def perform_create(self, serializer):
        if self.request.user.is_company:
            serializer.save(company=self.request.user.company_profile)


class JobDetail(generics.RetrieveUpdateAPIView):
    permission_classes = [permissions.IsAuthenticated]
    serializer_class = JobSerializer

    def get_queryset(self):
        if self.request.user.is_company:
            return Job.objects.filter(company__user=self.request.user)
        return Job.objects.all()


class JobApproval(generics.GenericAPIView):
    """TPO approves or rejects a job."""
    permission_classes = [permissions.IsAuthenticated, IsTPOOrAdmin]
    serializer_class = JobApprovalSerializer

    def post(self, request, pk):
        job = get_object_or_404(Job, pk=pk)
        if job.status != Job.Status.PENDING:
            return Response(
                {"error": "Job is not pending approval."},
                status=status.HTTP_400_BAD_REQUEST,
            )
        ser = self.get_serializer(data=request.data)
        ser.is_valid(raise_exception=True)
        if ser.validated_data["approved"]:
            job.status = Job.Status.APPROVED
            job.approved_at = timezone.now()
            job.approved_by = request.user
            job.rejection_feedback = ""
        else:
            job.status = Job.Status.REJECTED
            job.rejection_feedback = ser.validated_data.get("rejection_feedback", "")
        job.save()
        return Response(JobSerializer(job).data)


class CompanyDashboardStats(generics.GenericAPIView):
    permission_classes = [permissions.IsAuthenticated, IsCompany]

    def get(self, request):
        from apps.applications.models import Application
        company = request.user.company_profile
        jobs = Job.objects.filter(company=company)
        approved_jobs = jobs.filter(status=Job.Status.APPROVED)
        total_vacancies = sum(j.num_vacancies for j in approved_jobs)
        applications = Application.objects.filter(job__company=company)
        filled = applications.filter(status=Application.Status.SELECTED).count()
        return Response({
            "active_jobs": approved_jobs.count(),
            "total_vacancies": total_vacancies,
            "vacancies_filled": filled,
            "applications_received": applications.count(),
        })
