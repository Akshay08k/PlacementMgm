from django.contrib.auth import get_user_model
from rest_framework import serializers
from rest_framework.exceptions import AuthenticationFailed
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from rest_framework_simplejwt.tokens import RefreshToken

User = get_user_model()


class UserSerializer(serializers.ModelSerializer):
    role = serializers.CharField(read_only=True)
    must_change_password = serializers.SerializerMethodField()

    class Meta:
        model = User
        fields = [
            "id",
            "email",
            "username",
            "first_name",
            "last_name",
            "role",
            "must_change_password",
        ]

    def get_must_change_password(self, obj):
        if obj.is_company and hasattr(obj, "company_profile"):
            return obj.company_profile.must_change_password
        return False


class StudentRegisterSerializer(serializers.Serializer):
    """Self-registration for students. Creates User (role=student) + StudentProfile."""
    email = serializers.EmailField()
    password = serializers.CharField(write_only=True, min_length=8)
    full_name = serializers.CharField(max_length=200)
    phone = serializers.CharField(max_length=20, required=False, allow_blank=True)
    roll_number = serializers.CharField(max_length=50)
    department_id = serializers.IntegerField(required=False, allow_null=True)
    course_id = serializers.IntegerField(required=False, allow_null=True)
    passing_year = serializers.IntegerField(required=False, allow_null=True)
    marks_10th = serializers.DecimalField(
        max_digits=5, decimal_places=2, required=False, allow_null=True
    )
    marks_12th = serializers.DecimalField(
        max_digits=5, decimal_places=2, required=False, allow_null=True
    )
    diploma_marks = serializers.DecimalField(
        max_digits=5, decimal_places=2, required=False, allow_null=True
    )
    current_cgpa = serializers.DecimalField(
        max_digits=4, decimal_places=2, required=False, allow_null=True
    )
    skills = serializers.CharField(required=False, allow_blank=True)
    resume_url = serializers.URLField(required=False, allow_blank=True)
    enrollment_number = serializers.CharField(
        max_length=50, required=False, allow_blank=True
    )
    date_of_birth = serializers.DateField(required=False, allow_null=True)
    gender = serializers.CharField(required=False, allow_blank=True)
    location = serializers.CharField(max_length=120, required=False, allow_blank=True)
    current_address = serializers.CharField(required=False, allow_blank=True)
    permanent_address = serializers.CharField(required=False, allow_blank=True)
    education_history = serializers.CharField(required=False, allow_blank=True)

    def validate_email(self, value):
        if User.objects.filter(email=value).exists():
            raise serializers.ValidationError("A user with this email already exists.")
        return value

    def validate_roll_number(self, value):
        from apps.students.models import StudentProfile
        if StudentProfile.objects.filter(roll_number=value).exists():
            raise serializers.ValidationError("This roll number is already registered.")
        return value

    def validate_department_id(self, value):
        if value is None:
            return value
        from apps.students.models import Department
        if not Department.objects.filter(pk=value).exists():
            raise serializers.ValidationError("Invalid department.")
        return value

    def validate_course_id(self, value):
        if value is None:
            return value
        from apps.students.models import Course
        if not Course.objects.filter(pk=value).exists():
            raise serializers.ValidationError("Invalid course.")
        return value

    def create(self, validated_data):
        from apps.students.models import StudentProfile
        profile_fields = {
            "phone",
            "passing_year",
            "marks_10th",
            "marks_12th",
            "diploma_marks",
            "current_cgpa",
            "skills",
            "resume_url",
            "enrollment_number",
            "date_of_birth",
            "gender",
            "location",
            "current_address",
            "permanent_address",
            "education_history",
        }
        email = validated_data.pop("email")
        password = validated_data.pop("password")
        full_name = validated_data.pop("full_name")
        roll_number = validated_data.pop("roll_number")
        department = validated_data.pop("department_id", None)
        course = validated_data.pop("course_id", None)
        if department is not None:
            from apps.students.models import Department
            department = Department.objects.get(pk=department)
        if course is not None:
            from apps.students.models import Course
            course = Course.objects.get(pk=course)
        profile_data = {k: v for k, v in validated_data.items() if k in profile_fields}
        user = User.objects.create_user(
            username=email,
            email=email,
            password=password,
            role=User.Role.STUDENT,
            first_name=full_name.split()[0] if full_name else "",
            last_name=" ".join(full_name.split()[1:]) if len(full_name.split()) > 1 else "",
        )
        StudentProfile.objects.create(
            user=user,
            full_name=full_name,
            roll_number=roll_number,
            department=department,
            course=course,
            **profile_data,
        )
        return user


