from rest_framework import viewsets, filters, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from admin_app.permissions import IsAdminUser
from .models import Notification, ActivityLog
from .serializers import NotificationSerializer, ActivityLogSerializer


class NotificationViewSet(viewsets.ModelViewSet):
    serializer_class = NotificationSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        """
        Filter notifications for the logged-in user.
        Short-circuits during schema generation to avoid AnonymousUser errors.
        """
        if getattr(self, 'swagger_fake_view', False):
            return Notification.objects.none()

        return Notification.objects.filter(user=self.request.user)

    @action(detail=False, methods=['post'])
    def mark_all_read(self, request):
        """Marks all notifications for the current user as read."""
        updated_count = self.get_queryset().filter(is_read=False).update(is_read=True)
        return Response({
            'status': 'all marked as read',
            'count': updated_count
        }, status=status.HTTP_200_OK)

    @action(detail=True, methods=['post'])
    def mark_read(self, request, pk=None):
        """Marks a specific notification as read."""
        notification = self.get_object()
        if not notification.is_read:
            notification.is_read = True
            notification.save(update_fields=['is_read'])

        serializer = self.get_serializer(notification)
        return Response(serializer.data, status=status.HTTP_200_OK)


class ActivityLogViewSet(viewsets.ReadOnlyModelViewSet):
    """
    Admin-only view to track system activities.
    Uses select_related for 'user' to avoid N+1 query issues.
    """
    serializer_class = ActivityLogSerializer
    permission_classes = [IsAdminUser]
    filter_backends = [filters.SearchFilter]
    search_fields = ['user__email', 'description', 'action']

    def get_queryset(self):
        """
        Returns all activity logs.
        Short-circuits during schema generation to avoid AnonymousUser errors.
        """
        if getattr(self, 'swagger_fake_view', False):
            return ActivityLog.objects.none()

        return ActivityLog.objects.select_related('user').all()