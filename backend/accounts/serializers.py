from django.conf import settings
from django.contrib.auth import get_user_model
from django.contrib.auth.forms import PasswordResetForm
from django.contrib.auth.password_validation import validate_password
from django.core.exceptions import ValidationError
from django.utils.encoding import force_str, force_bytes
from django.utils.http import urlsafe_base64_decode, urlsafe_base64_encode

from rest_framework import serializers
from rest_framework_simplejwt.tokens import RefreshToken

from dj_rest_auth.serializers import (
    PasswordResetSerializer,
    PasswordResetConfirmSerializer,
)

from .models import ContactMessage, NewsletterSubscription

User = get_user_model()

# --- UTILITY SERIALIZERS ---

class NewsletterSubscriptionSerializer(serializers.ModelSerializer):
    class Meta:
        model = NewsletterSubscription
        fields = ["id", "email", "is_active", "created_at"]
        read_only_fields = ["id", "is_active", "created_at"]


class ContactMessageSerializer(serializers.ModelSerializer):
    class Meta:
        model = ContactMessage
        fields = ["id", "name", "email", "message", "created_at"]
        read_only_fields = ["id", "created_at"]


class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ["id", "email", "first_name", "last_name", "date_joined"]
        read_only_fields = ["id", "date_joined"]


class UserProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ["id", "email", "first_name", "last_name", "date_joined"]
        read_only_fields = ["id", "date_joined"]


class UserProfileUpdateSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ["email", "first_name", "last_name"]

    def validate_email(self, value):
        user = self.context["request"].user
        if User.objects.filter(email=value).exclude(id=user.id).exists():
            raise serializers.ValidationError("Email already in use.")
        return value


# --- AUTH SERIALIZERS ---

class RegisterSerializer(serializers.Serializer):
    email = serializers.EmailField(required=True)
    password = serializers.CharField(write_only=True, required=True)
    password2 = serializers.CharField(write_only=True, required=True)
    first_name = serializers.CharField(max_length=30, required=False, allow_blank=True)
    last_name = serializers.CharField(max_length=30, required=False, allow_blank=True)

    def validate(self, attrs):
        for field in ["email", "password", "password2"]:
            if not attrs.get(field):
                raise serializers.ValidationError({field: f"{field} is required."})

        if attrs["password"] != attrs["password2"]:
            raise serializers.ValidationError({"password2": "Passwords do not match."})

        if User.objects.filter(email=attrs["email"]).exists():
            raise serializers.ValidationError(
                {"email": "An account with this email already exists."}
            )

        try:
            validate_password(attrs["password"])
        except ValidationError as e:
            raise serializers.ValidationError({"password": list(e.messages)})

        return attrs

    def create(self, validated_data):
        validated_data.pop("password2")
        return User.objects.create_user(
            email=validated_data["email"],
            password=validated_data["password"],
            first_name=validated_data.get("first_name", ""),
            last_name=validated_data.get("last_name", ""),
        )

    def to_representation(self, instance):
        refresh = RefreshToken.for_user(instance)
        return {
            "message": "User created successfully.",
            "user": {
                "id": instance.id,
                "email": instance.email,
                "first_name": instance.first_name,
                "last_name": instance.last_name,
            },
            "tokens": {
                "refresh": str(refresh),
                "access": str(refresh.access_token),
            },
        }


# --- PASSWORD RESET LOGIC ---

def _build_frontend_reset_url(request, user, temp_key):
    """
    Injected as url_generator into AllAuthPasswordResetForm.save().
    Uses allauth's user_pk_to_url_str so the uid in the link matches
    what allauth's url_str_to_user_pk decodes on confirm.
    """
    import os
    from allauth.account.utils import user_pk_to_url_str

    frontend_url = (
        getattr(settings, "FRONTEND_URL", None)
        or os.environ.get("FRONTEND_URL", None)
    )

    if not frontend_url and request is not None:
        scheme = "https" if request.is_secure() else "http"
        frontend_url = f"{scheme}://{request.get_host()}"

    if not frontend_url:
        frontend_url = "http://localhost:3000"

    frontend_url = frontend_url.rstrip("/")
    uid = user_pk_to_url_str(user)  # allauth base36 encoder
    return f"{frontend_url}/reset-password/{uid}/{temp_key}"


class CustomPasswordResetSerializer(PasswordResetSerializer):
    """
    Passes our frontend url_generator to AllAuthPasswordResetForm.save()
    so the reset link points to React, not Django admin.
    """

    def get_email_options(self):
        return {
            "url_generator": _build_frontend_reset_url,
        }


class CustomPasswordResetConfirmSerializer(PasswordResetConfirmSerializer):
    """
    Uses the parent's validate() unchanged — it already handles allauth's
    base36 uid encoding (url_str_to_user_pk) when allauth is in INSTALLED_APPS.
    Do NOT override validate() with urlsafe_base64_decode here — that was
    the bug causing "invalid or already used" errors.
    """
    pass