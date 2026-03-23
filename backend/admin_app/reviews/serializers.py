from rest_framework import serializers
from products.models import Review


class ReviewSerializer(serializers.ModelSerializer):
    user_name = serializers.CharField(source='user.get_full_name', read_only=True)
    product_name = serializers.CharField(source='product.name', read_only=True)

    class Meta:
        model = Review
        fields = [
            'id', 'user', 'user_name', 'product', 'product_name',
            'rating', 'title', 'comment', 'status', 'created_at',
        ]
        read_only_fields = ['id', 'created_at']