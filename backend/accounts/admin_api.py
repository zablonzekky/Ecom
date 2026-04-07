from django.contrib.auth import get_user_model
User = get_user_model()
from rest_framework import serializers, viewsets
from rest_framework.permissions import IsAdminUser, IsAuthenticated

from orders.models import Order
from products.models import Product
class AdminProductSerializer(serializers.ModelSerializer):
    class Meta:
        model = Product
        fields = [
            "id", "name", "slug", "price", "discount_price", "stock", 
            "is_active", "is_featured", "category", "description", "product_type"
        ]

class AdminOrderSerializer(serializers.ModelSerializer):
    # Changed from user.username to user.email
    user_email = serializers.EmailField(source="user.email", read_only=True)

    class Meta:
        model = Order
        fields = [
            "id", "order_number", "status", "total", "user", 
            "user_email", "created_at", "updated_at"
        ]

class AdminUserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        # Removed 'username' and ensured 'email' is present
        fields = [
            "id", "email", "first_name", "last_name", 
            "is_staff", "is_active", "date_joined"
        ]

# --- ViewSets ---

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