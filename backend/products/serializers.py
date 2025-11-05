# products/serializers.py
from rest_framework import serializers
from .models import Category, Product, ProductImage, Size, Review


# Category Serializer
class CategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = Category
        fields = [
            'id', 'name', 'slug', 'gender', 
            'description', 'image', 'is_active', 'created_at'
        ]


# Product Image Serializer
class ProductImageSerializer(serializers.ModelSerializer):
    class Meta:
        model = ProductImage
        fields = ['id', 'image', 'alt_text', 'is_primary', 'created_at']


# Size Serializer
class SizeSerializer(serializers.ModelSerializer):
    class Meta:
        model = Size
        fields = ['id', 'size_type', 'value', 'stock']


# Review Serializer
class ReviewSerializer(serializers.ModelSerializer):
    user_name = serializers.CharField(source='user.username', read_only=True)

    class Meta:
        model = Review
        fields = [
            'id', 'user', 'user_name', 'rating', 
            'comment', 'created_at', 'updated_at'
        ]
        read_only_fields = ['user', 'created_at', 'updated_at']


# Product List Serializer (for product cards / listings)
class ProductListSerializer(serializers.ModelSerializer):
    category_name = serializers.CharField(source='category.name', read_only=True)
    primary_image = serializers.SerializerMethodField()
    average_rating = serializers.SerializerMethodField()
    review_count = serializers.SerializerMethodField()

    class Meta:
        model = Product
        fields = [
            'id', 'name', 'slug', 'category_name', 'product_type',
            'price', 'discount_price', 'current_price', 'discount_percentage',
            'stock', 'is_featured', 'primary_image', 
            'average_rating', 'review_count'
        ]

    def get_primary_image(self, obj):
        try:
            primary = obj.images.filter(is_primary=True).first()
            if primary:
                request = self.context.get('request')
                if request:
                    return request.build_absolute_uri(primary.image.url)
                return primary.image.url
        except Exception:
            pass
        return None

    def get_average_rating(self, obj):
        """Calculate average rating manually - Djongo doesn't support aggregate()"""
        try:
            reviews = list(obj.reviews.all())
            if reviews:
                total_rating = sum(review.rating for review in reviews)
                avg = total_rating / len(reviews)
                return round(avg, 1)
        except Exception:
            pass
        return 0

    def get_review_count(self, obj):
        """Count reviews manually"""
        try:
            return len(list(obj.reviews.all()))
        except Exception:
            return 0


# Product Detail Serializer (for product detail pages)
class ProductDetailSerializer(serializers.ModelSerializer):
    category = CategorySerializer(read_only=True)
    images = ProductImageSerializer(many=True, read_only=True)
    sizes = SizeSerializer(many=True, read_only=True)
    reviews = ReviewSerializer(many=True, read_only=True)
    average_rating = serializers.SerializerMethodField()
    review_count = serializers.SerializerMethodField()

    class Meta:
        model = Product
        fields = [
            'id', 'name', 'slug', 'category', 'product_type',
            'description', 'price', 'discount_price', 
            'current_price', 'discount_percentage', 'stock', 
            'is_featured', 'images', 'sizes', 'reviews',
            'average_rating', 'review_count', 
            'created_at', 'updated_at'
        ]

    def get_average_rating(self, obj):
        """Calculate average rating manually - Djongo doesn't support aggregate()"""
        try:
            reviews = list(obj.reviews.all())
            if reviews:
                total_rating = sum(review.rating for review in reviews)
                avg = total_rating / len(reviews)
                return round(avg, 1)
        except Exception:
            pass
        return 0

    def get_review_count(self, obj):
        """Count reviews manually"""
        try:
            return len(list(obj.reviews.all()))
        except Exception:
            return 0