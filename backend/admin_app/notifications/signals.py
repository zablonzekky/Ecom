from django.db.models.signals import post_save
from django.dispatch import receiver
from django.contrib.auth import get_user_model
from orders.models import Order
from admin_app.notifications.models import Notification, ActivityLog

User = get_user_model()


def notify_admins(title, message, notification_type="info"):
    """Send a notification to all admin users."""
    admins = User.objects.filter(is_staff=True)
    notifications = [
        Notification(
            user=admin,
            title=title,
            message=message,
            notification_type=notification_type,
        )
        for admin in admins
    ]
    Notification.objects.bulk_create(notifications)


# ── New order placed ──
@receiver(post_save, sender=Order)
def order_notification(sender, instance, created, **kwargs):
    if created:
        notify_admins(
            title="New Order Received",
            message=f"Order #{instance.order_number} was placed by {instance.user.email} · "
                    f"KES {instance.total}",
            notification_type="success",
        )
        ActivityLog.objects.create(
            user=instance.user,
            action="created",
            resource_type="Order",
            resource_id=instance.id,
            description=f"Placed order #{instance.order_number}",
        )


# ── New user registered ──
@receiver(post_save, sender=User)
def user_registered_notification(sender, instance, created, **kwargs):
    if created:
        notify_admins(
            title="New User Registered",
            message=f"{instance.email} just created an account.",
            notification_type="info",
        )
        ActivityLog.objects.create(
            user=instance,
            action="registered",
            resource_type="User",
            resource_id=instance.id,
            description=f"New user registered: {instance.email}",
        )