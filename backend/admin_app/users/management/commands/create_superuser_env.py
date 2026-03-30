import os
from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model

class Command(BaseCommand):
    help = "Creates or updates superuser from environment variables"

    def handle(self, *args, **kwargs):
        User = get_user_model()  # ✅ moved inside handle
        
        email    = os.environ.get("ADMIN_EMAIL", os.environ.get("ADMIN_USERNAME", "admin"))
        password = os.environ.get("ADMIN_PASSWORD", "admin123")

        if User.objects.filter(email=email).exists():
            user = User.objects.get(email=email)
            user.set_password(password)
            user.is_staff = True
            user.is_superuser = True
            user.save()
            self.stdout.write(self.style.SUCCESS(f"✓ Updated superuser: {email}"))
        else:
            User.objects.create_superuser(email=email, password=password)
            self.stdout.write(self.style.SUCCESS(f"✓ Created superuser: {email}"))
