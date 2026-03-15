from rest_framework import serializers
from apps.students.models import Course, Department, StudentProfile


class DepartmentSerializer(serializers.ModelSerializer):
    class Meta:
        model = Department
        fields = ["id", "name", "code"]


class CourseSerializer(serializers.ModelSerializer):
    class Meta:
        model = Course
        fields = ["id", "name", "code"]


class StudentProfileSerializer(serializers.ModelSerializer):
    department = DepartmentSerializer(read_only=True)
    department_id = serializers.PrimaryKeyRelatedField(
        queryset=Department.objects.all(), write_only=True, required=False, allow_null=True
    )
    course = CourseSerializer(read_only=True)
    course_id = serializers.PrimaryKeyRelatedField(
        queryset=Course.objects.all(), write_only=True, required=False, allow_null=True
    )
    email = serializers.EmailField(source="user.email", read_only=True)

    class Meta:
        model = StudentProfile
        fields = [
            "id",
            "user",
            "email",
            "full_name",
            "phone",
            "enrollment_number",
            "date_of_birth",
            "gender",
            "location",
            "current_address",
            "permanent_address",
            "roll_number",
            "department",
            "department_id",
            "course",
            "course_id",
            "passing_year",
            "marks_10th",
            "marks_12th",
            "diploma_marks",
            "current_cgpa",
            "skills",
            "education_history",
            "profile_picture",
            "resume_url",
            "placement_status",
            "placed_company_name",
            "data_verified",
            "job_alerts_enabled",
            "created_at",
            "updated_at",
        ]
        read_only_fields = ["user", "placement_status", "placed_company_name", "created_at", "updated_at"]

    def update(self, instance, validated_data):
        dep = validated_data.pop("department_id", None)
        course = validated_data.pop("course_id", None)
        request = self.context.get("request")

        if dep is not None:
            instance.department = dep
        if course is not None:
            instance.course = course

        allowed_student_fields = {
            "phone",
            "location",
            "current_address",
            "permanent_address",
            "skills",
            "education_history",
            "profile_picture",
            "resume_url",
            "job_alerts_enabled",
        }

        if request is not None and request.user.is_authenticated and request.user.is_student:
            validated_data = {
                k: v for k, v in validated_data.items() if k in allowed_student_fields
            }

        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.save()
        return instance


class StudentProfileListSerializer(serializers.ModelSerializer):
    department_name = serializers.CharField(source="department.name", read_only=True)
    course_name = serializers.CharField(source="course.name", read_only=True)
    email = serializers.EmailField(source="user.email", read_only=True)
    is_active = serializers.BooleanField(source="user.is_active", read_only=True)

    class Meta:
        model = StudentProfile
        fields = [
            "id",
            "email",
            "full_name",
            "roll_number",
            "department_name",
            "course_name",
            "passing_year",
            "current_cgpa",
            "placement_status",
            "is_active",
            "created_at",
        ]
