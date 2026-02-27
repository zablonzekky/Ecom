from allauth.socialaccount.providers.facebook.views import FacebookOAuth2Adapter
from allauth.socialaccount.providers.google.views import GoogleOAuth2Adapter
from allauth.socialaccount.providers.oauth2.client import OAuth2Client
from dj_rest_auth.registration.views import SocialLoginView
from rest_framework import status
from rest_framework.response import Response
from rest_framework.views import APIView
import requests


class GoogleLogin(SocialLoginView):
    adapter_class = GoogleOAuth2Adapter
    client_class = OAuth2Client


class FacebookLogin(SocialLoginView):
    adapter_class = FacebookOAuth2Adapter
    client_class = OAuth2Client


class LinkedInLogin(APIView):
    """Placeholder endpoint for LinkedIn OAuth wiring in frontend."""

    def get(self, request):
        return Response(
            {
                "success": False,
                "error": "LinkedIn login is not configured on the server yet.",
            },
            status=status.HTTP_501_NOT_IMPLEMENTED,
        )


class VerifySocialToken(APIView):
    def post(self, request):
        provider = request.data.get('provider')
        access_token = request.data.get('access_token')

        if provider == 'google':
            resp = requests.get(
                f'https://www.googleapis.com/oauth2/v3/tokeninfo?access_token={access_token}', timeout=20
            )
            if resp.status_code == 200:
                return Response({'valid': True, 'data': resp.json()})
            return Response({'valid': False}, status=status.HTTP_400_BAD_REQUEST)

        if provider == 'facebook':
            resp = requests.get(
                f'https://graph.facebook.com/me?access_token={access_token}&fields=id,name,email', timeout=20
            )
            if resp.status_code == 200:
                return Response({'valid': True, 'data': resp.json()})
            return Response({'valid': False}, status=status.HTTP_400_BAD_REQUEST)

        if provider == 'linkedin':
            return Response({'valid': False, 'error': 'LinkedIn not configured'}, status=status.HTTP_400_BAD_REQUEST)

        return Response({'error': 'Invalid provider'}, status=status.HTTP_400_BAD_REQUEST)
