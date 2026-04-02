from rest_framework import serializers
from .models import Address, Order, OrderItem
from products.models import Product

class AddressSerializer(serializers.ModelSerializer):
    class Meta:
        model = Address
        fields = [
            'id', 'full_name', 'phone_number', 'address_line1',
            'address_line2', 'city', 'county', 'postal_code', 'is_default'
        ]
        read_only_fields = ['id']
        ref_name = "UserAddress"


class OrderItemSerializer(serializers.ModelSerializer):
    product_name = serializers.CharField(source='product.name', read_only=True)

    class Meta:
        model = OrderItem
        fields = ['id', 'product', 'product_name', 'quantity', 'price', 'subtotal']
        read_only_fields = ['id', 'price', 'subtotal']
        # Unique ref_name for Swagger
        ref_name = "UserOrderItem"


class OrderSerializer(serializers.ModelSerializer):
    items = OrderItemSerializer(many=True, read_only=True)
    address = AddressSerializer(read_only=True)
    # Corrected: Use email instead of username to match your custom User model
    user_email = serializers.CharField(source='user.email', read_only=True)

    class Meta:
        model = Order
        fields = [
            'id', 'order_number', 'user', 'user_email', 'address',
            'status', 'subtotal', 'shipping_cost', 'total',
            'items', 'notes', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'order_number', 'user', 'created_at', 'updated_at']
        # Unique ref_name for Swagger
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
                product = Product.objects.get(id=product_id)
            except Product.DoesNotExist:
                raise serializers.ValidationError(f"Invalid product id: {product_id}")
            
            if quantity < 1:
                raise serializers.ValidationError("Quantity must be at least 1.")
        
        return value