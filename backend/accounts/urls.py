from django.urls import include, path
from .views import AdminReplyContactMessageView
from rest_framework.routers import DefaultRouter
from django.views.generic import TemplateView
from .views import (
    social_auth_token,
    AdminDashboardView,
    AdminNewsletterView,
    AdminContactMessageView,
    ContactMessageView,
    NewsletterSubscribeView,
    RegisterView,
    UserProfileView,
)

from .admin_api import (
    AdminOrderViewSet,
    AdminProductViewSet,
    AdminUserViewSet,
)

from Google.views import (
    FacebookLogin,
    GoogleLogin,
    VerifySocialToken,
)

router = DefaultRouter()
router.register(r'admin/products', AdminProductViewSet, basename='admin-products')
router.register(r'admin/orders', AdminOrderViewSet, basename='admin-orders')
router.register(r'admin/users', AdminUserViewSet, basename='admin-users')

urlpatterns = [
    path('register/', RegisterView.as_view(), name='register'),
    path('profile/', UserProfileView.as_view(), name='profile'),
    path(
        'auth/password/reset/confirm/<uidb64>/<token>/',
        TemplateView.as_view(),
        name='password_reset_confirm'
    ),
    path('newsletter/subscribe/', NewsletterSubscribeView.as_view(), name='newsletter_subscribe'),
    path('contact/', ContactMessageView.as_view(), name='contact_message'),
    path('admin/contact/<int:pk>/reply/', AdminReplyContactMessageView.as_view(), name='admin_contact_reply'),
    path('admin/dashboard/', AdminDashboardView.as_view(), name='admin_dashboard'),
    path('admin/newsletter/', AdminNewsletterView.as_view(), name='admin_newsletter'),
    path('admin/contact/', AdminContactMessageView.as_view(), name='admin_contact'),
    path('', include(router.urls)),
    path('auth/', include('dj_rest_auth.urls')),
    path('auth/registration/', include('dj_rest_auth.registration.urls')),
    path('auth/google/', GoogleLogin.as_view(), name='drf_google_login'),
    path('auth/facebook/', FacebookLogin.as_view(), name='drf_facebook_login'),
    path('auth/verify-social-token/', VerifySocialToken.as_view(), name='verify_social_token'),
    path('auth/social/token/', social_auth_token, name='social_auth_token'),
]