from rest_framework import serializers
from .models import Order, OrderItem, OrderTimeline, Refund
from admin_app.users.serializers import UserSerializer


class OrderItemSerializer(serializers.ModelSerializer):
    subtotal = serializers.DecimalField(max_digits=10, decimal_places=2, read_only=True)

    class Meta:
        model = OrderItem
        fields = ['id', 'product', 'product_name', 'quantity', 'unit_price', 'subtotal']


class OrderTimelineSerializer(serializers.ModelSerializer):
    class Meta:
        model = OrderTimeline
        fields = ['id', 'status', 'note', 'created_at', 'created_by']


class RefundSerializer(serializers.ModelSerializer):
    class Meta:
        model = Refund
        fields = ['id', 'reason', 'amount', 'status', 'created_at', 'updated_at']


class OrderSerializer(serializers.ModelSerializer):
    customer_name = serializers.SerializerMethodField()
    customer_email = serializers.SerializerMethodField()
    items = OrderItemSerializer(many=True, read_only=True)
    timeline = OrderTimelineSerializer(many=True, read_only=True)
    item_count = serializers.SerializerMethodField()
    refund = RefundSerializer(read_only=True)

    class Meta:
        model = Order
        fields = [
            'id', 'order_id', 'customer', 'customer_name', 'customer_email',
            'status', 'total', 'shipping_address', 'notes',
            'items', 'item_count', 'timeline', 'refund',
            'created_at', 'updated_at',
        ]
        read_only_fields = ['id', 'order_id', 'created_at', 'updated_at']

    def get_customer_name(self, obj):
        return obj.customer.get_full_name() if obj.customer else 'Unknown'

    def get_customer_email(self, obj):
        return obj.customer.email if obj.customer else ''

    def get_item_count(self, obj):
        return obj.items.count()


class OrderCreateSerializer(serializers.ModelSerializer):
    items = OrderItemSerializer(many=True)

    class Meta:
        model = Order
        fields = ['customer', 'shipping_address', 'notes', 'items']

    def create(self, validated_data):
        items_data = validated_data.pop('items')
        order = Order.objects.create(**validated_data)
        for item_data in items_data:
            OrderItem.objects.create(order=order, **item_data)
        order.calculate_total()
        return order


class OrderUpdateStatusSerializer(serializers.Serializer):
    status = serializers.ChoiceField(choices=Order.STATUS_CHOICES)
    note = serializers.CharField(required=False, allow_blank=True)
