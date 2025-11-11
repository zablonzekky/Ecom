# payments/mpesa_service.py
import requests
import base64
from datetime import datetime
from django.conf import settings
from django.utils import timezone
import logging

logger = logging.getLogger(__name__)


class MpesaService:
    def __init__(self):
        # Validate that all required settings are present
        required_settings = [
            'MPESA_CONSUMER_KEY', 'MPESA_CONSUMER_SECRET', 
            'MPESA_SHORTCODE', 'MPESA_PASSKEY', 'MPESA_CALLBACK_URL'
        ]
        
        for setting in required_settings:
            if not hasattr(settings, setting) or not getattr(settings, setting):
                raise ValueError(f"Missing required setting: {setting}")
        
        self.consumer_key = settings.MPESA_CONSUMER_KEY
        self.consumer_secret = settings.MPESA_CONSUMER_SECRET
        self.shortcode = settings.MPESA_SHORTCODE
        self.passkey = settings.MPESA_PASSKEY
        self.callback_url = settings.MPESA_CALLBACK_URL
        
        if getattr(settings, 'MPESA_ENVIRONMENT', 'sandbox') == 'sandbox':
            self.base_url = 'https://sandbox.safaricom.co.ke'
        else:
            self.base_url = 'https://api.safaricom.co.ke'
    
    def get_access_token(self):
        """Get OAuth access token from M-PESA"""
        try:
            url = f'{self.base_url}/oauth/v1/generate?grant_type=client_credentials'
            auth = (self.consumer_key, self.consumer_secret)
            
            logger.info(f"Requesting access token from: {url}")
            
            response = requests.get(url, auth=auth, timeout=30)
            response.raise_for_status()
            
            data = response.json()
            access_token = data.get('access_token')
            
            if not access_token:
                logger.error("No access token in response")
                raise Exception("Failed to get access token")
                
            logger.info("Successfully obtained access token")
            return access_token
            
        except requests.exceptions.RequestException as e:
            logger.error(f"Error getting access token: {str(e)}")
            if hasattr(e, 'response') and e.response is not None:
                logger.error(f"Response status: {e.response.status_code}")
                logger.error(f"Response content: {e.response.text}")
            raise
    
    def generate_password(self, timestamp):
        """Generate password for STK push"""
        data_to_encode = f"{self.shortcode}{self.passkey}{timestamp}"
        encoded = base64.b64encode(data_to_encode.encode())
        return encoded.decode('utf-8')
    
    def stk_push(self, phone_number, amount, account_reference, transaction_desc):
        """
        Initiate STK Push request
        
        Args:
            phone_number: Customer phone number (format: 254XXXXXXXXX)
            amount: Transaction amount
            account_reference: Order number or reference
            transaction_desc: Description of the transaction
        
        Returns:
            dict: Response from M-PESA API
        """
        try:
            # Validate phone number format
            if not phone_number.startswith('254'):
                if phone_number.startswith('0'):
                    phone_number = '254' + phone_number[1:]
                elif phone_number.startswith('+254'):
                    phone_number = phone_number[1:]
                else:
                    return {
                        'success': False,
                        'error': 'Invalid phone number format. Use 254XXXXXXXXX'
                    }
            
            access_token = self.get_access_token()
            url = f'{self.base_url}/mpesa/stkpush/v1/processrequest'
            
            timestamp = datetime.now().strftime('%Y%m%d%H%M%S')
            password = self.generate_password(timestamp)
            
            headers = {
                'Authorization': f'Bearer {access_token}',
                'Content-Type': 'application/json'
            }
            
            payload = {
                'BusinessShortCode': self.shortcode,
                'Password': password,
                'Timestamp': timestamp,
                'TransactionType': 'CustomerPayBillOnline',
                'Amount': int(amount),
                'PartyA': phone_number,
                'PartyB': self.shortcode,
                'PhoneNumber': phone_number,
                'CallBackURL': self.callback_url,
                'AccountReference': account_reference,
                'TransactionDesc': transaction_desc
            }
            
            logger.info(f"Sending STK push to: {url}")
            logger.info(f"Payload: {payload}")
            
            response = requests.post(url, json=payload, headers=headers, timeout=30)
            response.raise_for_status()
            
            response_data = response.json()
            logger.info(f"STK Push response: {response_data}")
            
            return {
                'success': True,
                'data': response_data
            }
            
        except requests.exceptions.RequestException as e:
            logger.error(f"STK Push error: {str(e)}")
            error_detail = str(e)
            
            if hasattr(e, 'response') and e.response is not None:
                error_detail = f"Status: {e.response.status_code}, Response: {e.response.text}"
                logger.error(f"Full error details: {error_detail}")
            
            return {
                'success': False,
                'error': error_detail
            }
        except Exception as e:
            logger.error(f"Unexpected error in STK push: {str(e)}")
            return {
                'success': False,
                'error': str(e)
            }
    
    def query_transaction(self, checkout_request_id):
        """Query the status of an STK Push transaction"""
        try:
            access_token = self.get_access_token()
            url = f'{self.base_url}/mpesa/stkpushquery/v1/query'
            
            timestamp = datetime.now().strftime('%Y%m%d%H%M%S')
            password = self.generate_password(timestamp)
            
            headers = {
                'Authorization': f'Bearer {access_token}',
                'Content-Type': 'application/json'
            }
            
            payload = {
                'BusinessShortCode': self.shortcode,
                'Password': password,
                'Timestamp': timestamp,
                'CheckoutRequestID': checkout_request_id
            }
            
            response = requests.post(url, json=payload, headers=headers, timeout=30)
            response.raise_for_status()
            
            return {
                'success': True,
                'data': response.json()
            }
            
        except requests.exceptions.RequestException as e:
            logger.error(f"Query transaction error: {str(e)}")
            return {
                'success': False,
                'error': str(e)
            }