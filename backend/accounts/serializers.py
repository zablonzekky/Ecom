# payments/serializers.py
from rest_framework import serializers
from .models import MpesaTransaction


class MpesaTransactionSerializer(serializers.ModelSerializer):
    order_number = serializers.CharField(source='order.order_number', read_only=True)
    
    class Meta:
        model = MpesaTransaction
        fields = [
            'id', 'order', 'order_number', 'phone_number', 'amount',
            'checkout_request_id', 'mpesa_receipt_number',
            'status', 'result_desc', 'created_at'
        ]
        read_only_fields = ['id', 'created_at']


class InitiatePaymentSerializer(serializers.Serializer):
    order_id = serializers.IntegerField()
    phone_number = serializers.CharField(max_length=20)
    
    def validate_phone_number(self, value):
        # Remove any spaces or special characters
        phone = ''.join(filter(str.isdigit, value))
        
        # Convert to international format (254XXXXXXXXX)
        if phone.startswith('0'):
            phone = '254' + phone[1:]
        elif phone.startswith('+254'):
            phone = phone[1:]
        elif not phone.startswith('254'):
            phone = '254' + phone
        
        if len(phone) != 12:
            raise serializers.ValidationError("Invalid phone number format")
        
        return phone