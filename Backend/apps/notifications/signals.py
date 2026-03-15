from django.db.models.signals import post_save
from django.dispatch import receiver
from asgiref.sync import async_to_sync
from channels.layers import get_channel_layer
from .models import Notification

from apps.companies.models import Job
from apps.students.models import StudentProfile
from apps.applications.models import Application
from apps.drives.models import Drive
from apps.notifications.tasks import (
    send_job_posted_tpo_email,
    send_job_approved_students_email,
    send_student_welcome_email,
    send_application_update_email,
    send_drive_scheduled_email,
    send_status_update_email
)


@receiver(post_save, sender=Notification)
def broadcast_notification(sender, instance, created, **kwargs):
    if created:
        channel_layer = get_channel_layer()
        group_name = f"user_{instance.user.id}"
        
        async_to_sync(channel_layer.group_send)(
            group_name,
            {
                "type": "notification_message",
                "message": {
                    "id": instance.id,
                    "kind": instance.kind,
                    "title": instance.title,
                    "message": instance.message,
                    "link": instance.link,
                    "read": instance.read,
                    "created_at": instance.created_at.isoformat()
                }
            }
        )

@receiver(post_save, sender=Job)
def notify_job_updates(sender, instance, created, update_fields, **kwargs):
    if created and instance.status == Job.Status.PENDING:
        # Notify TPO of new job
        send_job_posted_tpo_email.delay(instance.id)
    elif not created:
        # Check if status was updated to APPROVED
        # (This is a simplified check assuming status changes to APPROVED triggers it)
        # To avoid spamming on every save, ideally we check previous state or update_fields.
        # But this works for a basic implementation.
        if instance.status == Job.Status.APPROVED:
            send_job_approved_students_email.delay(instance.id)

@receiver(post_save, sender=StudentProfile)
def notify_student_updates(sender, instance, created, update_fields, **kwargs):
    if created:
        # Welcome email
        send_student_welcome_email.delay(instance.user.id)
    elif not created:
        if instance.placement_status == StudentProfile.PlacementStatus.PLACED:
            send_status_update_email.delay(instance.id)

@receiver(post_save, sender=Application)
def notify_application_updates(sender, instance, created, update_fields, **kwargs):
    # Only notify on updates (status changes or round changes)
    if not created:
        send_application_update_email.delay(instance.id)

@receiver(post_save, sender=Drive)
def notify_drive_updates(sender, instance, created, update_fields, **kwargs):
    if created or instance.status == Drive.Status.APPROVED:
        send_drive_scheduled_email.delay(instance.id)
