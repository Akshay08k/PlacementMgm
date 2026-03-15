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
            "contact_phone",
            "industry",
            "established_year",
            "specialities",
            "client_images",
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
    eligibility_status = serializers.SerializerMethodField()

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
            "min_10th_percent",
            "min_12th_percent",
            "eligibility_status",
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

    def get_eligibility_status(self, obj):
        request = self.context.get("request")
        if not request or not hasattr(request.user, 'student_profile'):
            return {"is_eligible": True, "reasons": []}  # Not a student, rule doesn't apply directly here

        student = request.user.student_profile
        is_eligible = True
        reasons = []

        if obj.min_cgpa and (student.current_cgpa is None or student.current_cgpa < obj.min_cgpa):
            is_eligible = False
            reasons.append(f"Requires CGPA >= {obj.min_cgpa}")

        if obj.min_10th_percent and (student.marks_10th is None or student.marks_10th < obj.min_10th_percent):
            is_eligible = False
            reasons.append(f"Requires 10th marks >= {obj.min_10th_percent}%")

        if obj.min_12th_percent and (student.marks_12th is None or student.marks_12th < obj.min_12th_percent):
            is_eligible = False
            reasons.append(f"Requires 12th marks >= {obj.min_12th_percent}%")

        if getattr(student, 'placement_status', '') == "placed":
             is_eligible = False
             reasons.append("You are already placed.")

        return {
            "is_eligible": is_eligible,
            "reasons": reasons
        }


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
            "min_10th_percent",
            "min_12th_percent",
            "status",
            "num_vacancies",
            "hiring_flow",
            "interview_rounds",
            "created_at",
        ]


class JobApprovalSerializer(serializers.Serializer):
    approved = serializers.BooleanField()
    rejection_feedback = serializers.CharField(required=False, allow_blank=True)