class CompanyCreateByTPOSerializer(serializers.Serializer):
    """TPO creates company account. Generates invite link and temp password."""
    email = serializers.EmailField()
    company_name = serializers.CharField(max_length=200)
    contact_email = serializers.EmailField(required=False, allow_blank=True)
    contact_phone = serializers.CharField(max_length=20, required=False, allow_blank=True)

    def validate_email(self, value):
        if User.objects.filter(email=value).exists():
            raise serializers.ValidationError("A user with this email already exists.")
        return value

    def create(self, validated_data):
        import secrets
        from apps.companies.models import CompanyProfile
        email = validated_data["email"]
        company_name = validated_data["company_name"]
        temp_password = secrets.token_urlsafe(12)
        user = User.objects.create_user(
            username=email,
            email=email,
            password=temp_password,
            role=User.Role.COMPANY,
        )
        invite_token = secrets.token_urlsafe(32)
        CompanyProfile.objects.create(
            user=user,
            name=company_name,
            contact_email=validated_data.get("contact_email") or email,
            contact_phone=validated_data.get("contact_phone", ""),
            must_change_password=True,
            invite_token=invite_token,
        )
        return {
            "user_id": user.id,
            "email": email,
            "temp_password": temp_password,
            "invite_token": invite_token,
            "invite_link": f"/set-password?token={invite_token}",
        }


class TPOCreateSerializer(serializers.Serializer):
    """TPO/Admin can create another TPO user."""
    email = serializers.EmailField()
    password = serializers.CharField(write_only=True, min_length=8)

    def validate_email(self, value):
        if User.objects.filter(email=value).exists():
            raise serializers.ValidationError("A user with this email already exists.")
        return value

    def create(self, validated_data):
        email = validated_data["email"]
        password = validated_data["password"]
        user = User.objects.create_user(
            username=email,
            email=email,
            password=password,
            role=User.Role.TPO,
        )
        return user


class ChangePasswordSerializer(serializers.Serializer):
    """First-time or voluntary password change (company / any user)."""
    current_password = serializers.CharField(write_only=True, required=False)
    new_password = serializers.CharField(write_only=True, min_length=8)
    invite_token = serializers.CharField(write_only=True, required=False)

    def validate_new_password(self, value):
        from django.contrib.auth.password_validation import validate_password
        validate_password(value)
        return value

    def validate(self, attrs):
        user = self.context["request"].user
        invite_token = attrs.get("invite_token")
        if user.is_company and getattr(user.company_profile, "must_change_password", False):
            if not invite_token and not attrs.get("current_password"):
                raise serializers.ValidationError(
                    "First-time login: use invite token or current temporary password."
                )
        elif not attrs.get("current_password"):
            raise serializers.ValidationError("current_password is required.")
        return attrs

    def save(self, **kwargs):
        user = self.context["request"].user
        new_password = self.validated_data["new_password"]
        user.set_password(new_password)
        user.save()
        if user.is_company and hasattr(user, "company_profile"):
            user.company_profile.must_change_password = False
            user.company_profile.invite_token = None
            user.company_profile.save(update_fields=["must_change_password", "invite_token"])
        return user


class CustomTokenObtainPairSerializer(TokenObtainPairSerializer):
    @classmethod
    def get_token(cls, user):
        token = super().get_token(user)
        token["email"] = user.email
        token["role"] = user.role
        return token

    def validate(self, attrs):
        data = super().validate(attrs)
        requested_role = self.initial_data.get("role")
        if requested_role:
            if str(self.user.role) != requested_role:
                raise AuthenticationFailed("Invalid role selected for this account.")
        data["user"] = UserSerializer(self.user).data
        data["role"] = self.user.role
        if self.user.is_company and hasattr(self.user, "company_profile"):
            data["must_change_password"] = self.user.company_profile.must_change_password
        else:
            data["must_change_password"] = False
        return data


class LogoutSerializer(serializers.Serializer):
    refresh = serializers.CharField()

    def save(self, **kwargs):
        refresh_token = self.validated_data["refresh"]
        token = RefreshToken(refresh_token)
        token.blacklist()
