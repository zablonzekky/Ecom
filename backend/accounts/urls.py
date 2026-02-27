from django.urls import include, path
from rest_framework.routers import DefaultRouter

from Google.views import FacebookLogin, GoogleLogin, LinkedInLogin, VerifySocialToken
from .admin_api import AdminOrderViewSet, AdminProductViewSet, AdminUserViewSet
from .views import (
    AdminDashboardView,
    ContactMessageView,
    NewsletterSubscribeView,
    RegisterView,
    UserProfileView,
)

router = DefaultRouter()
router.register("admin/products", AdminProductViewSet, basename="admin-products")
router.register("admin/orders", AdminOrderViewSet, basename="admin-orders")
router.register("admin/users", AdminUserViewSet, basename="admin-users")

urlpatterns = [
    path('register/', RegisterView.as_view(), name='register'),
    path('profile/', UserProfileView.as_view(), name='profile'),
    path('newsletter/subscribe/', NewsletterSubscribeView.as_view(), name='newsletter_subscribe'),
    path('contact/', ContactMessageView.as_view(), name='contact_message'),
    path('admin/dashboard/', AdminDashboardView.as_view(), name='admin_dashboard'),
    path('', include(router.urls)),

    path('auth/', include('dj_rest_auth.urls')),
    path('auth/registration/', include('dj_rest_auth.registration.urls')),
    path('auth/google/', GoogleLogin.as_view(), name='google_login'),
    path('auth/facebook/', FacebookLogin.as_view(), name='facebook_login'),
    path('auth/linkedin/', LinkedInLogin.as_view(), name='linkedin_login'),
    path('auth/verify-social-token/', VerifySocialToken.as_view(), name='verify_social_token'),
]
