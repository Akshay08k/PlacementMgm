from rest_framework import generics, permissions, status
from rest_framework.generics import get_object_or_404
from rest_framework.response import Response
from django.utils import timezone

from apps.accounts.permissions import IsCompany, IsStudent, IsTPOOrAdmin
from apps.applications.models import Application
from apps.students.models import StudentProfile
from .serializers import ApplicationCreateSerializer, ApplicationSerializer


class ApplicationList(generics.ListAPIView):
    permission_classes = [permissions.IsAuthenticated]
    serializer_class = ApplicationSerializer

    def get_queryset(self):
        qs = Application.objects.select_related("job", "student", "student__user", "job__company")
        if self.request.user.is_student:
            return qs.filter(student__user=self.request.user)
        if self.request.user.is_company:
            return qs.filter(job__company__user=self.request.user)
        return qs


class ApplicationCreate(generics.CreateAPIView):
    """Student applies to a job (eligibility enforced in serializer)."""
    permission_classes = [permissions.IsAuthenticated, IsStudent]
    serializer_class = ApplicationCreateSerializer

    def get_serializer_context(self):
        ctx = super().get_serializer_context()
        ctx["student"] = StudentProfile.objects.get(user=self.request.user)
        return ctx


class ApplicationDetail(generics.RetrieveUpdateAPIView):
    permission_classes = [permissions.IsAuthenticated]
    serializer_class = ApplicationSerializer

    def get_queryset(self):
        if self.request.user.is_student:
            return Application.objects.filter(student__user=self.request.user)
        if self.request.user.is_company:
            return Application.objects.filter(job__company__user=self.request.user)
        return Application.objects.all()


class ApplicationSelect(generics.GenericAPIView):
    """Company marks a candidate as SELECTED; updates student placement status."""
    permission_classes = [permissions.IsAuthenticated, IsCompany]

    def post(self, request, pk):
        app = get_object_or_404(
            Application,
            pk=pk,
            job__company__user=request.user,
        )
        if app.status == Application.Status.SELECTED:
            return Response({"detail": "Already selected."}, status=status.HTTP_400_BAD_REQUEST)
        app.status = Application.Status.SELECTED
        app.current_round = Application.InterviewRound.FINAL
        app.save()
        student = app.student
        student.placement_status = StudentProfile.PlacementStatus.PLACED
        student.placed_company_name = app.job.company.name
        student.save(update_fields=["placement_status", "placed_company_name"])
        return Response(ApplicationSerializer(app).data)
