"""
In-app notifications and email queue log.
"""
from django.conf import settings
from django.db import models


class Notification(models.Model):
    class Kind(models.TextChoices):
        JOB_ALERT = "job_alert", "New Job Alert"
        JOB_APPROVAL = "job_approval", "Job Approved/Rejected"
        APPLICATION_UPDATE = "application_update", "Application Status"
        INTERVIEW_SCHEDULE = "interview_schedule", "Interview Scheduled"
        DRIVE = "drive", "Placement Drive"
        DATA_VERIFICATION = "data_verification", "Verify Your Data"
        PLACEMENT_CONFIRM = "placement_confirm", "Placement Confirmed"

    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="notifications",
    )
    kind = models.CharField(max_length=30, choices=Kind.choices)
    title = models.CharField(max_length=200)
    message = models.TextField(blank=True)
    link = models.CharField(max_length=500, blank=True)
    read = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-created_at"]


class EmailLog(models.Model):
    """Log of queued/sent emails for debugging and idempotency."""
    to_email = models.EmailField()
    subject = models.CharField(max_length=300)
    kind = models.CharField(max_length=50, blank=True)
    sent_at = models.DateTimeField(null=True, blank=True)
    error = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-created_at"]
