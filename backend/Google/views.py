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

class VerifySocialToken(APIView):
    def post(self, request):
        provider = request.data.get("provider")
        access_token = request.data.get("access_token")

        if not provider or not access_token:
            return Response(
                {"error": "provider and access_token are required"},
                status=status.HTTP_400_BAD_REQUEST,
            )

        try:
            # ✅ GOOGLE
            if provider == "google":
                resp = requests.get(
                    "https://www.googleapis.com/oauth2/v3/tokeninfo",
                    params={"access_token": access_token},
                    timeout=10,
                )

                if resp.status_code == 200:
                    return Response({"valid": True, "data": resp.json()})

                return Response({"valid": False}, status=status.HTTP_400_BAD_REQUEST)

            # ✅ FACEBOOK
            if provider == "facebook":
                resp = requests.get(
                    "https://graph.facebook.com/me",
                    params={
                        "access_token": access_token,
                        "fields": "id,name,email",
                    },
                    timeout=10,
                )

                if resp.status_code == 200:
                    return Response({"valid": True, "data": resp.json()})

                return Response({"valid": False}, status=status.HTTP_400_BAD_REQUEST)

            return Response(
                {"error": "Invalid provider"},
                status=status.HTTP_400_BAD_REQUEST,
            )

        except requests.RequestException:
            return Response(
                {"error": "Failed to verify token"},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR,
            )