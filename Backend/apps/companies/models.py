"""
Company profile and job postings.
"""
from django.conf import settings
from django.db import models


class CompanyProfile(models.Model):
    user = models.OneToOneField(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="company_profile",
    )
    name = models.CharField(max_length=200)
    logo_url = models.URLField(max_length=500, blank=True)
    website = models.URLField(max_length=300, blank=True)
    description = models.TextField(blank=True)
    contact_email = models.EmailField(blank=True)
    contact_phone = models.CharField(max_length=20, blank=True)
    industry = models.CharField(max_length=100, blank=True)
    established_year = models.PositiveIntegerField(null=True, blank=True)
    specialities = models.TextField(blank=True, help_text="Comma-separated or line-separated specialities")
    client_images = models.JSONField(default=list, blank=True, help_text="List of Cloudinary image URLs")
    address = models.TextField(blank=True)
    must_change_password = models.BooleanField(default=True)
    invite_token = models.CharField(max_length=64, unique=True, null=True, blank=True)
    invite_sent_at = models.DateTimeField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.name


class Job(models.Model):
    class Status(models.TextChoices):
        PENDING = "pending", "Pending Approval"
        APPROVED = "approved", "Approved"
        REJECTED = "rejected", "Rejected"

    class HiringFlow(models.TextChoices):
        APPLICATION_REVIEW = "applications", "Application review (shortlist & rounds)"
        DRIVE = "drive", "Drive (schedule campus drive)"
        BOTH = "both", "Both (drive + application review)"

    company = models.ForeignKey(
        CompanyProfile,
        on_delete=models.CASCADE,
        related_name="jobs",
    )
    title = models.CharField(max_length=200)
    description = models.TextField(help_text="Rich text / HTML allowed")
    package = models.CharField(max_length=100, blank=True)
    location = models.CharField(max_length=200, blank=True)
    eligibility_criteria = models.TextField(blank=True)
    min_cgpa = models.DecimalField(
        max_digits=4,
        decimal_places=2,
        null=True,
        blank=True,
    )
    min_10th_percent = models.DecimalField(
        max_digits=5,
        decimal_places=2,
        null=True,
        blank=True,
    )
    min_12th_percent = models.DecimalField(
        max_digits=5,
        decimal_places=2,
        null=True,
        blank=True,
    )
    skills_required = models.TextField(blank=True, help_text="Comma-separated")
    num_vacancies = models.PositiveIntegerField(default=1)
    jd_pdf_url = models.URLField(max_length=500, blank=True, help_text="Cloudinary URL")
    hiring_flow = models.CharField(
        max_length=20,
        choices=HiringFlow.choices,
        default=HiringFlow.APPLICATION_REVIEW,
        help_text="How the company wants to process applications for this job",
    )
    interview_rounds = models.JSONField(
        default=list,
        blank=True,
        help_text="Ordered list of interview round keys (e.g. ['resume_shortlist','technical','hr','final'])",
    )
    status = models.CharField(
        max_length=20,
        choices=Status.choices,
        default=Status.PENDING,
    )
    rejection_feedback = models.TextField(blank=True)
    approved_at = models.DateTimeField(null=True, blank=True)
    approved_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="approved_jobs",
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["-created_at"]

    def __str__(self):
        return f"{self.title} @ {self.company.name}"

    @property
    def is_published(self):
        return self.status == self.Status.APPROVED
