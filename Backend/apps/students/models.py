"""
Student profile and placement status.
"""
from django.conf import settings
from django.db import models
from django.conf import settings


class Department(models.Model):
    name = models.CharField(max_length=120)
    code = models.CharField(max_length=20, unique=True, null=True, blank=True)

    class Meta:
        ordering = ["name"]

    def __str__(self):
        return self.name


class Course(models.Model):
    name = models.CharField(max_length=120)
    code = models.CharField(max_length=20, unique=True, null=True, blank=True)

    class Meta:
        ordering = ["name"]

    def __str__(self):
        return self.name


class StudentProfile(models.Model):
    class PlacementStatus(models.TextChoices):
        UNPLACED = "unplaced", "Unplaced"
        PLACED = "placed", "Placed"

    user = models.OneToOneField(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="student_profile",
    )
    full_name = models.CharField(max_length=200)
    phone = models.CharField(max_length=20, blank=True)
    enrollment_number = models.CharField(max_length=50, blank=True)
    roll_number = models.CharField(max_length=50, unique=True)
    date_of_birth = models.DateField(null=True, blank=True)
    gender = models.CharField(
        max_length=20,
        blank=True,
        choices=(
            ("male", "Male"),
            ("female", "Female"),
            ("other", "Other"),
        ),
    )
    location = models.CharField(max_length=120, blank=True)
    current_address = models.TextField(blank=True)
    permanent_address = models.TextField(blank=True)
    department = models.ForeignKey(
        Department,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="students",
    )
    course = models.ForeignKey(
        Course,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="students",
    )
    passing_year = models.PositiveIntegerField(null=True, blank=True)
    marks_10th = models.DecimalField(
        max_digits=5,
        decimal_places=2,
        null=True,
        blank=True,
        help_text="10th standard marks (percentage)",
    )
    marks_12th = models.DecimalField(
        max_digits=5,
        decimal_places=2,
        null=True,
        blank=True,
        help_text="12th standard marks (percentage)",
    )
    diploma_marks = models.DecimalField(
        max_digits=5,
        decimal_places=2,
        null=True,
        blank=True,
    )
    current_cgpa = models.DecimalField(
        max_digits=4,
        decimal_places=2,
        null=True,
        blank=True,
    )
    skills = models.TextField(blank=True, help_text="Comma-separated or line-separated skills")
    education_history = models.TextField(
        blank=True,
        help_text="Past education history / projects / experience for resume",
    )
    resume_url = models.URLField(max_length=500, blank=True, help_text="Cloudinary URL")
    placement_status = models.CharField(
        max_length=20,
        choices=PlacementStatus.choices,
        default=PlacementStatus.UNPLACED,
    )
    placed_company_name = models.CharField(max_length=200, blank=True)
    data_verified = models.BooleanField(
        default=False,
        help_text="Student has confirmed their data is correct",
    )
    job_alerts_enabled = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["-created_at"]

    def __str__(self):
        return f"{self.full_name} ({self.roll_number})"

    def can_apply(self):
        """Placed students cannot apply for other companies."""
        return self.placement_status == self.PlacementStatus.UNPLACED
