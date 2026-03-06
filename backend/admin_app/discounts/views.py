from rest_framework import viewsets, filters
from django_filters.rest_framework import DjangoFilterBackend
from admin_app.permissions import IsAdminUser
from .models import Discount
from .serializers import DiscountSerializer


class DiscountViewSet(viewsets.ModelViewSet):
    queryset = Discount.objects.all()
    serializer_class = DiscountSerializer
    permission_classes = [IsAdminUser]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter]
    filterset_fields = ['status', 'discount_type']
    search_fields = ['code', 'description']
