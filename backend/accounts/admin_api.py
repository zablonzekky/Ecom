from django.contrib.auth.models import User
from rest_framework import serializers, viewsets
from rest_framework.permissions import IsAdminUser, IsAuthenticated

from orders.models import Order
from products.models import Product


class AdminProductSerializer(serializers.ModelSerializer):
    class Meta:
        model = Product
        fields = ["id", "name", "slug", "price", "discount_price", "stock", "is_active", "is_featured", "category", "description", "product_type"]


class AdminOrderSerializer(serializers.ModelSerializer):
    user_name = serializers.CharField(source="user.username", read_only=True)

    class Meta:
        model = Order
        fields = ["id", "order_number", "status", "total", "user", "user_name", "created_at", "updated_at"]


class AdminUserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ["id", "username", "email", "first_name", "last_name", "is_staff", "is_active", "date_joined"]


class AdminProductViewSet(viewsets.ModelViewSet):
    queryset = Product.objects.all().order_by("-created_at")
    serializer_class = AdminProductSerializer
    permission_classes = [IsAuthenticated, IsAdminUser]


class AdminOrderViewSet(viewsets.ModelViewSet):
    queryset = Order.objects.all().order_by("-created_at")
    serializer_class = AdminOrderSerializer
    permission_classes = [IsAuthenticated, IsAdminUser]


class AdminUserViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = User.objects.all().order_by("-date_joined")
    serializer_class = AdminUserSerializer
    permission_classes = [IsAuthenticated, IsAdminUser]
