from rest_framework import serializers
from .models import Discount


class DiscountSerializer(serializers.ModelSerializer):
    is_valid = serializers.BooleanField(read_only=True)

    class Meta:
        model = Discount
        fields = [
            'id', 'code', 'description', 'discount_type', 'value',
            'min_order_amount', 'max_uses', 'uses_count', 'status',
            'valid_from', 'valid_until', 'is_valid', 'created_at',
        ]
        read_only_fields = ['id', 'uses_count', 'created_at', 'is_valid']
