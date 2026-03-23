from rest_framework import serializers
from orders.models import Order, OrderItem, OrderTimeline, Refund


class OrderItemSerializer(serializers.ModelSerializer):
    subtotal = serializers.DecimalField(max_digits=10, decimal_places=2, read_only=True)
    product_name = serializers.CharField(source='product.name', read_only=True)

    class Meta:
        model = OrderItem
        fields = ['id', 'product', 'product_name', 'quantity', 'price', 'subtotal']


class OrderTimelineSerializer(serializers.ModelSerializer):
    created_by_name = serializers.CharField(source='created_by.get_full_name', read_only=True)

    class Meta:
        model = OrderTimeline
        fields = ['id', 'status', 'note', 'created_at', 'created_by', 'created_by_name']


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
            'id', 'order_number', 'user', 'customer_name', 'customer_email',
            'status', 'subtotal', 'shipping_cost', 'total', 'address', 'notes',
            'items', 'item_count', 'timeline', 'refund',
            'created_at', 'updated_at',
        ]
        read_only_fields = ['id', 'order_number', 'created_at', 'updated_at']

    def get_customer_name(self, obj):
        return obj.user.get_full_name() if obj.user else 'Unknown'

    def get_customer_email(self, obj):
        return obj.user.email if obj.user else ''

    def get_item_count(self, obj):
        return obj.items.count()


class OrderCreateSerializer(serializers.ModelSerializer):
    items = OrderItemSerializer(many=True)

    class Meta:
        model = Order
        fields = ['user', 'address', 'notes', 'items']

    def create(self, validated_data):
        items_data = validated_data.pop('items')
        order = Order.objects.create(**validated_data)
        subtotal = 0
        for item_data in items_data:
            item = OrderItem.objects.create(order=order, **item_data)
            subtotal += item.subtotal
        order.subtotal = subtotal
        order.total = subtotal + order.shipping_cost
        order.save(update_fields=['subtotal', 'total'])
        return order


class OrderUpdateStatusSerializer(serializers.Serializer):
    status = serializers.ChoiceField(choices=Order.STATUS_CHOICES)
    note = serializers.CharField(required=False, allow_blank=True)