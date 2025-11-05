from django.shortcuts import render
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework import status
from django.views.decorators.csrf import csrf_exempt
from django.utils.decorators import method_decorator
from django.http import JsonResponse
import json
import logging
from .models import MpesaTransaction
from .serializers import InitiatePaymentSerializer, MpesaTransactionSerializer
from .mpesa_service import MpesaService
from orders.models import Order

logger = logging.getLogger(__name__)


class InitiatePaymentView(APIView):
    permission_classes = [IsAuthenticated]
    
    def post(self, request):
        """Initiate M-PESA STK Push payment"""
        serializer = InitiatePaymentSerializer(data=request.data)
        
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        
        data = serializer.validated_data
        
        try:
            order = Order.objects.get(id=data['order_id'], user=request.user)
        except Order.DoesNotExist:
            return Response({'error': 'Order not found'}, status=status.HTTP_404_NOT_FOUND)
        
        # Check if payment already exists
        if hasattr(order, 'mpesa_transaction') and order.mpesa_transaction.status == 'completed':
            return Response({'error': 'Order already paid'}, status=status.HTTP_400_BAD_REQUEST)
        
        # Initiate STK Push
        mpesa_service = MpesaService()
        result = mpesa_service.stk_push(
            phone_number=data['phone_number'],
            amount=order.total,
            account_reference=order.order_number,
            transaction_desc=f'Payment for order {order.order_number}'
        )
        
        if result['success']:
            response_data = result['data']
            
            # Create or update transaction
            transaction, created = MpesaTransaction.objects.update_or_create(
                order=order,
                defaults={
                    'user': request.user,
                    'phone_number': data['phone_number'],
                    'amount': order.total,
                    'merchant_request_id': response_data.get('MerchantRequestID'),
                    'checkout_request_id': response_data.get('CheckoutRequestID'),
                    'status': 'pending'
                }
            )
            
            return Response({
                'success': True,
                'message': 'Payment initiated. Please enter your M-PESA PIN.',
                'checkout_request_id': response_data.get('CheckoutRequestID')
            })
        else:
            return Response({
                'success': False,
                'error': result.get('error', 'Failed to initiate payment')
            }, status=status.HTTP_400_BAD_REQUEST)


@method_decorator(csrf_exempt, name='dispatch')
class MpesaCallbackView(APIView):
    permission_classes = []
    
    def post(self, request):
        """Handle M-PESA callback"""
        try:
            callback_data = json.loads(request.body)
            logger.info(f"M-PESA Callback received: {callback_data}")
            
            result = callback_data.get('Body', {}).get('stkCallback', {})
            merchant_request_id = result.get('MerchantRequestID')
            checkout_request_id = result.get('CheckoutRequestID')
            result_code = result.get('ResultCode')
            result_desc = result.get('ResultDesc')
            
            # Find transaction
            try:
                transaction = MpesaTransaction.objects.get(checkout_request_id=checkout_request_id)
            except MpesaTransaction.DoesNotExist:
                logger.error(f"Transaction not found: {checkout_request_id}")
                return JsonResponse({'ResultCode': 0, 'ResultDesc': 'Accepted'})
            
            # Update transaction
            transaction.result_code = str(result_code)
            transaction.result_desc = result_desc
            transaction.callback_data = callback_data
            
            if result_code == 0:  # Success
                callback_metadata = result.get('CallbackMetadata', {}).get('Item', [])
                
                for item in callback_metadata:
                    if item.get('Name') == 'MpesaReceiptNumber':
                        transaction.mpesa_receipt_number = item.get('Value')
                    elif item.get('Name') == 'TransactionDate':
                        transaction.transaction_date = item.get('Value')
                
                transaction.status = 'completed'
                transaction.order.status = 'processing'
                transaction.order.save()
            else:
                transaction.status = 'failed'
            
            transaction.save()
            
            return JsonResponse({'ResultCode': 0, 'ResultDesc': 'Accepted'})
            
        except Exception as e:
            logger.error(f"Callback error: {str(e)}")
            return JsonResponse({'ResultCode': 1, 'ResultDesc': str(e)})


class CheckPaymentStatusView(APIView):
    permission_classes = [IsAuthenticated]
    
    def get(self, request, order_id):
        """Check payment status for an order"""
        try:
            order = Order.objects.get(id=order_id, user=request.user)
            transaction = order.mpesa_transaction
            serializer = MpesaTransactionSerializer(transaction)
            return Response(serializer.data)
        except Order.DoesNotExist:
            return Response({'error': 'Order not found'}, status=status.HTTP_404_NOT_FOUND)
        except MpesaTransaction.DoesNotExist:
            return Response({'error': 'No payment transaction found'}, status=status.HTTP_404_NOT_FOUND)