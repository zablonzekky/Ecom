import json

from rest_framework import viewsets, filters, status
from rest_framework.decorators import action
from rest_framework.response import Response
from django_filters.rest_framework import DjangoFilterBackend

from admin_app.permissions import IsAdminOrReadOnly
from products.models import Product, Category, Size, ProductImage
from .serializers import (
    ProductSerializer, ProductCreateUpdateSerializer, CategorySerializer
)


class CategoryViewSet(viewsets.ModelViewSet):
    queryset = Category.objects.all()
    serializer_class = CategorySerializer
    permission_classes = [IsAdminOrReadOnly]
    filter_backends = [filters.SearchFilter]
    search_fields = ['name', 'gender']


class ProductViewSet(viewsets.ModelViewSet):
    queryset = Product.objects.select_related('category').prefetch_related('images', 'sizes')
    permission_classes = [IsAdminOrReadOnly]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['is_active', 'is_featured', 'product_type', 'category']
    search_fields = ['name', 'description']
    ordering_fields = ['price', 'stock', 'created_at', 'name']
    ordering = ['-created_at']

    def get_serializer_class(self):
        if self.action in ('create', 'update', 'partial_update'):
            return ProductCreateUpdateSerializer
        return ProductSerializer

    def _handle_image(self, product, request, replace=False):
        """Save image file directly from request.FILES — same as Django admin inline."""
        image_file = request.FILES.get('uploaded_images')
        if not image_file:
            return
        if replace:
            product.images.all().delete()
        # Create the ProductImage directly — no serializer involved
        ProductImage.objects.create(
            product=product,
            image=image_file,
            alt_text=image_file.name,
            is_primary=True,
        )

    def _handle_sizes(self, product, request):
        """Parse sizes_json and recreate Size rows."""
        sizes_json = request.data.get('sizes_json')
        if not sizes_json:
            return
        try:
            sizes = json.loads(sizes_json)
            if not isinstance(sizes, list):
                return
            product.sizes.all().delete()
            for s in sizes:
                Size.objects.create(
                    product=product,
                    size_type=s.get('size_type', ''),
                    value=s.get('value', ''),
                    stock=s.get('stock', 0),
                )
        except (json.JSONDecodeError, ValueError):
            pass

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        product = serializer.save()

        self._handle_sizes(product, request)
        self._handle_image(product, request, replace=False)

        return Response(
            ProductSerializer(product, context={'request': request}).data,
            status=status.HTTP_201_CREATED,
        )

    def update(self, request, *args, **kwargs):
        partial = kwargs.pop('partial', False)
        instance = self.get_object()

        serializer = self.get_serializer(instance, data=request.data, partial=partial)
        serializer.is_valid(raise_exception=True)
        product = serializer.save()

        self._handle_sizes(product, request)
        self._handle_image(product, request, replace=True)

        return Response(
            ProductSerializer(product, context={'request': request}).data,
        )

    @action(detail=False, methods=['get'])
    def stats(self, request):
        total = Product.objects.count()
        active = Product.objects.filter(is_active=True).count()
        low_stock = Product.objects.filter(stock__lte=10, stock__gt=0).count()
        out_of_stock = Product.objects.filter(stock=0).count()
        return Response({
            'total': total,
            'active': active,
            'low_stock': low_stock,
            'out_of_stock': out_of_stock,
        })