from django.conf import settings
from django.contrib.auth import get_user_model
from django.contrib.auth.forms import PasswordResetForm
from django.contrib.auth.password_validation import validate_password
from django.core.exceptions import ValidationError
from django.utils.encoding import force_str
from django.utils.http import urlsafe_base64_decode

from rest_framework import serializers
from rest_framework_simplejwt.tokens import RefreshToken

from dj_rest_auth.serializers import (
    PasswordResetSerializer,
    PasswordResetConfirmSerializer,
)

from .models import ContactMessage, NewsletterSubscription

User = get_user_model()


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


class CustomPasswordResetForm(PasswordResetForm):
    def save(self, domain_override=None, use_https=False, request=None, **kwargs):
        from django.contrib.auth.tokens import default_token_generator
        from accounts.utils import custom_password_reset_url_generator

        for user in self.get_users(self.cleaned_data["email"]):
            temp_key = default_token_generator.make_token(user)
            reset_url = custom_password_reset_url_generator(request, user, temp_key)

            context = {
                "email": user.email,
                "password_reset_url": reset_url,
                "user": user,
                "site_name": "EcomBay",
            }

            self.send_mail(
                subject_template_name="registration/password_reset_subject.txt",
                email_template_name="registration/password_reset_email.txt",
                context=context,
                from_email=getattr(settings, "DEFAULT_FROM_EMAIL", None),
                to_email=user.email,
                html_email_template_name="registration/password_reset_email.html",
            )


class CustomPasswordResetSerializer(PasswordResetSerializer):
    """
    Bypasses dj_rest_auth's save() entirely so it never builds its own opts
    dict with Django's default template path containing {% url 'password_reset_confirm' %}.
    """

    @property
    def password_reset_form_class(self):
        return CustomPasswordResetForm

    # ✅ THIS is what was missing — without this, dj_rest_auth's save() runs instead
    def save(self):
        request = self.context.get('request')
        self.reset_form.save(
            use_https=request.is_secure(),
            request=request,
        )

    def get_email_options(self):
        return {}


class CustomPasswordResetConfirmSerializer(PasswordResetConfirmSerializer):
    """
    Decodes uid before calling the parent, so validation errors are readable
    rather than the cryptic {"uid": ["Invalid value"]}.
    """

    def validate(self, attrs):
        try:
            uid = force_str(urlsafe_base64_decode(attrs.get("uid", "")))
            User.objects.get(pk=uid)
        except (User.DoesNotExist, ValueError, TypeError, OverflowError):
            raise serializers.ValidationError(
                {"uid": "This reset link is invalid or has already been used."}
            )
        return super().validate(attrs)