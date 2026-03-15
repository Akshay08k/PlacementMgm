from rest_framework import serializers
from django.utils import timezone
from datetime import timedelta
from apps.companies.serializers import JobListSerializer
from apps.drives.models import Drive


class DriveSerializer(serializers.ModelSerializer):
    company_name = serializers.CharField(source="company.name", read_only=True)
    job = JobListSerializer(read_only=True)

    class Meta:
        model = Drive
        fields = [
            "id",
            "company",
            "company_name",
            "job",
            "title",
            "drive_date",
            "location_or_link",
            "instructions",
            "status",
            "rejection_feedback",
            "created_at",
        ]
        read_only_fields = ["created_at", "status", "rejection_feedback"]


class DriveCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Drive
        fields = ["job", "title", "drive_date", "location_or_link", "instructions"]

    def validate_drive_date(self, value):
        if value < timezone.now().date() + timedelta(days=1):
            raise serializers.ValidationError("Drive date must be at least 24 hours in the future.")
        return value

    def create(self, validated_data):
        user = self.context["request"].user
        if user.is_company:
            validated_data["company"] = user.company_profile
        else:
            job = validated_data.get("job")
            if not job:
                raise serializers.ValidationError({"job": "Job must be selected to schedule a drive."})
            validated_data["company"] = job.company
        validated_data["created_by"] = user
        return super().create(validated_data)

class DriveApprovalSerializer(serializers.Serializer):
    approved = serializers.BooleanField()
    rejection_feedback = serializers.CharField(required=False, allow_blank=True)
