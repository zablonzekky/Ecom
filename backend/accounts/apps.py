from django.apps import AppConfig


class AccountsConfig(AppConfig):
    name = "accounts"

    def ready(self):
        from dj_rest_auth import forms
        from accounts.utils import custom_password_reset_url_generator
        forms.default_url_generator = custom_password_reset_url_generator