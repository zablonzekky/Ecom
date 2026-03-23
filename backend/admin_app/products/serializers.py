from rest_framework import serializers
from products.models import Product, Category, Size, ProductImage


class CategorySerializer(serializers.ModelSerializer):
    product_count = serializers.IntegerField(source='products.count', read_only=True)

    class Meta:
        model = Category
        fields = ['id', 'name', 'slug', 'gender', 'description', 'image', 'is_active', 'product_count', 'created_at']
        read_only_fields = ['id', 'created_at']


class ProductImageSerializer(serializers.ModelSerializer):
    class Meta:
        model = ProductImage
        fields = ['id', 'image', 'alt_text', 'is_primary']


class SizeSerializer(serializers.ModelSerializer):
    class Meta:
        model = Size
        fields = ['id', 'size_type', 'value', 'stock']

    def validate_stock(self, value):
        if value < 0:
            raise serializers.ValidationError("Stock cannot be negative.")
        return value


class ProductSerializer(serializers.ModelSerializer):
    category_name = serializers.CharField(source='category.name', read_only=True)
    images = ProductImageSerializer(many=True, read_only=True)
    sizes = SizeSerializer(many=True, read_only=True)
    current_price = serializers.DecimalField(max_digits=10, decimal_places=2, read_only=True)
    discount_percentage = serializers.IntegerField(read_only=True)

    class Meta:
        model = Product
        fields = [
            'id', 'name', 'slug', 'description', 'category', 'category_name',
            'product_type', 'price', 'discount_price', 'current_price',
            'discount_percentage', 'stock', 'is_active', 'is_featured',
            'images', 'sizes', 'created_at', 'updated_at',
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']


class ProductCreateUpdateSerializer(serializers.ModelSerializer):
    sizes = SizeSerializer(many=True, required=False)
    images = ProductImageSerializer(many=True, required=False)

    class Meta:
        model = Product
        fields = [
            'name', 'slug', 'description', 'category', 'product_type',
            'price', 'discount_price', 'stock', 'is_active', 'is_featured',
            'sizes', 'images',
        ]

    def validate_stock(self, value):
        if value < 0:
            raise serializers.ValidationError("Stock cannot be negative.")
        return value

    def validate(self, data):
        price = data.get('price')
        discount_price = data.get('discount_price')
        if discount_price is not None and price is not None:
            if discount_price >= price:
                raise serializers.ValidationError({
                    'discount_price': 'Discount price must be less than the original price.'
                })
        return data

    def create(self, validated_data):
        sizes_data = validated_data.pop('sizes', [])
        images_data = validated_data.pop('images', [])
        product = Product.objects.create(**validated_data)
        for size_data in sizes_data:
            Size.objects.create(product=product, **size_data)
        for image_data in images_data:
            ProductImage.objects.create(product=product, **image_data)
        return product

    def update(self, instance, validated_data):
        sizes_data = validated_data.pop('sizes', None)
        images_data = validated_data.pop('images', None)
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.save()
        if sizes_data is not None:
            instance.sizes.all().delete()
            for size_data in sizes_data:
                Size.objects.create(product=instance, **size_data)
        if images_data is not None:
            instance.images.all().delete()
            for image_data in images_data:
                ProductImage.objects.create(product=instance, **image_data)
        return instance