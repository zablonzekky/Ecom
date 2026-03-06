from rest_framework.permissions import BasePermission


class IsAdminUser(BasePermission):
    """Allow access only to admin users."""
    def has_permission(self, request, view):
        return bool(request.user and request.user.is_authenticated and request.user.role == 'admin')


class IsAdminOrReadOnly(BasePermission):
    """Allow read to authenticated, write to admin only."""
    def has_permission(self, request, view):
        if request.method in ('GET', 'HEAD', 'OPTIONS'):
            return bool(request.user and request.user.is_authenticated)
        return bool(request.user and request.user.is_authenticated and request.user.role == 'admin')
