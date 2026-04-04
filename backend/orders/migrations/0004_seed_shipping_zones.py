from django.db import migrations


def seed_shipping_zones(apps, schema_editor):
    ShippingZone = apps.get_model('orders', 'ShippingZone')

    zones = [
        {
            'name': 'Nairobi CBD',
            'zone_type': 'cbd',
            'counties': ['Nairobi'],
            'cities': ['nairobi cbd', 'city centre', 'city center', 'downtown nairobi'],
            'base_rate': 150,
            'free_shipping_threshold': 3000,
            'priority': 20,
            'is_active': True,
        },
        {
            'name': 'Nairobi Suburbs',
            'zone_type': 'suburb',
            'counties': ['Nairobi'],
            'cities': [
                'westlands', 'karen', 'kilimani', 'lavington', 'parklands',
                'upperhill', 'ngong road', 'langata', 'south b', 'south c',
                'kasarani', 'roysambu', 'ruaka', 'gigiri', 'runda',
            ],
            'base_rate': 250,
            'free_shipping_threshold': 5000,
            'priority': 10,
            'is_active': True,
        },
        {
            'name': 'Kiambu & Outskirts',
            'zone_type': 'suburb',
            'counties': ['Kiambu'],
            'cities': ['thika', 'ruiru', 'juja', 'limuru', 'kikuyu', 'githunguri'],
            'base_rate': 350,
            'free_shipping_threshold': 6000,
            'priority': 8,
            'is_active': True,
        },
        {
            'name': 'Kajiado & Machakos',
            'zone_type': 'suburb',
            'counties': ['Kajiado', 'Machakos'],
            'cities': ['ngong', 'ongata rongai', 'kitengela', 'syokimau', 'mlolongo', 'machakos'],
            'base_rate': 400,
            'free_shipping_threshold': 7000,
            'priority': 7,
            'is_active': True,
        },
        {
            'name': 'Mombasa',
            'zone_type': 'upcountry',
            'counties': ['Mombasa'],
            'cities': ['mombasa', 'nyali', 'bamburi', 'likoni', 'mvita'],
            'base_rate': 700,
            'free_shipping_threshold': 10000,
            'priority': 5,
            'is_active': True,
        },
        {
            'name': 'Kisumu',
            'zone_type': 'upcountry',
            'counties': ['Kisumu'],
            'cities': ['kisumu', 'kondele', 'milimani', 'nyalenda'],
            'base_rate': 700,
            'free_shipping_threshold': 10000,
            'priority': 5,
            'is_active': True,
        },
        {
            'name': 'Nakuru & Eldoret',
            'zone_type': 'upcountry',
            'counties': ['Nakuru', 'Uasin Gishu'],
            'cities': ['nakuru', 'eldoret', 'rongai', 'njoro'],
            'base_rate': 650,
            'free_shipping_threshold': 10000,
            'priority': 5,
            'is_active': True,
        },
        {
            'name': 'Rest of Kenya',
            'zone_type': 'upcountry',
            'counties': [
                'Kakamega', 'Bungoma', 'Busia', 'Vihiga',
                'Trans Nzoia', 'West Pokot', 'Elgeyo Marakwet',
                'Nandi', 'Baringo', 'Laikipia', 'Samburu',
                'Isiolo', 'Meru', 'Tharaka Nithi', 'Embu',
                'Kitui', 'Makueni', 'Kilifi', 'Kwale', 'Taita Taveta',
                'Lamu', 'Tana River', 'Garissa', 'Wajir', 'Mandera',
                'Marsabit', 'Turkana', 'Nyandarua', 'Nyeri', 'Kirinyaga',
                'Murang\'a', 'Homa Bay', 'Migori', 'Nyamira',
                'Siaya', 'Kericho', 'Bomet', 'Narok', 'Kajiado',
            ],
            'cities': [],
            'base_rate': 800,
            'free_shipping_threshold': 12000,
            'priority': 1,
            'is_active': True,
        },
    ]

    for zone_data in zones:
        ShippingZone.objects.get_or_create(
            name=zone_data['name'],
            defaults=zone_data,
        )


def reverse_seed(apps, schema_editor):
    ShippingZone = apps.get_model('orders', 'ShippingZone')
    ShippingZone.objects.all().delete()


class Migration(migrations.Migration):

    dependencies = [
        # Replace with your actual latest migration
        ('orders', '0003_shippingzone_order_shipping_zone'),
    ]

    operations = [
        migrations.RunPython(seed_shipping_zones, reverse_seed),
    ]