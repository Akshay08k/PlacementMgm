from celery import shared_task
from django.conf import settings
from django.contrib.auth import get_user_model

from apps.notifications.services import EmailService
from apps.companies.models import Job
from apps.students.models import StudentProfile
from apps.applications.models import Application
from apps.drives.models import Drive


@shared_task(bind=True, max_retries=3)
def send_student_welcome_email(self, user_id: int):
    """
    Send welcome email right after a student is registered or bulk imported.
    """
    User = get_user_model()
    try:
        user = User.objects.get(id=user_id)
        profile = user.student_profile
        EmailService.send_student_welcome(user, profile)
    except Exception as e:
        if self.request.retries < self.max_retries:
            raise self.retry(exc=e)
        return str(e)
    return "ok"

@shared_task(bind=True, max_retries=3)
def send_student_registration_confirmation(self, user_id: int):
    """
    Send registration confirmation email right after a student is registered or bulk imported.
    Maps to the send_student_welcome function in EmailService.
    """
    User = get_user_model()
    try:
        user = User.objects.get(id=user_id)
        profile = user.student_profile
        EmailService.send_student_welcome(user, profile)
    except Exception as e:
        if self.request.retries < self.max_retries:
            raise self.retry(exc=e)
        return str(e)
    return "ok"

@shared_task(bind=True, max_retries=3)
def send_job_posted_tpo_email(self, job_id: int):
    """
    Notify TPO that a new job is awaiting review.
    """
    try:
        job = Job.objects.get(id=job_id)
        # Assuming TPOs are users with is_staff=True or a specific role.
        # For this, let's collect emails of superusers/staff as TPOs.
        User = get_user_model()
        tpo_emails = list(User.objects.filter(is_staff=True).values_list("email", flat=True))
        if tpo_emails:
            EmailService.send_job_posted_tpo(job, tpo_emails)
    except Exception as e:
        if self.request.retries < self.max_retries:
            raise self.retry(exc=e)
        return str(e)
    return "ok"


@shared_task(bind=True, max_retries=3)
def send_job_approved_students_email(self, job_id: int):
    """
    Notify eligible students about an approved job.
    """
    try:
        job = Job.objects.get(id=job_id)
        # Notify all active, unplaced students who enabled job alerts
        students = StudentProfile.objects.filter(
            placement_status=StudentProfile.PlacementStatus.UNPLACED,
            job_alerts_enabled=True,
            user__is_active=True
        ).select_related("user")
        
        student_emails = [s.user.email for s in students if s.user.email]
        if student_emails:
            EmailService.send_job_approved_students(job, student_emails)
    except Exception as e:
        if self.request.retries < self.max_retries:
            raise self.retry(exc=e)
        return str(e)
    return "ok"


@shared_task(bind=True, max_retries=3)
def send_application_update_email(self, application_id: int):
    """
    Send application status/round update to student.
    """
    try:
        app = Application.objects.get(id=application_id)
        if app.student.user.email:
            EmailService.send_application_update(app)
    except Exception as e:
        if self.request.retries < self.max_retries:
            raise self.retry(exc=e)
        return str(e)
    return "ok"


@shared_task(bind=True, max_retries=3)
def send_drive_scheduled_email(self, drive_id: int):
    """
    Notify relevant students about a scheduled placement drive.
    """
    try:
        drive = Drive.objects.get(id=drive_id)
        # For simplicity, notify all students who applied to the job if the drive is linked to a job
        # otherwise, notify all unplaced students
        if drive.job:
            apps = Application.objects.filter(job=drive.job).select_related("student__user")
            student_emails = [a.student.user.email for a in apps if a.student.user.email]
        else:
            students = StudentProfile.objects.filter(
                placement_status=StudentProfile.PlacementStatus.UNPLACED,
                job_alerts_enabled=True,
                user__is_active=True
            ).select_related("user")
            student_emails = [s.user.email for s in students if s.user.email]
        
        if student_emails:
            EmailService.send_drive_scheduled(drive, student_emails)
    except Exception as e:
        if self.request.retries < self.max_retries:
            raise self.retry(exc=e)
        return str(e)
    return "ok"


@shared_task(bind=True, max_retries=3)
def send_status_update_email(self, profile_id: int):
    """
    Notify student about a major status change (e.g., Placed).
    """
    try:
        profile = StudentProfile.objects.get(id=profile_id)
        if profile.user.email:
            EmailService.send_status_update(profile)
    except Exception as e:
        if self.request.retries < self.max_retries:
            raise self.retry(exc=e)
        return str(e)
    return "ok"
