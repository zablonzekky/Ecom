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


def _create_user_registered_notification(user):
    """Shared helper — creates notification + activity log for any new user."""
    notify_admins(
        title="New User Registered",
        message=f"{user.email} just created an account.",
        notification_type="info",
    )
    ActivityLog.objects.create(
        user=user,
        action="registered",
        resource_type="User",
        resource_id=user.id,
        description=f"New user registered: {user.email}",
    )


# ── New order placed ──────────────────────────────────────────────────────────
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


# ── New user registered (email/password signup) ───────────────────────────────
@receiver(post_save, sender=User)
def user_registered_notification(sender, instance, created, **kwargs):
    # Skip if this user was created by social auth — allauth's user_signed_up
    # signal handles that case to avoid double notifications
    if created and not instance.socialaccount_set.exists():
        _create_user_registered_notification(instance)


# ── New user registered (Google / Facebook / any social signup) ───────────────
try:
    from allauth.socialaccount.signals import social_account_added
    from allauth.account.signals import user_signed_up

    @receiver(user_signed_up)
    def user_signed_up_notification(request, user, **kwargs):
        """
        Fires for ALL new signups via allauth — both email and social.
        We use this exclusively for social signups; email signups are
        handled by post_save above (socialaccount_set will be empty at
        post_save time for email users so there's no double-fire).
        """
        # Only handle social signups here — email signups already handled by post_save
        sociallogin = kwargs.get('sociallogin')
        if sociallogin:
            _create_user_registered_notification(user)

except ImportError:
    pass