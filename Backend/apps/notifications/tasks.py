from celery import shared_task
from django.core.mail import send_mail
from django.conf import settings


@shared_task(bind=True, max_retries=3)
def send_student_verification_emails(self):
    from apps.students.models import StudentProfile
    for profile in StudentProfile.objects.select_related("user"):
        try:
            send_mail(
                "Verify your placement portal data",
                f"Hello {profile.full_name},\n\nPlease verify your data on the placement portal. "
                f"If anything is incorrect, contact the TPO.\n\nRoll: {profile.roll_number}\n"
                f"Email: {profile.user.email}",
                settings.DEFAULT_FROM_EMAIL,
                [profile.user.email],
                fail_silently=False,
            )
        except Exception as e:
            if self.request.retries < self.max_retries:
                raise self.retry(exc=e)
    return "ok"


@shared_task(bind=True, max_retries=3)
def send_mail_task(self, subject, body, to_emails):
    send_mail(
        subject,
        body,
        settings.DEFAULT_FROM_EMAIL,
        to_emails,
        fail_silently=False,
    )
    return "ok"


@shared_task(bind=True, max_retries=3)
def send_student_registration_confirmation(self, user_id: int):
    """
    Send confirmation email right after a student self-registers.
    """
    from django.contrib.auth import get_user_model
    from apps.students.models import StudentProfile

    User = get_user_model()
    try:
        user = User.objects.get(id=user_id)
    except User.DoesNotExist:
        return "user-missing"

    profile = getattr(user, "student_profile", None)
    if not profile:
        return "no-student-profile"

    subject = "Placement Portal - Registration Confirmation"
    body_lines = [
        f"Hello {profile.full_name},",
        "",
        "Your account has been successfully registered on the Placement Management Portal.",
        "",
        f"Email: {user.email}",
        f"Roll Number: {profile.roll_number}",
        f"Enrollment Number: {profile.enrollment_number or '-'}",
        "",
        "If any of these details are incorrect, please contact your Training & Placement Office (TPO) or support.",
    ]
    body = "\n".join(body_lines)

    try:
        send_mail(
            subject,
            body,
            settings.DEFAULT_FROM_EMAIL,
            [user.email],
            fail_silently=False,
        )
    except Exception as e:
        if self.request.retries < self.max_retries:
            raise self.retry(exc=e)
    return "ok"

