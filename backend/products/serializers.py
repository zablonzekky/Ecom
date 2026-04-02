from rest_framework import serializers
from .models import Category, Product, ProductImage, Size, Review

def build_absolute_image_url(request, image_field):
    if not image_field:
        return None
    if request:
        return request.build_absolute_uri(image_field.url)
    return image_field.url


class CategorySerializer(serializers.ModelSerializer):
    image = serializers.SerializerMethodField()

    class Meta:
        model = Category
        fields = ['id', 'name', 'slug', 'gender', 'description', 'image', 'is_active', 'created_at']
        ref_name = "UserCategory" # Added unique ref_name

    def get_image(self, obj):
        request = self.context.get('request')
        return build_absolute_image_url(request, obj.image)


class ProductImageSerializer(serializers.ModelSerializer):
    image = serializers.SerializerMethodField()

    class Meta:
        model = ProductImage
        fields = ['id', 'image', 'alt_text', 'is_primary', 'created_at']
        ref_name = "UserProductImage"

    def get_image(self, obj):
        request = self.context.get('request')
        return build_absolute_image_url(request, obj.image)


class SizeSerializer(serializers.ModelSerializer):
    class Meta:
        model = Size
        fields = ['id', 'size_type', 'value', 'stock']
        ref_name = "UserProductSize"


class ReviewSerializer(serializers.ModelSerializer):
    # Fixed: Using source='user.email' to match your custom user model
    user_email = serializers.CharField(source='user.email', read_only=True)

    class Meta:
        model = Review
        fields = ['id', 'user', 'user_email', 'rating', 'comment', 'created_at', 'updated_at']
        read_only_fields = ['user', 'created_at', 'updated_at']
        ref_name = "UserProductReview"


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
        ref_name = "UserProductList"

    def get_primary_image(self, obj):
        request = self.context.get('request')
        primary = obj.images.filter(is_primary=True).first() or obj.images.first()
        return build_absolute_image_url(request, primary.image) if primary else None

    def get_average_rating(self, obj):
        reviews = list(obj.reviews.all())
        if reviews:
            return round(sum(r.rating for r in reviews) / len(reviews), 1)
        return 0

    def get_review_count(self, obj):
        return obj.reviews.count()


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
        ref_name = "UserProductDetail"

    def get_images(self, obj):
        request = self.context.get('request')
        return [{
            "id": img.id,
            "image": build_absolute_image_url(request, img.image),
            "alt_text": img.alt_text,
            "is_primary": img.is_primary,
            "created_at": img.created_at
        } for img in obj.images.all()]

    def get_average_rating(self, obj):
        reviews = list(obj.reviews.all())
        return round(sum(r.rating for r in reviews) / len(reviews), 1) if reviews else 0

    def get_review_count(self, obj):
        return obj.reviews.count()