"""
Applications and interview round tracking.
"""
from django.conf import settings
from django.db import models

from apps.companies.models import Job
from apps.students.models import StudentProfile


class Application(models.Model):
    class Status(models.TextChoices):
        APPLIED = "applied", "Applied"
        SHORTLISTED = "shortlisted", "Shortlisted"
        REJECTED = "rejected", "Rejected"
        SELECTED = "selected", "Selected"

    class InterviewRound(models.TextChoices):
        RESUME_SHORTLIST = "resume_shortlist", "Resume Shortlisting"
        APTITUDE = "aptitude", "Aptitude Test"
        TECHNICAL = "technical", "Technical Interview"
        HR = "hr", "HR Interview"
        FINAL = "final", "Final Selection"

    job = models.ForeignKey(
        Job,
        on_delete=models.CASCADE,
        related_name="applications",
    )
    student = models.ForeignKey(
        StudentProfile,
        on_delete=models.CASCADE,
        related_name="applications",
    )
    status = models.CharField(
        max_length=20,
        choices=Status.choices,
        default=Status.APPLIED,
    )
    current_round = models.CharField(
        max_length=30,
        choices=InterviewRound.choices,
        default=InterviewRound.RESUME_SHORTLIST,
        blank=True,
    )
    round_notes = models.TextField(blank=True)
    attended = models.BooleanField(default=False, help_text="Did the student attend the drive?")
    applied_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["-applied_at"]
        unique_together = [["job", "student"]]

    def __str__(self):
        return f"{self.student} → {self.job.title}"
