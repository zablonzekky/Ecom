# from django.urls import path, include
# from .social_views import GoogleLogin, FacebookLogin, VerifySocialToken

# urlpatterns = [
#     # Authentication endpoints
#     path('api/auth/', include('dj_rest_auth.urls')),
#     path('api/auth/registration/', include('dj_rest_auth.registration.urls')),
    
#     # Social authentication
#     path('api/auth/google/', GoogleLogin.as_view(), name='google_login'),
#     path('api/auth/facebook/', FacebookLogin.as_view(), name='facebook_login'),
#     path('api/auth/verify-social-token/', VerifySocialToken.as_view(), name='verify_social_token'),
# ]