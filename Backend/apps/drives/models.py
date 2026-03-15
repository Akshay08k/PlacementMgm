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
    
    class Status(models.TextChoices):
        PENDING = "pending", "Pending Approval"
        APPROVED = "approved", "Approved"
        REJECTED = "rejected", "Rejected"

    status = models.CharField(
        max_length=20,
        choices=Status.choices,
        default=Status.PENDING,
    )
    rejection_feedback = models.TextField(blank=True)
    approved_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="approved_drives",
    )
    approved_at = models.DateTimeField(null=True, blank=True)

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
