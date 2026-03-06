from rest_framework import viewsets, status, filters
from rest_framework.decorators import action
from rest_framework.response import Response
from django_filters.rest_framework import DjangoFilterBackend
from django.utils import timezone

from admin_app.permissions import IsAdminUser

from .models import User
from .serializers import UserSerializer, UserCreateSerializer, UserUpdateSerializer


class UserViewSet(viewsets.ModelViewSet):
    queryset = User.objects.all()
    permission_classes = [IsAdminUser]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['role', 'status']
    search_fields = ['email', 'first_name', 'last_name']
    ordering_fields = ['date_joined', 'last_login', 'first_name']
    ordering = ['-date_joined']

    def get_serializer_class(self):
        if self.action == 'create':
            return UserCreateSerializer
        if self.action in ('update', 'partial_update'):
            return UserUpdateSerializer
        return UserSerializer

    def get_serializer_context(self):
        context = super().get_serializer_context()
        context['request'] = self.request
        return context

    @action(detail=False, methods=['get'])
    def stats(self, request):
        from django.utils import timezone
        from datetime import timedelta

        today = timezone.now().date()
        total = User.objects.count()
        active = User.objects.filter(status='active').count()
        new_today = User.objects.filter(date_joined__date=today).count()

        return Response({
            'total_users': total,
            'active_users': active,
            'new_today': new_today,
        })

    @action(detail=False, methods=['get'])
    def recent_activity(self, request):
        from apps.notifications.models import ActivityLog
        logs = ActivityLog.objects.select_related('user').order_by('-created_at')[:10]
        from apps.notifications.serializers import ActivityLogSerializer
        return Response(ActivityLogSerializer(logs, many=True).data)

    @action(detail=True, methods=['post'])
    def change_status(self, request, pk=None):
        user = self.get_object()
        new_status = request.data.get('status')
        if new_status not in dict(User.STATUS_CHOICES):
            return Response({'error': 'Invalid status'}, status=status.HTTP_400_BAD_REQUEST)
        user.status = new_status
        user.save(update_fields=['status'])
        return Response({'status': user.status})
