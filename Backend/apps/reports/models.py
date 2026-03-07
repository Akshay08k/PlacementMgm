from django.db import models
from django.conf import settings


class Resource(models.Model):
    class Audience(models.TextChoices):
        STUDENT = "student", "Student"
        COMPANY = "company", "Company / Recruiter"
        ALL = "all", "All"

    title = models.CharField(max_length=200)
    description = models.TextField(blank=True)
    link = models.URLField(max_length=500, help_text="URL to site, document or PDF")
    audience = models.CharField(
        max_length=20,
        choices=Audience.choices,
        default=Audience.STUDENT,
    )
    created_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="created_resources",
    )
    created_at = models.DateTimeField(auto_now_add=True)
    is_active = models.BooleanField(default=True)

    class Meta:
        ordering = ["-created_at"]

    def __str__(self) -> str:
        return self.title


class InstituteConfig(models.Model):
    """
    Global institute/college configuration for the SaaS instance.
    First TPO/Admin can configure this from the dashboard.
    """

    name = models.CharField(max_length=200, default="Your Institute Name")
    short_name = models.CharField(max_length=50, blank=True)
    logo_url = models.URLField(max_length=500, blank=True)
    support_email = models.EmailField(blank=True)
    placement_email = models.EmailField(blank=True)
    primary_color = models.CharField(
        max_length=20,
        blank=True,
        help_text="Optional primary color (hex or Tailwind token)",
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = "Institute configuration"
        verbose_name_plural = "Institute configuration"

    def __str__(self) -> str:
        return self.name

