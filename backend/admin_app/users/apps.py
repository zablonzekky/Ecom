from django.apps import AppConfig

class AdminUsersConfig(AppConfig):
    default_auto_field = "django.db.models.BigAutoField"
    name = 'admin_app.users'
    label = 'admin_users'  # this is what AUTH_USER_MODEL references