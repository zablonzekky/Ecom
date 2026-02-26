import json
import logging
from decimal import Decimal

from django.http import JsonResponse
from django.utils.decorators import method_decorator
from django.views.decorators.csrf import csrf_exempt
from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from orders.models import Order
from .models import MpesaTransaction, PaypalTransaction
from .mpesa_service import MpesaService
from .paypal_service import PaypalService

logger = logging.getLogger(__name__)


def api_error(message, code=status.HTTP_400_BAD_REQUEST, details=None):
    payload = {"success": False, "error": message}
    if details:
        payload["details"] = details
    return Response(payload, status=code)


class InitiatePaymentView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        """Initiate M-PESA STK Push payment for an existing order."""
        data = request.data
        order_id = data.get("order_id")
        phone_number = data.get("phone_number")

        if not order_id or not phone_number:
            return api_error("Missing required fields: order_id and phone_number")

        try:
            order = Order.objects.get(id=order_id, user=request.user)
        except Order.DoesNotExist:
            return api_error("Order not found", code=status.HTTP_404_NOT_FOUND)

        if hasattr(order, "mpesa_transaction"):
            return api_error("Payment already initiated for this order")

        phone_number = phone_number.strip()
        if phone_number.startswith("0"):
            phone_number = "254" + phone_number[1:]
        elif phone_number.startswith("+"):
            phone_number = phone_number[1:]
        elif not phone_number.startswith("254"):
            phone_number = "254" + phone_number

        try:
            result = MpesaService().stk_push(
                phone_number=phone_number,
                amount=int(order.total),
                account_reference=order.order_number,
                transaction_desc=f"Payment for order {order.order_number}",
            )
            if not result.get("success"):
                logger.warning("M-PESA initiation failed for order=%s: %s", order.id, result)
                return api_error(result.get("error", "Failed to initiate payment"))

            response_data = result["data"]
            MpesaTransaction.objects.create(
                order=order,
                user=request.user,
                phone_number=phone_number,
                amount=order.total,
                merchant_request_id=response_data.get("MerchantRequestID"),
                checkout_request_id=response_data.get("CheckoutRequestID"),
                status="pending",
            )
            return Response(
                {
                    "success": True,
                    "message": "M-PESA payment initiated. Enter your PIN on your phone.",
                    "order_id": order.id,
                    "checkout_request_id": response_data.get("CheckoutRequestID"),
                    "merchant_request_id": response_data.get("MerchantRequestID"),
                },
                status=status.HTTP_201_CREATED,
            )
        except Exception:
            logger.exception("Payment initiation error for order=%s", order_id)
            return api_error("Payment initiation failed. Please retry.", code=status.HTTP_500_INTERNAL_SERVER_ERROR)


class InitiatePaypalPaymentView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        order_id = request.data.get("order_id")
        currency = request.data.get("currency", "USD")
        if not order_id:
            return api_error("Missing required field: order_id")

        try:
            order = Order.objects.get(id=order_id, user=request.user)
        except Order.DoesNotExist:
            return api_error("Order not found", code=status.HTTP_404_NOT_FOUND)

        if hasattr(order, "paypal_transaction"):
            return api_error("PayPal payment already initiated for this order")

        try:
            paypal_response = PaypalService().create_order(Decimal(order.total), currency=currency)
            paypal_order_id = paypal_response.get("id")
            if not paypal_order_id:
                logger.error("Invalid PayPal create-order response: %s", paypal_response)
                return api_error("PayPal order creation failed", code=status.HTTP_502_BAD_GATEWAY)

            PaypalTransaction.objects.create(
                order=order,
                user=request.user,
                amount=order.total,
                status="pending",
                paypal_order_id=paypal_order_id,
                callback_data=paypal_response,
                result_desc="Awaiting capture",
            )

            approve_link = next((link.get("href") for link in paypal_response.get("links", []) if link.get("rel") == "approve"), "")
            return Response(
                {
                    "success": True,
                    "message": "PayPal order created. Redirect customer to approval URL.",
                    "paypal_order_id": paypal_order_id,
                    "approval_url": approve_link,
                },
                status=status.HTTP_201_CREATED,
            )
        except Exception:
            logger.exception("PayPal order initiation failed for order=%s", order_id)
            return api_error("Unable to start PayPal checkout", code=status.HTTP_500_INTERNAL_SERVER_ERROR)


