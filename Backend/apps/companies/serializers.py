from rest_framework import serializers
from apps.accounts.models import User
from apps.companies.models import CompanyProfile, Job


class CompanyProfileSerializer(serializers.ModelSerializer):
    email = serializers.EmailField(source="user.email", read_only=True)

    class Meta:
        model = CompanyProfile
        fields = [
            "id",
            "user",
            "email",
            "name",
            "logo_url",
            "website",
            "description",
            "contact_email",
            "contact_phone",
            "industry",
            "address",
            "must_change_password",
            "created_at",
            "updated_at",
        ]
        read_only_fields = ["user", "must_change_password", "created_at", "updated_at"]


class CompanyProfileListSerializer(serializers.ModelSerializer):
    email = serializers.EmailField(source="user.email", read_only=True)

    class Meta:
        model = CompanyProfile
        fields = ["id", "name", "email", "industry", "contact_email", "contact_phone", "created_at"]


class JobSerializer(serializers.ModelSerializer):
    company_name = serializers.CharField(source="company.name", read_only=True)

    class Meta:
        model = Job
        fields = [
            "id",
            "company",
            "company_name",
            "title",
            "description",
            "package",
            "location",
            "eligibility_criteria",
            "min_cgpa",
            "skills_required",
            "num_vacancies",
            "jd_pdf_url",
            "hiring_flow",
            "interview_rounds",
            "status",
            "rejection_feedback",
            "created_at",
            "updated_at",
        ]
        read_only_fields = [
            "company",
            "status",
            "rejection_feedback",
            "approved_at",
            "approved_by",
            "created_at",
            "updated_at",
        ]


class JobListSerializer(serializers.ModelSerializer):
    company_name = serializers.CharField(source="company.name", read_only=True)

    class Meta:
        model = Job
        fields = [
            "id",
            "company_name",
            "title",
            "package",
            "location",
            "min_cgpa",
            "status",
            "num_vacancies",
            "hiring_flow",
            "interview_rounds",
            "created_at",
        ]


class JobApprovalSerializer(serializers.Serializer):
    approved = serializers.BooleanField()
    rejection_feedback = serializers.CharField(required=False, allow_blank=True)
