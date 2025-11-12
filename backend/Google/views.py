from allauth.socialaccount.providers.google.views import GoogleOAuth2Adapter
from allauth.socialaccount.providers.facebook.views import FacebookOAuth2Adapter
from allauth.socialaccount.providers.oauth2.client import OAuth2Client
from dj_rest_auth.registration.views import SocialLoginView
from rest_framework import status
from rest_framework.response import Response
from rest_framework.views import APIView
import requests

class GoogleLogin(SocialLoginView):
    adapter_class = GoogleOAuth2Adapter
    client_class = OAuth2Client
    
    def post(self, request, *args, **kwargs):
        # For testing with Postman, we'll accept access_token directly
        response = super().post(request, *args, **kwargs)
        return response

class FacebookLogin(SocialLoginView):
    adapter_class = FacebookOAuth2Adapter
    client_class = OAuth2Client
    
    def post(self, request, *args, **kwargs):
        response = super().post(request, *args, **kwargs)
        return response

# Optional: Manual token verification view for testing
class VerifySocialToken(APIView):
    def post(self, request):
        provider = request.data.get('provider')
        access_token = request.data.get('access_token')
        
        if provider == 'google':
            # Verify Google token
            resp = requests.get(
                f'https://www.googleapis.com/oauth2/v3/tokeninfo?access_token={access_token}'
            )
            if resp.status_code == 200:
                return Response({'valid': True, 'data': resp.json()})
            else:
                return Response({'valid': False}, status=status.HTTP_400_BAD_REQUEST)
        
        elif provider == 'facebook':
            # Verify Facebook token
            resp = requests.get(
                f'https://graph.facebook.com/me?access_token={access_token}&fields=id,name,email'
            )
            if resp.status_code == 200:
                return Response({'valid': True, 'data': resp.json()})
            else:
                return Response({'valid': False}, status=status.HTTP_400_BAD_REQUEST)
        
        return Response({'error': 'Invalid provider'}, status=status.HTTP_400_BAD_REQUEST)