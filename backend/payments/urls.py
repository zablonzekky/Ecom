from django.urls import path

from .views import (
    CapturePaypalPaymentView,
    CheckPaymentStatusView,
    InitiatePaymentView,
    InitiatePaypalPaymentView,
    MpesaCallbackView,
)

urlpatterns = [
    path('initiate/', InitiatePaymentView.as_view(), name='initiate_payment'),
    path('paypal/initiate/', InitiatePaypalPaymentView.as_view(), name='initiate_paypal_payment'),
    path('paypal/capture/', CapturePaypalPaymentView.as_view(), name='capture_paypal_payment'),
    path('callback/', MpesaCallbackView.as_view(), name='mpesa_callback'),
    path('status/<int:order_id>/', CheckPaymentStatusView.as_view(), name='payment_status'),
]
