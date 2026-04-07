from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import NotificationViewSet, ActivityLogViewSet

router = DefaultRouter()
router.register(r'activity-logs', ActivityLogViewSet, basename='activity-logs')

urlpatterns = [
    # Notification list
    path('', NotificationViewSet.as_view({'get': 'list', 'post': 'create'}), name='notification-list'),

    # Custom actions (must be BEFORE <pk> to avoid conflict)
    path('mark-all-read/', NotificationViewSet.as_view({'post': 'mark_all_read'}), name='notification-mark-all-read'),

    # Notification detail
    path('<int:pk>/', NotificationViewSet.as_view({'get': 'retrieve', 'patch': 'partial_update', 'delete': 'destroy'}), name='notification-detail'),
    path('<int:pk>/mark-read/', NotificationViewSet.as_view({'post': 'mark_read'}), name='notification-mark-read'),

    # Activity logs router
    path('', include(router.urls)),
]
