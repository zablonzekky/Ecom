import logging
import requests
from django.conf import settings

logger = logging.getLogger(__name__)


class PaypalService:
    def __init__(self):
        self.client_id = getattr(settings, "PAYPAL_CLIENT_ID", None)
        self.client_secret = getattr(settings, "PAYPAL_CLIENT_SECRET", None)
        self.base_url = (
            "https://api-m.paypal.com"
            if getattr(settings, "PAYPAL_ENVIRONMENT", "sandbox") == "live"
            else "https://api-m.sandbox.paypal.com"
        )

    def _get_access_token(self):
        if not self.client_id or not self.client_secret:
            raise ValueError("PayPal credentials are not configured")

        response = requests.post(
            f"{self.base_url}/v1/oauth2/token",
            auth=(self.client_id, self.client_secret),
            data={"grant_type": "client_credentials"},
            timeout=30,
        )
        response.raise_for_status()
        token = response.json().get("access_token")
        if not token:
            raise ValueError("PayPal access token was not returned")
        return token

    def create_order(self, amount, currency="USD"):
        token = self._get_access_token()
        payload = {
            "intent": "CAPTURE",
            "purchase_units": [{"amount": {"currency_code": currency, "value": f"{amount:.2f}"}}],
        }
        response = requests.post(
            f"{self.base_url}/v2/checkout/orders",
            headers={"Authorization": f"Bearer {token}", "Content-Type": "application/json"},
            json=payload,
            timeout=30,
        )
        response.raise_for_status()
        return response.json()

    def capture_order(self, paypal_order_id):
        token = self._get_access_token()
        response = requests.post(
            f"{self.base_url}/v2/checkout/orders/{paypal_order_id}/capture",
            headers={"Authorization": f"Bearer {token}", "Content-Type": "application/json"},
            timeout=30,
        )
        response.raise_for_status()
        return response.json()
