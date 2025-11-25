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
from orders.models import Order, OrderItem
from products.models import Product

logger = logging.getLogger(__name__)


class InitiatePaymentView(APIView):
    permission_classes = [IsAuthenticated]
    
    def post(self, request):
        """Initiate M-PESA STK Push payment for an existing order"""
        try:
            data = request.data
            
            # Validate required fields
            if not data.get('order_id') or not data.get('phone_number'):
                return Response({
                    'error': 'Missing required fields: order_id and phone_number'
                }, status=status.HTTP_400_BAD_REQUEST)
            
            # Get the existing order
            try:
                order = Order.objects.get(id=data['order_id'], user=request.user)
            except Order.DoesNotExist:
                return Response({
                    'error': 'Order not found'
                }, status=status.HTTP_404_NOT_FOUND)
            
            # Check if order already has a payment
            if hasattr(order, 'mpesa_transaction'):
                return Response({
                    'error': 'Payment already initiated for this order'
                }, status=status.HTTP_400_BAD_REQUEST)
            
            # Format phone number (ensure it starts with 254)
            phone_number = data['phone_number'].strip()
            if phone_number.startswith('0'):
                phone_number = '254' + phone_number[1:]
            elif phone_number.startswith('+'):
                phone_number = phone_number[1:]
            elif not phone_number.startswith('254'):
                phone_number = '254' + phone_number
            
            # Initiate STK Push
            mpesa_service = MpesaService()
            result = mpesa_service.stk_push(
                phone_number=phone_number,
                amount=int(order.total),  # M-PESA requires integer amount
                account_reference=order.order_number,
                transaction_desc=f'Payment for order {order.order_number}'
            )
            
            if result['success']:
                response_data = result['data']
                
                # Create transaction
                transaction = MpesaTransaction.objects.create(
                    order=order,
                    user=request.user,
                    phone_number=phone_number,
                    amount=order.total,
                    merchant_request_id=response_data.get('MerchantRequestID'),
                    checkout_request_id=response_data.get('CheckoutRequestID'),
                    status='pending'
                )
                
                return Response({
                    'success': True,
                    'message': 'Payment initiated. Please enter your M-PESA PIN.',
                    'order_id': order.id,
                    'checkout_request_id': response_data.get('CheckoutRequestID'),
                    'merchant_request_id': response_data.get('MerchantRequestID')
                }, status=status.HTTP_201_CREATED)
            else:
                return Response({
                    'success': False,
                    'error': result.get('error', 'Failed to initiate payment')
                }, status=status.HTTP_400_BAD_REQUEST)
                
        except Exception as e:
            logger.error(f"Payment initiation error: {str(e)}")
            return Response({
                'error': f'Payment initiation failed: {str(e)}'
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


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
                transaction.order.status = 'cancelled'
                transaction.order.save()
            
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
            
            try:
                transaction = order.mpesa_transaction
                return Response({
                    'status': transaction.status,
                    'order_id': order.id,
                    'order_number': order.order_number,
                    'amount': str(transaction.amount),
                    'mpesa_receipt_number': transaction.mpesa_receipt_number,
                    'result_desc': transaction.result_desc,
                    'transaction_date': transaction.transaction_date,
                    'created_at': transaction.created_at,
                    'updated_at': transaction.updated_at
                })
            except MpesaTransaction.DoesNotExist:
                return Response({
                    'status': 'no_transaction',
                    'error': 'No payment transaction found for this order'
                }, status=status.HTTP_404_NOT_FOUND)
                
        except Order.DoesNotExist:
            return Response({
                'error': 'Order not found'
            }, status=status.HTTP_404_NOT_FOUND)