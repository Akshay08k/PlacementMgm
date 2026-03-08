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
    TPO/Admin can configure this from the Institute Management page.
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
    # Stats displayed on homepage and across the site
    students_count = models.CharField(
        max_length=50,
        default="1200+",
        help_text="Total students (e.g. 1200+)",
    )
    students_every_year = models.CharField(
        max_length=50,
        default="300+",
        help_text="Students graduating every year (e.g. 300+)",
    )
    partner_companies = models.CharField(
        max_length=50,
        default="85+",
        help_text="Partner companies count (e.g. 85+)",
    )
    placement_rate = models.CharField(
        max_length=50,
        default="90%",
        help_text="Placement rate (e.g. 90%)",
    )
    opportunities = models.CharField(
        max_length=50,
        default="500+",
        help_text="Total opportunities (e.g. 500+)",
    )
    address = models.CharField(
        max_length=300,
        blank=True,
        help_text="Institute address for footer",
    )
    contact_phone = models.CharField(
        max_length=50,
        blank=True,
        help_text="Contact phone for footer",
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = "Institute configuration"
        verbose_name_plural = "Institute configuration"

    def __str__(self) -> str:
        return self.name

