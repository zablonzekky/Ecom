from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import NotificationViewSet, ActivityLogViewSet

router = DefaultRouter()
router.register(r'activity-logs', ActivityLogViewSet, basename='activity-logs')
router.register(r'', NotificationViewSet, basename='notifications')

urlpatterns = [path('', include(router.urls))]
