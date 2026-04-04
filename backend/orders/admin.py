from django.contrib import admin
from .models import Address, Order, OrderItem, OrderTimeline, Refund, ShippingZone


@admin.register(ShippingZone)
class ShippingZoneAdmin(admin.ModelAdmin):
    list_display = [
        'name', 'zone_type', 'base_rate',
        'free_shipping_threshold', 'priority', 'is_active',
    ]
    list_editable = ['base_rate', 'free_shipping_threshold', 'priority', 'is_active']
    list_filter = ['zone_type', 'is_active']
    search_fields = ['name']
    ordering = ['-priority']

    fieldsets = (
        (None, {
            'fields': ('name', 'zone_type', 'is_active', 'priority'),
        }),
        ('Coverage', {
            'fields': ('counties', 'cities'),
            'description': (
                'Enter as JSON arrays. counties is required; cities allows finer-grain '
                'overrides within a county. Example: ["Nairobi", "Kiambu"]'
            ),
        }),
        ('Rates', {
            'fields': ('base_rate', 'free_shipping_threshold'),
        }),
    )


class OrderItemInline(admin.TabularInline):
    model = OrderItem
    extra = 0
    readonly_fields = ['product', 'quantity', 'price', 'subtotal']
    can_delete = False


class OrderTimelineInline(admin.TabularInline):
    model = OrderTimeline
    extra = 0
    readonly_fields = ['status', 'note', 'created_at', 'created_by']
    can_delete = False


@admin.register(Order)
class OrderAdmin(admin.ModelAdmin):
    list_display = [
        'order_number', 'user', 'status',
        'shipping_zone', 'shipping_cost', 'total', 'created_at',
    ]
    list_filter = ['status', 'shipping_zone__zone_type', 'created_at']
    search_fields = ['order_number', 'user__email']
    readonly_fields = [
        'order_number', 'user', 'address', 'shipping_zone',
        'subtotal', 'shipping_cost', 'total', 'created_at', 'updated_at',
    ]
    inlines = [OrderItemInline, OrderTimelineInline]
    ordering = ['-created_at']


@admin.register(Address)
class AddressAdmin(admin.ModelAdmin):
    list_display = ['full_name', 'user', 'city', 'county', 'is_default']
    list_filter = ['is_default', 'county']
    search_fields = ['full_name', 'user__email', 'city', 'county']


@admin.register(Refund)
class RefundAdmin(admin.ModelAdmin):
    list_display = ['order', 'amount', 'status', 'created_at']
    list_filter = ['status']
    list_editable = ['status']
    search_fields = ['order__order_number']