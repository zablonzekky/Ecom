from django.urls import path, include
from .views import RegisterView, UserProfileView
from Google.views import GoogleLogin, FacebookLogin, VerifySocialToken  # Import from Google app

urlpatterns = [
    # ✅ Normal registration and profile endpoints
    path('register/', RegisterView.as_view(), name='register'),
    path('profile/', UserProfileView.as_view(), name='profile'),

    # ✅ dj-rest-auth endpoints (remove 'api/auth/' prefix since we're already under api/accounts/)
    path('auth/', include('dj_rest_auth.urls')),  # Now: /api/accounts/auth/login/
    path('auth/registration/', include('dj_rest_auth.registration.urls')),  # Now: /api/accounts/auth/registration/

    # ✅ Social login endpoints
    path('auth/google/', GoogleLogin.as_view(), name='google_login'),  # Now: /api/accounts/auth/google/
    path('auth/facebook/', FacebookLogin.as_view(), name='facebook_login'),  # Now: /api/accounts/auth/facebook/
    path('auth/verify-social-token/', VerifySocialToken.as_view(), name='verify_social_token'),  # Now: /api/accounts/auth/verify-social-token/
]