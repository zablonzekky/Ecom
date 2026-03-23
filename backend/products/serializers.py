from rest_framework import serializers
from .models import Category, Product, ProductImage, Size, Review


# Helper function to build absolute image URL
def build_absolute_image_url(request, image_field):
    if not image_field:
        return None
    if request:
        return request.build_absolute_uri(image_field.url)
    return image_field.url


# Category Serializer
class CategorySerializer(serializers.ModelSerializer):
    image = serializers.SerializerMethodField()

    class Meta:
        model = Category
        fields = [
            'id', 'name', 'slug', 'gender',
            'description', 'image', 'is_active', 'created_at'
        ]

    def get_image(self, obj):
        request = self.context.get('request')
        return build_absolute_image_url(request, obj.image)


# Product Image Serializer
class ProductImageSerializer(serializers.ModelSerializer):
    image = serializers.SerializerMethodField()

    class Meta:
        model = ProductImage
        fields = ['id', 'image', 'alt_text', 'is_primary', 'created_at']

    def get_image(self, obj):
        request = self.context.get('request')
        return build_absolute_image_url(request, obj.image)


# Size Serializer
class SizeSerializer(serializers.ModelSerializer):
    class Meta:
        model = Size
        fields = ['id', 'size_type', 'value', 'stock']

    def validate_stock(self, value):
        if value < 0:
            raise serializers.ValidationError("Stock cannot be negative.")
        return value


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


# Product List Serializer (for product cards / listing)
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
        request = self.context.get('request')
        primary = obj.images.filter(is_primary=True).first()

        if not primary:
            primary = obj.images.first()

        if primary:
            return build_absolute_image_url(request, primary.image)

        return None

    def get_average_rating(self, obj):
        reviews = list(obj.reviews.all())
        if reviews:
            total_rating = sum(r.rating for r in reviews)
            return round(total_rating / len(reviews), 1)
        return 0

    def get_review_count(self, obj):
        return obj.reviews.count()


# Product Detail Serializer
class ProductDetailSerializer(serializers.ModelSerializer):
    category = CategorySerializer(read_only=True)
    images = serializers.SerializerMethodField()
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

    def get_images(self, obj):
        request = self.context.get('request')
        result = []

        for img in obj.images.all():
            result.append({
                "id": img.id,
                "image": build_absolute_image_url(request, img.image),
                "alt_text": img.alt_text,
                "is_primary": img.is_primary,
                "created_at": img.created_at
            })

        return result

    def get_average_rating(self, obj):
        reviews = list(obj.reviews.all())
        if reviews:
            total_rating = sum(r.rating for r in reviews)
            return round(total_rating / len(reviews), 1)
        return 0

    def get_review_count(self, obj):
        return obj.reviews.count()