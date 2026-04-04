from django.apps import AppConfig

class NotificationsConfig(AppConfig):
    default_auto_field = "django.db.models.BigAutoField"
    name = "admin_app.notifications"  # adjust to your app path

    def ready(self):
        import admin_app.notifications.signals  # adjust to your app path