"""
accounts/adapter.py

Intercepts allauth's send_mail call for password reset so we can
inject the branded HTML template. The template prefix allauth uses
is 'account/email/password_reset_key' which resolves to:
  account/email/password_reset_key_subject.txt
  account/email/password_reset_key_message.txt
  account/email/password_reset_key_message.html   ← your branded HTML
"""

from allauth.account.adapter import DefaultAccountAdapter
from django.conf import settings


class CustomAccountAdapter(DefaultAccountAdapter):

    def get_email_confirmation_url(self, request, emailconfirmation):
        frontend = getattr(settings, "FRONTEND_URL", "").rstrip("/")
        return f"{frontend}/verify-email/{emailconfirmation.key}"

    # No need to override send_password_reset_mail here.
    # The url is already fixed by _build_frontend_reset_url in serializers.py
    # via get_email_options → url_generator kwarg.
    # The template is picked up automatically from:
    #   templates/account/email/password_reset_key_message.html