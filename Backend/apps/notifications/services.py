import resend
from django.conf import settings
from django.template.loader import render_to_string
from apps.notifications.models import EmailLog


class EmailService:
    """
    A unified email service for rendering templates and sending emails via Resend.
    """

    @classmethod
    def _send_email(cls, subject: str, html_body: str, to_emails: list, kind: str = ""):
        """
        Internal method to send emails using Resend and log the attempt.
        """
        if not settings.RESEND_API_KEY:
            raise ValueError("RESEND_API_KEY is not configured in settings.")

        resend.api_key = settings.RESEND_API_KEY
        
        # We only take the first parameter for Resend API formatting currently if it's a list.
        # But resend also supports listing emails.
        # Ensure to_emails is a list
        if isinstance(to_emails, str):
            to_emails = [to_emails]

        try:
            params = {
                "from": settings.DEFAULT_FROM_EMAIL,
                "to": to_emails,
                "subject": subject,
                "html": html_body,
            }
            
            email_response = resend.Emails.send(params)
            
            # Log success
            EmailLog.objects.create(
                to_email=", ".join(to_emails),
                subject=subject,
                kind=kind,
            )
            return email_response
        except Exception as e:
            # Log failure
            EmailLog.objects.create(
                to_email=", ".join(to_emails),
                subject=subject,
                kind=kind,
                error=str(e),
            )
            raise e

    @classmethod
    def send_job_posted_tpo(cls, job, tpo_emails: list):
        """Notify TPO that a new job is awaiting review."""
        subject = f"Pending Approval: New Job Posting by {job.company.name}"
        html_body = render_to_string("emails/job_posted_tpo.html", {"job": job, "settings": settings})
        return cls._send_email(subject, html_body, tpo_emails, kind="JOB_APPROVAL")

    @classmethod
    def send_job_approved_students(cls, job, student_emails: list):
        """Notify eligible students about an approved job."""
        subject = f"New Job Opportunity: {job.title} at {job.company.name}"
        html_body = render_to_string("emails/job_posted_students.html", {"job": job, "settings": settings})
        return cls._send_email(subject, html_body, student_emails, kind="JOB_ALERT")

    @classmethod
    def send_student_welcome(cls, user, profile):
        """Send welcome email and credentials to new students."""
        subject = "Welcome to Placement Portal"
        html_body = render_to_string("emails/student_welcome.html", {"user": user, "profile": profile, "settings": settings})
        return cls._send_email(subject, html_body, [user.email], kind="DATA_VERIFICATION")

    @classmethod
    def send_application_update(cls, application):
        """Send application status update to student."""
        subject = f"Application Update: {application.job.title} at {application.job.company.name}"
        html_body = render_to_string("emails/application_update.html", {"application": application, "settings": settings})
        return cls._send_email(subject, html_body, [application.student.user.email], kind="APPLICATION_UPDATE")

    @classmethod
    def send_drive_scheduled(cls, drive, student_emails: list):
        """Notify students about a scheduled placement drive."""
        subject = f"Placement Drive Scheduled: {drive.title} by {drive.company.name}"
        html_body = render_to_string("emails/drive_scheduled.html", {"drive": drive, "settings": settings})
        return cls._send_email(subject, html_body, student_emails, kind="INTERVIEW_SCHEDULE")

    @classmethod
    def send_status_update(cls, profile):
        """Notify student about a major status change (e.g., Placed)."""
        subject = f"Congratulations! Placement Status Update"
        html_body = render_to_string("emails/status_update.html", {"profile": profile, "settings": settings})
        return cls._send_email(subject, html_body, [profile.user.email], kind="PLACEMENT_CONFIRM")

    @classmethod
    def send_password_reset(cls, user, reset_link: str):
        """Send password reset link to user."""
        subject = "Password Reset Request"
        html_body = render_to_string("emails/password_reset.html", {"user": user, "reset_link": reset_link, "settings": settings})
        return cls._send_email(subject, html_body, [user.email], kind="PASSWORD_RESET")
