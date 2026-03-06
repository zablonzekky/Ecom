"""
Admin authentication views.

Uses the same SimpleJWT that your existing project already has configured
in settings.py (SIMPLE_JWT block). No new auth system introduced.
"""
from django.contrib.auth import get_user_model, authenticate
from django.utils import timezone

from rest_framework import status
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework_simplejwt.exceptions import TokenError

User = get_user_model()


class AdminLoginView(APIView):
    """
    POST /api/admin/auth/login/
    Body: { "email": "...", "password": "..." }

    Only staff / superuser accounts are allowed in.
    Returns access + refresh tokens plus basic user info.
    """

    permission_classes = [AllowAny]

    def post(self, request):
        email = request.data.get("email", "").strip().lower()
        password = request.data.get("password", "")

        if not email or not password:
            return Response(
                {"detail": "Email and password are required."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        # Authenticate using email as USERNAME_FIELD
        user = authenticate(request, email=email, password=password)

        if user is None:
            return Response(
                {"detail": "Invalid credentials."},
                status=status.HTTP_401_UNAUTHORIZED,
            )

        if not (user.is_staff or user.is_superuser):
            return Response(
                {"detail": "Admin access required."},
                status=status.HTTP_403_FORBIDDEN,
            )

        if not user.is_active:
            return Response(
                {"detail": "Account is disabled."},
                status=status.HTTP_403_FORBIDDEN,
            )

        # Update last_login
        user.last_login = timezone.now()
        user.save(update_fields=["last_login"])

        refresh = RefreshToken.for_user(user)

        return Response({
            "access": str(refresh.access_token),
            "refresh": str(refresh),
            "user": _serialize_user(user),
        })


class AdminLogoutView(APIView):
    """
    POST /api/admin/auth/logout/
    Body: { "refresh": "<refresh_token>" }

    Blacklists the refresh token if token_blacklist is installed,
    otherwise just returns 200 (client should discard both tokens).
    """

    permission_classes = [IsAuthenticated]

    def post(self, request):
        refresh_token = request.data.get("refresh")
        if refresh_token:
            try:
                token = RefreshToken(refresh_token)
                token.blacklist()
            except (TokenError, AttributeError):
                # blacklist not installed or token already invalid — still OK
                pass
        return Response({"detail": "Logged out."})


class AdminMeView(APIView):
    """
    GET   /api/admin/auth/me/  → current user profile
    PATCH /api/admin/auth/me/  → update first_name / last_name
    """

    permission_classes = [IsAuthenticated]

    def get(self, request):
        if not (request.user.is_staff or request.user.is_superuser):
            return Response(
                {"detail": "Admin access required."},
                status=status.HTTP_403_FORBIDDEN,
            )
        return Response(_serialize_user(request.user))

    def patch(self, request):
        user = request.user
        allowed = {"first_name", "last_name"}
        for field in allowed:
            if field in request.data:
                setattr(user, field, request.data[field])
        user.save(update_fields=list(allowed & set(request.data.keys())))
        return Response(_serialize_user(user))


# ── helpers ───────────────────────────────────────────────────────────────────

def _serialize_user(user):
    return {
        "id": user.pk,
        "email": user.email,
        "first_name": user.first_name,
        "last_name": user.last_name,
        "full_name": user.get_full_name() or user.email,
        "is_staff": user.is_staff,
        "is_superuser": user.is_superuser,
        "role": getattr(user, "role", None),
        "status": getattr(user, "status", None),
        "last_login": user.last_login,
        "date_joined": user.date_joined,
    }