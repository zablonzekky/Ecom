from django.db import migrations


DEFAULT_CATEGORIES = [
    {
        "name": "Men",
        "slug": "men",
        "gender": "M",
        "description": "Men's clothing, shoes and accessories.",
    },
    {
        "name": "Women",
        "slug": "women",
        "gender": "W",
        "description": "Women's clothing, shoes and accessories.",
    },
    {
        "name": "Shoes",
        "slug": "shoes",
        "gender": "U",
        "description": "Footwear for everyone.",
    },
    {
        "name": "Accessories",
        "slug": "accessories",
        "gender": "U",
        "description": "Bags, belts, hats and more.",
    },
]


def seed_categories(apps, schema_editor):
    """Create the 4 default storefront categories if they don't already exist."""
    Category = apps.get_model("products", "Category")
    for data in DEFAULT_CATEGORIES:
        Category.objects.get_or_create(
            slug=data["slug"],
            defaults={
                "name": data["name"],
                "gender": data["gender"],
                "description": data["description"],
                "is_active": True,
            },
        )


def unseed_categories(apps, schema_editor):
    """Reverse: remove only the default categories if they have no products."""
    Category = apps.get_model("products", "Category")
    slugs = [d["slug"] for d in DEFAULT_CATEGORIES]
    Category.objects.filter(slug__in=slugs, products__isnull=True).delete()


class Migration(migrations.Migration):

    dependencies = [
        ("products", "0004_alter_product_product_type"),
    ]

    operations = [
        migrations.RunPython(seed_categories, reverse_code=unseed_categories),
    ]