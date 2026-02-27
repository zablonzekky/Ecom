import json
import logging
from decimal import Decimal
from django.http import HttpResponse, JsonResponse
from django.utils.crypto import get_random_string
from django.utils.decorators import method_decorator
from django.views.decorators.csrf import csrf_exempt
from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from orders.models import Order
from .models import MpesaTransaction, PaypalTransaction, PaymentReceipt
from .mpesa_service import MpesaService
from .paypal_service import PaypalService

logger = logging.getLogger(__name__)


def api_error(message, code=status.HTTP_400_BAD_REQUEST):
    return Response({"success": False, "error": message}, status=code)


def ensure_receipt(order, provider):
    return PaymentReceipt.objects.get_or_create(
        order=order,
        defaults={
            "user": order.user,
            "provider": provider,
            "receipt_number": f"RCPT-{get_random_string(12).upper()}",
            "amount": order.total,
        },
    )[0]


class InitiatePaymentView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        order_id = request.data.get("order_id")
        phone_number = request.data.get("phone_number")
        if not order_id or not phone_number:
            return api_error("Missing required fields: order_id and phone_number")

        try:
            order = Order.objects.get(id=order_id, user=request.user)
        except Order.DoesNotExist:
            return api_error("Order not found", code=status.HTTP_404_NOT_FOUND)

        if hasattr(order, "mpesa_transaction"):
            return api_error("Payment already initiated for this order")

        try:
            result = MpesaService().stk_push(
                phone_number=phone_number,
                amount=int(order.total),
                account_reference=order.order_number,
                transaction_desc=f"Payment for order {order.order_number}",
            )
            if not result.get("success"):
                return api_error(result.get("error", "Failed to initiate payment"))
            data = result["data"]
            MpesaTransaction.objects.create(
                order=order,
                user=request.user,
                phone_number=phone_number,
                amount=order.total,
                merchant_request_id=data.get("MerchantRequestID"),
                checkout_request_id=data.get("CheckoutRequestID"),
                status="pending",
            )
            return Response({"success": True, "message": "M-PESA request sent.", "checkout_request_id": data.get("CheckoutRequestID")}, status=201)
        except Exception:
            logger.exception("Payment initiation error")
            return api_error("Payment initiation failed.", code=500)


class InitiatePaypalPaymentView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        order_id = request.data.get("order_id")
        if not order_id:
            return api_error("Missing required field: order_id")
        try:
            order = Order.objects.get(id=order_id, user=request.user)
        except Order.DoesNotExist:
            return api_error("Order not found", code=404)

        if hasattr(order, "paypal_transaction"):
            return api_error("PayPal payment already initiated for this order")

        try:
            paypal_data = PaypalService().create_order(Decimal(order.total), currency=request.data.get("currency", "USD"))
            order_id_pp = paypal_data.get("id")
            PaypalTransaction.objects.create(
                order=order,
                user=request.user,
                amount=order.total,
                status="pending",
                paypal_order_id=order_id_pp,
                callback_data=paypal_data,
            )
            approval_url = next((link.get("href") for link in paypal_data.get("links", []) if link.get("rel") == "approve"), "")
            return Response({"success": True, "paypal_order_id": order_id_pp, "approval_url": approval_url}, status=201)
        except Exception:
            logger.exception("PayPal initiate failed")
            return api_error("Unable to start PayPal checkout", code=500)


class CapturePaypalPaymentView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        paypal_order_id = request.data.get("paypal_order_id")
        if not paypal_order_id:
            return api_error("Missing required field: paypal_order_id")
        try:
            txn = PaypalTransaction.objects.select_related("order").get(paypal_order_id=paypal_order_id, user=request.user)
        except PaypalTransaction.DoesNotExist:
            return api_error("PayPal transaction not found", 404)

        try:
            capture_data = PaypalService().capture_order(paypal_order_id)
            txn.callback_data = capture_data
            if capture_data.get("status") == "COMPLETED":
                txn.status = "completed"
                txn.order.status = "processing"
                txn.order.save(update_fields=["status", "updated_at"])
                receipt = ensure_receipt(txn.order, "paypal")
                txn.save()
                return Response({"success": True, "status": "completed", "receipt_number": receipt.receipt_number})
            txn.status = "failed"
            txn.save(update_fields=["status", "updated_at"])
            return api_error("Payment not completed", 400)
        except Exception:
            logger.exception("PayPal capture failed")
            return api_error("PayPal capture failed", 500)


@method_decorator(csrf_exempt, name="dispatch")
class MpesaCallbackView(APIView):
    permission_classes = []

    def post(self, request):
        try:
            callback_data = json.loads(request.body)
            result = callback_data.get("Body", {}).get("stkCallback", {})
            checkout_request_id = result.get("CheckoutRequestID")
            result_code = result.get("ResultCode")
            txn = MpesaTransaction.objects.get(checkout_request_id=checkout_request_id)
            txn.result_code = str(result_code)
            txn.result_desc = result.get("ResultDesc")
            txn.callback_data = callback_data
            if result_code == 0:
                txn.status = "completed"
                txn.order.status = "processing"
                txn.order.save(update_fields=["status", "updated_at"])
                ensure_receipt(txn.order, "mpesa")
            else:
                txn.status = "failed"
                txn.order.status = "cancelled"
                txn.order.save(update_fields=["status", "updated_at"])
            txn.save()
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
            return api_error("Order not found", 404)

        if hasattr(order, "mpesa_transaction"):
            txn = order.mpesa_transaction
            return Response({"provider": "mpesa", "status": txn.status, "result_desc": txn.result_desc, "has_receipt": hasattr(order, "payment_receipt")})
        if hasattr(order, "paypal_transaction"):
            txn = order.paypal_transaction
            return Response({"provider": "paypal", "status": txn.status, "result_desc": txn.result_desc, "has_receipt": hasattr(order, "payment_receipt")})
        return api_error("No payment transaction found for this order", 404)


class DownloadReceiptView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, order_id):
        try:
            receipt = PaymentReceipt.objects.select_related("order").get(order_id=order_id, user=request.user)
        except PaymentReceipt.DoesNotExist:
            return api_error("Receipt not found", 404)

        content = (
            f"Receipt: {receipt.receipt_number}\n"
            f"Order: {receipt.order.order_number}\n"
            f"Provider: {receipt.provider}\n"
            f"Amount: {receipt.amount}\n"
            f"Date: {receipt.created_at}\n"
        )
        response = HttpResponse(content, content_type="text/plain")
        response["Content-Disposition"] = f'attachment; filename="{receipt.receipt_number}.txt"'
        return response
