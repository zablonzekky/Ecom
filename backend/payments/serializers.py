from rest_framework import serializers
from .models import MpesaTransaction


class InitiatePaymentSerializer(serializers.Serializer):
    items = serializers.ListField(
        child=serializers.DictField(),
        required=True
    )
    shipping_address = serializers.DictField(required=True)
    phone_number = serializers.CharField(max_length=20, required=True)
    amount = serializers.DecimalField(max_digits=10, decimal_places=2, required=True)


class MpesaTransactionSerializer(serializers.ModelSerializer):
    order_number = serializers.CharField(source='order.order_number', read_only=True)
    
    class Meta:
        model = MpesaTransaction
        fields = [
            'id', 'order', 'order_number', 'user', 'phone_number', 
            'amount', 'merchant_request_id', 'checkout_request_id',
            'mpesa_receipt_number', 'transaction_date', 'status',
            'result_code', 'result_desc', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']