from rest_framework import serializers
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
            "created_at",
        ]
        read_only_fields = ["created_at"]


class DriveCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Drive
        fields = ["job", "title", "drive_date", "location_or_link", "instructions"]

    def create(self, validated_data):
        validated_data["company"] = self.context["request"].user.company_profile
        validated_data["created_by"] = self.context["request"].user
        return super().create(validated_data)
