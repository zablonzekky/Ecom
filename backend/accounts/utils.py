import os
from django.conf import settings
from django.utils.http import urlsafe_base64_encode
from django.utils.encoding import force_bytes


def custom_password_reset_url_generator(request, user, temp_key):
    """
    Builds a frontend-facing password reset URL.
    Priority: settings.FRONTEND_URL -> FRONTEND_URL env var -> request origin -> localhost fallback
    """
    frontend_url = getattr(settings, "FRONTEND_URL", None)

    if not frontend_url:
        frontend_url = os.environ.get("FRONTEND_URL", None)

    # Last resort: derive from the incoming request's origin
    if not frontend_url and request is not None:
        scheme = "https" if request.is_secure() else "http"
        host = request.get_host()  # e.g. "ecombay.onrender.com"
        frontend_url = f"{scheme}://{host}"

    if not frontend_url:
        frontend_url = "http://localhost:3000"

    frontend_url = frontend_url.rstrip("/")

    uid = urlsafe_base64_encode(force_bytes(user.pk))

    return f"{frontend_url}/reset-password/{uid}/{temp_key}"