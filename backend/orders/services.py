from .models import ShippingZone


def get_shipping_cost(city: str, county: str, subtotal: float) -> dict:
    """
    Match a delivery address to a ShippingZone using city/county strings,
    then apply free shipping threshold or base rate.

    Matching priority:
      1. City-level match (more specific) within active zones ordered by priority
      2. County-level match fallback

    Returns a dict with keys:
      - cost (float|None): shipping amount in KES, 0 if free, None if unserviceable
      - zone (ShippingZone|None): matched zone object
      - reason (str): human-readable explanation
      - error (str|None): set when delivery is unavailable
    """
    city_lower = city.strip().lower()
    county_lower = county.strip().lower()

    matched_zone = None

    # Iterate zones ordered by priority (highest first, set in Meta)
    for zone in ShippingZone.objects.filter(is_active=True):
        zone_cities = [c.strip().lower() for c in zone.cities]
        zone_counties = [c.strip().lower() for c in zone.counties]

        # City match takes priority (more specific override)
        if zone_cities and city_lower in zone_cities:
            matched_zone = zone
            break

        # County match as fallback
        if county_lower in zone_counties:
            matched_zone = zone
            break

    if not matched_zone:
        return {
            'cost': None,
            'zone': None,
            'reason': '',
            'error': (
                f'Delivery is not yet available for {city}, {county}. '
                'Please contact us for a custom shipping quote.'
            ),
        }

    # Free shipping threshold check
    if (
        matched_zone.free_shipping_threshold is not None
        and subtotal >= float(matched_zone.free_shipping_threshold)
    ):
        return {
            'cost': 0,
            'zone': matched_zone,
            'reason': f'Free shipping on orders over KES {matched_zone.free_shipping_threshold:,.0f}',
            'error': None,
        }

    return {
        'cost': float(matched_zone.base_rate),
        'zone': matched_zone,
        'reason': f'{matched_zone.name} delivery — {matched_zone.get_zone_type_display()}',
        'error': None,
    }