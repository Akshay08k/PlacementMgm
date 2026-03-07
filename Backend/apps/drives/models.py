"""
Placement drives scheduled by companies.
"""
from django.conf import settings
from django.db import models

from apps.companies.models import CompanyProfile, Job


class Drive(models.Model):
    company = models.ForeignKey(
        CompanyProfile,
        on_delete=models.CASCADE,
        related_name="drives",
    )
    job = models.ForeignKey(
        Job,
        on_delete=models.CASCADE,
        related_name="drives",
        null=True,
        blank=True,
        help_text="Optional: link to a specific job",
    )
    title = models.CharField(max_length=200)
    drive_date = models.DateField()
    location_or_link = models.CharField(
        max_length=500,
        help_text="Venue address or online meeting link",
    )
    instructions = models.TextField(blank=True)
    created_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        related_name="created_drives",
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["-drive_date", "-created_at"]

    def __str__(self):
        return f"{self.title} - {self.company.name} ({self.drive_date})"
