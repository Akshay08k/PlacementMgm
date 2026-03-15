from django.db.models.signals import post_save
from django.dispatch import receiver
from asgiref.sync import async_to_sync
from channels.layers import get_channel_layer
from .models import Notification

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
