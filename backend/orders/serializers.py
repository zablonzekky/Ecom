from rest_framework import serializers
from .models import Address, Order, OrderItem, ShippingZone
from products.models import Product


class AddressSerializer(serializers.ModelSerializer):
    class Meta:
        model = Address
        fields = [
            'id', 'full_name', 'phone_number', 'address_line1',
            'address_line2', 'city', 'county', 'postal_code', 'is_default',
        ]
        read_only_fields = ['id']
        ref_name = "UserAddress"


class ShippingZoneSerializer(serializers.ModelSerializer):
    zone_type_display = serializers.CharField(source='get_zone_type_display', read_only=True)

    class Meta:
        model = ShippingZone
        fields = ['id', 'name', 'zone_type', 'zone_type_display', 'base_rate', 'free_shipping_threshold']
        ref_name = "OrderShippingZone"


class OrderItemSerializer(serializers.ModelSerializer):
    product_name = serializers.CharField(source='product.name', read_only=True)

    class Meta:
        model = OrderItem
        fields = ['id', 'product', 'product_name', 'quantity', 'price', 'subtotal']
        read_only_fields = ['id', 'price', 'subtotal']
        ref_name = "UserOrderItem"


class OrderSerializer(serializers.ModelSerializer):
    items = OrderItemSerializer(many=True, read_only=True)
    address = AddressSerializer(read_only=True)
    shipping_zone = ShippingZoneSerializer(read_only=True)
    user_email = serializers.CharField(source='user.email', read_only=True)

    class Meta:
        model = Order
        fields = [
            'id', 'order_number', 'user', 'user_email', 'address',
            'shipping_zone', 'status', 'subtotal', 'shipping_cost', 'total',
            'items', 'notes', 'created_at', 'updated_at',
        ]
        read_only_fields = ['id', 'order_number', 'user', 'created_at', 'updated_at']
        ref_name = "UserOrderDetails"


class CreateOrderSerializer(serializers.Serializer):
    address_id = serializers.IntegerField()
    items = serializers.ListField(child=serializers.DictField())
    notes = serializers.CharField(required=False, allow_blank=True)

    def validate_items(self, value):
        if not value:
            raise serializers.ValidationError("Order must have at least one item.")

        for item in value:
            product_id = item.get('product_id')
            quantity = item.get('quantity', 1)

            try:
                Product.objects.get(id=product_id)
            except Product.DoesNotExist:
                raise serializers.ValidationError(f"Invalid product id: {product_id}")

            if quantity < 1:
                raise serializers.ValidationError("Quantity must be at least 1.")

        return value