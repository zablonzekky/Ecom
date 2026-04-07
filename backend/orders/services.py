from decimal import Decimal
from .models import ShippingZone


def get_shipping_cost(city: str, county: str, subtotal: float) -> dict:
    city_lower = city.strip().lower()
    county_lower = county.strip().lower()

    matched_zone = None

    for zone in ShippingZone.objects.filter(is_active=True):
        zone_cities = [c.strip().lower() for c in zone.cities]
        zone_counties = [c.strip().lower() for c in zone.counties]

        if zone_cities and city_lower in zone_cities:
            matched_zone = zone
            break

        if county_lower in zone_counties:
            matched_zone = zone
            break

    # ✅ Fallback to "Rest of Kenya" instead of rejecting the order
    if not matched_zone:
        matched_zone = (
            ShippingZone.objects
            .filter(is_active=True, name__icontains="Rest of Kenya")
            .first()
        )

    # ✅ Last resort: use any active zone rather than failing
    if not matched_zone:
        matched_zone = ShippingZone.objects.filter(is_active=True).order_by('priority').first()

    if not matched_zone:
        return {
            'cost': Decimal('0'),
            'zone': None,
            'reason': 'Shipping cost to be confirmed',
            'error': None,  # ✅ Don't block the order
        }

    subtotal_dec = Decimal(str(subtotal))

    if (
        matched_zone.free_shipping_threshold is not None
        and subtotal_dec >= matched_zone.free_shipping_threshold
    ):
        return {
            'cost': Decimal('0'),       # ✅ Decimal, not float
            'zone': matched_zone,
            'reason': f'Free shipping on orders over KES {matched_zone.free_shipping_threshold:,.0f}',
            'error': None,
        }

    return {
        'cost': matched_zone.base_rate,  # ✅ Already Decimal from the model field
        'zone': matched_zone,
        'reason': f'{matched_zone.name} delivery — {matched_zone.get_zone_type_display()}',
        'error': None,
    }