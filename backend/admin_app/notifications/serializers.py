from rest_framework import serializers
from .models import Notification, ActivityLog


class NotificationSerializer(serializers.ModelSerializer):
    class Meta:
        model = Notification
        fields = ['id', 'title', 'message', 'notification_type', 'is_read', 'created_at']
        read_only_fields = ['id', 'created_at']


class ActivityLogSerializer(serializers.ModelSerializer):
    user_name = serializers.SerializerMethodField()
    user_email = serializers.SerializerMethodField()

    class Meta:
        model = ActivityLog
        fields = [
            'id', 'user', 'user_name', 'user_email',
            'action', 'resource_type', 'resource_id',
            'description', 'ip_address', 'created_at',
        ]
        read_only_fields = ['id', 'created_at']

    def get_user_name(self, obj):
        return obj.user.get_full_name() if obj.user else 'System'

    def get_user_email(self, obj):
        return obj.user.email if obj.user else ''
