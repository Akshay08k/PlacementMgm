from rest_framework import serializers
from apps.applications.models import Application
from apps.students.serializers import StudentProfileListSerializer
from apps.companies.serializers import JobListSerializer


class ApplicationSerializer(serializers.ModelSerializer):
    student = StudentProfileListSerializer(read_only=True)
    job = JobListSerializer(read_only=True)

    class Meta:
        model = Application
        fields = [
            "id",
            "job",
            "student",
            "status",
            "current_round",
            "round_notes",
            "attended",
            "applied_at",
            "updated_at",
        ]
        read_only_fields = ["applied_at", "updated_at"]


class ApplicationCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Application
        fields = ["job"]

    def validate_job(self, job):
        if job.status != "approved":
            raise serializers.ValidationError("This job is not open for applications.")
        return job

    def validate(self, attrs):
        student = self.context["student"]
        job = attrs["job"]
        if not student.can_apply():
            raise serializers.ValidationError("Placed students cannot apply.")
        if Application.objects.filter(job=job, student=student).exists():
            raise serializers.ValidationError("Already applied to this job.")
        if job.min_cgpa and student.current_cgpa is not None and student.current_cgpa < job.min_cgpa:
            raise serializers.ValidationError("You do not meet the minimum CGPA requirement.")
        return attrs

    def create(self, validated_data):
        job = validated_data["job"]
        # If job has configured interview rounds, start from the first one.
        rounds = getattr(job, "interview_rounds", None) or []
        first_round = rounds[0] if rounds else Application.InterviewRound.RESUME_SHORTLIST
        
        application = Application.objects.create(
            student=self.context["student"],
            current_round=first_round,
            **validated_data,
        )

        from apps.notifications.models import Notification
        Notification.objects.create(
            user=job.company.user,
            kind=Notification.Kind.APPLICATION_UPDATE,
            title="New Application Received",
            message=f"{self.context['student'].user.get_full_name()} has applied for {job.title}.",
            link=f"/applications/{application.id}"
        )

        return application
