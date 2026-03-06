from rest_framework import viewsets, status, filters
from rest_framework.decorators import action
from rest_framework.response import Response
from django_filters.rest_framework import DjangoFilterBackend
from django.utils import timezone
from datetime import timedelta
from django.db.models import Sum

from admin_app.permissions import IsAdminUser
from .models import Order, Refund, OrderTimeline
from .serializers import (
    OrderSerializer, OrderCreateSerializer, OrderUpdateStatusSerializer, RefundSerializer
)


class OrderViewSet(viewsets.ModelViewSet):
    queryset = Order.objects.select_related('customer').prefetch_related('items', 'timeline')
    permission_classes = [IsAdminUser]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['status']
    search_fields = ['order_id', 'customer__email', 'customer__first_name', 'customer__last_name']
    ordering_fields = ['created_at', 'total']
    ordering = ['-created_at']

    def get_serializer_class(self):
        if self.action == 'create':
            return OrderCreateSerializer
        return OrderSerializer

    def get_queryset(self):
        qs = super().get_queryset()
        date_range = self.request.query_params.get('date_range')
        if date_range:
            now = timezone.now()
            if date_range == 'today':
                qs = qs.filter(created_at__date=now.date())
            elif date_range == 'week':
                qs = qs.filter(created_at__gte=now - timedelta(days=7))
            elif date_range == 'month':
                qs = qs.filter(created_at__gte=now - timedelta(days=30))
        return qs

    @action(detail=False, methods=['get'])
    def stats(self, request):
        today = timezone.now().date()
        yesterday = today - timedelta(days=1)

        total_orders = Order.objects.count()
        pending = Order.objects.filter(status='pending').count()

        revenue_today = Order.objects.filter(
            created_at__date=today, status__in=['completed', 'shipped']
        ).aggregate(total=Sum('total'))['total'] or 0

        revenue_yesterday = Order.objects.filter(
            created_at__date=yesterday, status__in=['completed', 'shipped']
        ).aggregate(total=Sum('total'))['total'] or 1  # avoid division by zero

        revenue_change = ((revenue_today - revenue_yesterday) / revenue_yesterday) * 100

        revenue_sales = Order.objects.filter(
            status='completed'
        ).aggregate(total=Sum('total'))['total'] or 0

        return Response({
            'total_orders': total_orders,
            'pending': pending,
            'revenue_today': float(revenue_today),
            'revenue_change_percent': round(float(revenue_change), 1),
            'revenue_sales': float(revenue_sales),
        })

    @action(detail=True, methods=['post'])
    def update_status(self, request, pk=None):
        order = self.get_object()
        serializer = OrderUpdateStatusSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        old_status = order.status
        order.status = serializer.validated_data['status']
        order.save(update_fields=['status'])

        OrderTimeline.objects.create(
            order=order,
            status=order.status,
            note=serializer.validated_data.get('note', f'Status changed from {old_status} to {order.status}'),
            created_by=request.user,
        )
        return Response(OrderSerializer(order).data)

    @action(detail=True, methods=['post'])
    def refund(self, request, pk=None):
        order = self.get_object()
        if hasattr(order, 'refund'):
            return Response({'error': 'Refund already exists'}, status=status.HTTP_400_BAD_REQUEST)

        serializer = RefundSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        serializer.save(order=order)
        order.status = 'refunded'
        order.save(update_fields=['status'])
        return Response(serializer.data, status=status.HTTP_201_CREATED)


class RefundViewSet(viewsets.ModelViewSet):
    queryset = Refund.objects.select_related('order', 'order__customer')
    serializer_class = RefundSerializer
    permission_classes = [IsAdminUser]
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ['status']
