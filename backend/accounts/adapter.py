"""
accounts/adapter.py

Custom allauth adapter that rewrites the password-reset URL
so it points to the React frontend instead of Django admin.
"""

from django.conf import settings
from allauth.account.adapter import DefaultAccountAdapter 

class CustomAccountAdapter(DefaultAccountAdapter):

    def get_email_confirmation_url(self, request, emailconfirmation):
        """Keep email confirmation on frontend too (optional)."""
        frontend = getattr(settings, "FRONTEND_URL", "")
        return f"{frontend}/verify-email/{emailconfirmation.key}"

    def send_password_reset_mail(self, user, email, extra_context):
        """
        Build the reset link using FRONTEND_URL + PASSWORD_RESET_CONFIRM_URL
        so the email contains e.g.:
          https://ecombay.onrender.com/reset-password/<uid>/<token>
        """
        uid = extra_context.get("uid", "")
        token = extra_context.get("token", "")

        frontend = getattr(settings, "FRONTEND_URL", "").rstrip("/")
        path = getattr(
            settings,
            "PASSWORD_RESET_CONFIRM_URL",
            "reset-password/{uid}/{token}",
        ).format(uid=uid, token=token)

        reset_url = f"{frontend}/{path}"
        extra_context["password_reset_url"] = reset_url

        super().send_password_reset_mail(user, email, extra_context)
