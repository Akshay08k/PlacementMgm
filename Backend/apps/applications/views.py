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


class ApplicationShortlist(generics.GenericAPIView):
    """Company shortlists an application (moves status to SHORTLISTED)."""
    permission_classes = [permissions.IsAuthenticated, IsCompany]

    def post(self, request, pk):
        app = get_object_or_404(
            Application,
            pk=pk,
            job__company__user=request.user,
        )
        if app.status in (Application.Status.REJECTED, Application.Status.SELECTED):
            return Response({"detail": "Cannot shortlist this application."}, status=status.HTTP_400_BAD_REQUEST)
        app.status = Application.Status.SHORTLISTED
        app.save(update_fields=["status", "updated_at"])
        return Response(ApplicationSerializer(app).data)


class ApplicationReject(generics.GenericAPIView):
    """Company rejects an application."""
    permission_classes = [permissions.IsAuthenticated, IsCompany]

    def post(self, request, pk):
        app = get_object_or_404(
            Application,
            pk=pk,
            job__company__user=request.user,
        )
        if app.status == Application.Status.SELECTED:
            return Response({"detail": "Cannot reject a selected candidate."}, status=status.HTTP_400_BAD_REQUEST)
        app.status = Application.Status.REJECTED
        app.save(update_fields=["status", "updated_at"])
        return Response(ApplicationSerializer(app).data)


class ApplicationAdvanceRound(generics.GenericAPIView):
    """
    Company advances the candidate to the next configured round for the job.
    If no rounds are configured, falls back to built-in order.
    """
    permission_classes = [permissions.IsAuthenticated, IsCompany]

    DEFAULT_ROUNDS = [
        Application.InterviewRound.RESUME_SHORTLIST,
        Application.InterviewRound.APTITUDE,
        Application.InterviewRound.TECHNICAL,
        Application.InterviewRound.HR,
        Application.InterviewRound.FINAL,
    ]

    def post(self, request, pk):
        app = get_object_or_404(
            Application,
            pk=pk,
            job__company__user=request.user,
        )
        if app.status == Application.Status.REJECTED:
            return Response({"detail": "Rejected applications cannot be advanced."}, status=status.HTTP_400_BAD_REQUEST)
        if app.status == Application.Status.SELECTED:
            return Response({"detail": "Already selected."}, status=status.HTTP_400_BAD_REQUEST)

        job_rounds = getattr(app.job, "interview_rounds", None) or []
        rounds = job_rounds if job_rounds else self.DEFAULT_ROUNDS
        # Ensure final exists at end (helps consistent UX)
        if rounds and rounds[-1] != Application.InterviewRound.FINAL:
            rounds = [*rounds, Application.InterviewRound.FINAL]

        try:
            idx = rounds.index(app.current_round)
        except ValueError:
            idx = -1

        next_round = rounds[min(idx + 1, len(rounds) - 1)]
        app.current_round = next_round
        # If we moved past resume review, ensure status is shortlisted
        if app.status == Application.Status.APPLIED:
            app.status = Application.Status.SHORTLISTED
        app.save(update_fields=["status", "current_round", "updated_at"])
        return Response(ApplicationSerializer(app).data)
