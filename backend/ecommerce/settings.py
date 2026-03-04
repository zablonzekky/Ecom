from pathlib import Path
from datetime import timedelta
import os
from dotenv import load_dotenv

# =======================
# Load Environment Variables
# =======================
load_dotenv()

BASE_DIR = Path(__file__).resolve().parent.parent

# =======================
# Security
# =======================
SECRET_KEY = os.getenv(
    "DJANGO_SECRET_KEY",
    "unsafe-development-key-change-in-production",
)

DEBUG = os.getenv("DEBUG", "False") == "True"

ALLOWED_HOSTS = os.getenv(
    "ALLOWED_HOSTS",
    "localhost,127.0.0.1"
).split(",")

# =======================
# Applications
# =======================
INSTALLED_APPS = [
    # Django Core
    "django.contrib.admin",
    "django.contrib.auth",
    "django.contrib.contenttypes",
    "django.contrib.sessions",
    "django.contrib.messages",
    "django.contrib.staticfiles",
    "django.contrib.sites",

    # Third Party
    "corsheaders",
    "rest_framework",
    "rest_framework.authtoken",
    "dj_rest_auth",
    "dj_rest_auth.registration",
    "allauth",
    "allauth.account",
    "allauth.socialaccount",
    "allauth.socialaccount.providers.google",
    "allauth.socialaccount.providers.facebook",

    # Local Apps
    "products",
    "accounts",
    "orders",
    "payments",
    "Google",
]

SITE_ID = 1

# =======================
# Middleware
# =======================
MIDDLEWARE = [
    "django.middleware.security.SecurityMiddleware",
    "django.contrib.sessions.middleware.SessionMiddleware",
    "corsheaders.middleware.CorsMiddleware",
    "django.middleware.common.CommonMiddleware",
    "django.middleware.csrf.CsrfViewMiddleware",
    "django.contrib.auth.middleware.AuthenticationMiddleware",
    "allauth.account.middleware.AccountMiddleware",
    "django.contrib.messages.middleware.MessageMiddleware",
    "django.middleware.clickjacking.XFrameOptionsMiddleware",
    "ecommerce.middleware.RequestLogMiddleware",
]

ROOT_URLCONF = "ecommerce.urls"
WSGI_APPLICATION = "ecommerce.wsgi.application"

# =======================
# Templates
# =======================
TEMPLATES = [
    {
        "BACKEND": "django.template.backends.django.DjangoTemplates",
        "DIRS": [BASE_DIR / "templates"],
        "APP_DIRS": True,
        "OPTIONS": {
            "context_processors": [
                "django.template.context_processors.debug",
                "django.template.context_processors.request",
                "django.contrib.auth.context_processors.auth",
                "django.contrib.messages.context_processors.messages",
            ],
        },
    },
]

# =======================
# Database
# =======================
DATABASES = {
    "default": {
        "ENGINE": "django.db.backends.sqlite3",
        "NAME": BASE_DIR / "ecommerce_db.sqlite3",
    }
}

# =======================
# Authentication
# =======================
AUTHENTICATION_BACKENDS = (
    "django.contrib.auth.backends.ModelBackend",
    "allauth.account.auth_backends.AuthenticationBackend",
)

REST_FRAMEWORK = {
    "DEFAULT_AUTHENTICATION_CLASSES": (
        "rest_framework_simplejwt.authentication.JWTAuthentication",
        "rest_framework.authentication.TokenAuthentication",
    ),
    "DEFAULT_PERMISSION_CLASSES": (
        "rest_framework.permissions.AllowAny",
    ),
}

REST_AUTH = {
    "USE_JWT": True,
    "JWT_AUTH_COOKIE": None,
    "JWT_AUTH_REFRESH_COOKIE": None,
    "OLD_PASSWORD_FIELD_ENABLED": True,
    "PASSWORD_RESET_USE_SITES_DOMAIN": False,
}

# =======================
# Allauth
# =======================
ACCOUNT_ADAPTER = "accounts.adapter.CustomAccountAdapter"
ACCOUNT_EMAIL_REQUIRED = True
ACCOUNT_USERNAME_REQUIRED = False
ACCOUNT_AUTHENTICATION_METHOD = "email"
ACCOUNT_EMAIL_VERIFICATION = "optional"
ACCOUNT_DEFAULT_HTTP_PROTOCOL = "https"

# =======================
# Password Reset — points email link to React frontend
# =======================
FRONTEND_URL = os.getenv("FRONTEND_URL", "https://ecom-frontend-9qeq.onrender.com")
PASSWORD_RESET_CONFIRM_URL = "reset-password/{uid}/{token}"

# =======================
# Social Providers
# =======================
SOCIALACCOUNT_PROVIDERS = {
    "google": {
        "APP": {
            "client_id": os.getenv("GOOGLE_CLIENT_ID"),
            "secret": os.getenv("GOOGLE_CLIENT_SECRET"),
            "key": "",
        },
        "SCOPE": ["profile", "email"],
    },
    "facebook": {
        "APP": {
            "client_id": os.getenv("FACEBOOK_APP_ID"),
            "secret": os.getenv("FACEBOOK_APP_SECRET"),
            "key": "",
        },
        "SCOPE": ["email", "public_profile"],
    },
}

# =======================
# Static & Media
# =======================
STATIC_URL = "/static/"
STATIC_ROOT = BASE_DIR / "staticfiles"
STATICFILES_DIRS = [BASE_DIR / "static"]

MEDIA_URL = "/media/"
MEDIA_ROOT = BASE_DIR / "media"

DEFAULT_AUTO_FIELD = "django.db.models.BigAutoField"

# =======================
# JWT Settings
# =======================
SIMPLE_JWT = {
    "ACCESS_TOKEN_LIFETIME": timedelta(minutes=30),
    "REFRESH_TOKEN_LIFETIME": timedelta(days=1),
    "AUTH_HEADER_TYPES": ("Bearer",),
}

# =======================
# CORS
# =======================
CORS_ALLOWED_ORIGINS = os.getenv(
    "CORS_ALLOWED_ORIGINS",
    "http://localhost:3000"
).split(",")

CORS_ALLOW_CREDENTIALS = True

# =======================
# CSRF
# =======================
CSRF_TRUSTED_ORIGINS = [
    "https://ecom-frontend-9qeq.onrender.com",
]

# =======================
# Production Security
# =======================
SESSION_COOKIE_SECURE = not DEBUG
CSRF_COOKIE_SECURE = not DEBUG
SECURE_BROWSER_XSS_FILTER = True
SECURE_CONTENT_TYPE_NOSNIFF = True
X_FRAME_OPTIONS = "DENY"

# =======================
# Email
# =======================
EMAIL_BACKEND = "django.core.mail.backends.smtp.EmailBackend"
EMAIL_HOST = "smtp.gmail.com"
EMAIL_PORT = 587
EMAIL_USE_TLS = True
EMAIL_HOST_USER = os.getenv("EMAIL_HOST_USER")
EMAIL_HOST_PASSWORD = os.getenv("EMAIL_HOST_PASSWORD")
DEFAULT_FROM_EMAIL = os.getenv("DEFAULT_FROM_EMAIL", EMAIL_HOST_USER)
CONTACT_RECEIVER_EMAIL = os.getenv("CONTACT_RECEIVER_EMAIL", "support@ecom.local")

# =======================
# Logging
# =======================
LOGGING = {
    "version": 1,
    "disable_existing_loggers": False,
    "handlers": {
        "console": {"class": "logging.StreamHandler"},
    },
    "root": {
        "handlers": ["console"],
        "level": os.getenv("LOG_LEVEL", "INFO"),
    },
}
