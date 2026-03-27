from django.db import migrations

def delete_orphaned_tokens(apps, schema_editor):
    OutstandingToken = apps.get_model('token_blacklist', 'OutstandingToken')
    OutstandingToken.objects.filter(user__isnull=True).delete()

class Migration(migrations.Migration):

    dependencies = [
        ('token_blacklist', '0001_initial'),
    ]

    operations = [
        migrations.RunPython(delete_orphaned_tokens, migrations.RunPython.noop),
    ]