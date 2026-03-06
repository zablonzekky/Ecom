from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import OrderViewSet, RefundViewSet

router = DefaultRouter()
router.register(r'refunds', RefundViewSet, basename='refunds')
router.register(r'', OrderViewSet, basename='orders')

urlpatterns = [
    path('', include(router.urls)),
]
