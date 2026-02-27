from django.conf import settings
from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        ("orders", "__first__"),
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
        ("payments", "0003_alter_mpesatransaction_id"),
    ]

    operations = [
        migrations.CreateModel(
            name="PaypalTransaction",
            fields=[
                ("id", models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name="ID")),
                ("amount", models.DecimalField(decimal_places=2, max_digits=10)),
                ("status", models.CharField(choices=[("pending", "Pending"), ("completed", "Completed"), ("failed", "Failed"), ("cancelled", "Cancelled")], default="pending", max_length=20)),
                ("paypal_order_id", models.CharField(max_length=120, unique=True)),
                ("paypal_capture_id", models.CharField(blank=True, max_length=120)),
                ("result_desc", models.TextField(blank=True)),
                ("callback_data", models.JSONField(blank=True, null=True)),
                ("created_at", models.DateTimeField(auto_now_add=True)),
                ("updated_at", models.DateTimeField(auto_now=True)),
                ("order", models.OneToOneField(on_delete=django.db.models.deletion.CASCADE, related_name="paypal_transaction", to="orders.order")),
                ("user", models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to=settings.AUTH_USER_MODEL)),
            ],
            options={"ordering": ["-created_at"]},
        ),
    ]
