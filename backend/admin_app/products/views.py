from rest_framework import viewsets, filters
from rest_framework.decorators import action
from rest_framework.response import Response
from django_filters.rest_framework import DjangoFilterBackend

from admin_app.permissions import IsAdminUser, IsAdminOrReadOnly
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
    queryset = Product.objects.select_related('category').prefetch_related('images', 'sizes')  # variants → sizes
    permission_classes = [IsAdminOrReadOnly]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['is_active', 'is_featured', 'product_type', 'category']  # status → is_active
    search_fields = ['name', 'description']
    ordering_fields = ['price', 'stock', 'created_at', 'name']
    ordering = ['-created_at']

    def get_serializer_class(self):
        if self.action in ('create', 'update', 'partial_update'):
            return ProductCreateUpdateSerializer
        return ProductSerializer

    @action(detail=False, methods=['get'])
    def stats(self, request):
        total = Product.objects.count()
        active = Product.objects.filter(is_active=True).count()        # status='active' → is_active=True
        low_stock = Product.objects.filter(stock__lte=10, stock__gt=0).count()
        out_of_stock = Product.objects.filter(stock=0).count()
        return Response({
            'total': total,
            'active': active,
            'low_stock': low_stock,
            'out_of_stock': out_of_stock,
        })