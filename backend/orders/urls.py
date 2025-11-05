# orders/urls.py
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import AddressViewSet, OrderViewSet

router = DefaultRouter()
router.register('addresses', AddressViewSet, basename='address')
router.register('', OrderViewSet, basename='order')

urlpatterns = [
    path('', include(router.urls)),
]