class CapturePaypalPaymentView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        paypal_order_id = request.data.get("paypal_order_id")
        if not paypal_order_id:
            return api_error("Missing required field: paypal_order_id")

        try:
            txn = PaypalTransaction.objects.select_related("order").get(paypal_order_id=paypal_order_id, user=request.user)
        except PaypalTransaction.DoesNotExist:
            return api_error("PayPal transaction not found", code=status.HTTP_404_NOT_FOUND)

        try:
            capture_data = PaypalService().capture_order(paypal_order_id)
            txn.callback_data = capture_data
            if capture_data.get("status") == "COMPLETED":
                captures = capture_data.get("purchase_units", [{}])[0].get("payments", {}).get("captures", [{}])
                txn.paypal_capture_id = captures[0].get("id", "")
                txn.status = "completed"
                txn.result_desc = "PayPal payment captured"
                txn.order.status = "processing"
                txn.order.save(update_fields=["status", "updated_at"])
            else:
                txn.status = "failed"
                txn.result_desc = capture_data.get("status", "Capture failed")
            txn.save()

            return Response({"success": txn.status == "completed", "status": txn.status, "message": txn.result_desc})
        except Exception:
            logger.exception("PayPal capture failed for paypal_order_id=%s", paypal_order_id)
            return api_error("PayPal capture failed", code=status.HTTP_500_INTERNAL_SERVER_ERROR)


@method_decorator(csrf_exempt, name="dispatch")
class MpesaCallbackView(APIView):
    permission_classes = []

    def post(self, request):
        try:
            callback_data = json.loads(request.body)
            result = callback_data.get("Body", {}).get("stkCallback", {})
            checkout_request_id = result.get("CheckoutRequestID")
            result_code = result.get("ResultCode")
            result_desc = result.get("ResultDesc")

            try:
                transaction = MpesaTransaction.objects.get(checkout_request_id=checkout_request_id)
            except MpesaTransaction.DoesNotExist:
                logger.error("M-PESA callback transaction not found: %s", checkout_request_id)
                return JsonResponse({"ResultCode": 0, "ResultDesc": "Accepted"})

            transaction.result_code = str(result_code)
            transaction.result_desc = result_desc
            transaction.callback_data = callback_data

            if result_code == 0:
                callback_metadata = result.get("CallbackMetadata", {}).get("Item", [])
                for item in callback_metadata:
                    if item.get("Name") == "MpesaReceiptNumber":
                        transaction.mpesa_receipt_number = item.get("Value")
                transaction.status = "completed"
                transaction.order.status = "processing"
            else:
                transaction.status = "failed"
                transaction.order.status = "cancelled"

            transaction.order.save(update_fields=["status", "updated_at"])
            transaction.save()
            return JsonResponse({"ResultCode": 0, "ResultDesc": "Accepted"})
        except Exception:
            logger.exception("M-PESA callback error")
            return JsonResponse({"ResultCode": 1, "ResultDesc": "Callback processing failed"})


class CheckPaymentStatusView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, order_id):
        try:
            order = Order.objects.get(id=order_id, user=request.user)
        except Order.DoesNotExist:
            return api_error("Order not found", code=status.HTTP_404_NOT_FOUND)

        if hasattr(order, "mpesa_transaction"):
            txn = order.mpesa_transaction
            return Response({"provider": "mpesa", "status": txn.status, "order_id": order.id, "order_number": order.order_number, "amount": str(txn.amount), "result_desc": txn.result_desc})

        if hasattr(order, "paypal_transaction"):
            txn = order.paypal_transaction
            return Response({"provider": "paypal", "status": txn.status, "order_id": order.id, "order_number": order.order_number, "amount": str(txn.amount), "result_desc": txn.result_desc})

        return api_error("No payment transaction found for this order", code=status.HTTP_404_NOT_FOUND)
