# payments/urls.py
from django.urls import path
from .views import InitiatePaymentView, MpesaCallbackView, CheckPaymentStatusView

urlpatterns = [
    path('initiate/', InitiatePaymentView.as_view(), name='initiate_payment'),
    path('callback/', MpesaCallbackView.as_view(), name='mpesa_callback'),
    path('status/<int:order_id>/', CheckPaymentStatusView.as_view(), name='payment_status'),
]