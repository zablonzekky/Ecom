import os
from django.conf import settings


def custom_password_reset_url_generator(request, user, temp_key):
    """
    Generates a password reset URL pointing to the React frontend.
    Reads FRONTEND_URL from settings (which loads it from .env).
    """
    frontend_url = getattr(settings, "FRONTEND_URL", None) or os.getenv("FRONTEND_URL", "http://localhost:3000")
    confirm_path = getattr(
        settings,
        "PASSWORD_RESET_CONFIRM_URL",
        "reset-password/{uid}/{token}"
    )

    from django.utils.http import urlsafe_base64_encode
    from django.utils.encoding import force_bytes

    uid = urlsafe_base64_encode(force_bytes(user.pk))
    path = confirm_path.format(uid=uid, token=temp_key)

    return f"{frontend_url}/{path}"