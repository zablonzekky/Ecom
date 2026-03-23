from rest_framework.views import APIView
from rest_framework.response import Response
from django.db.models import Sum, Count, Avg, F, Q
from django.db.models.functions import TruncDate, TruncWeek, TruncMonth, ExtractHour
from django.utils import timezone
from datetime import timedelta
from django.contrib.auth import get_user_model

from admin_app.permissions import IsAdminUser
from orders.models import Order, OrderItem
from products.models import Product

User = get_user_model()


def get_date_range(request):
    days = int(request.query_params.get('period', 30))
    end = timezone.now()
    start = end - timedelta(days=days)
    prev_end = start
    prev_start = prev_end - timedelta(days=days)
    return start, end, prev_start, prev_end


def pct_change(current, previous):
    try:
        current = float(current or 0)
        previous = float(previous or 0)
        if not previous:
            return 0
        return round(((current - previous) / previous) * 100, 1)
    except Exception:
        return 0


# ─── OVERVIEW ─────────────────────────────────
class DashboardStatsView(APIView):
    permission_classes = [IsAdminUser]

    def get(self, request):
        start, end, prev_start, prev_end = get_date_range(request)

        curr_orders = Order.objects.filter(created_at__range=(start, end))
        prev_orders = Order.objects.filter(created_at__range=(prev_start, prev_end))

        curr_revenue = curr_orders.filter(status='completed').aggregate(t=Sum('total'))['t'] or 0
        prev_revenue = prev_orders.filter(status='completed').aggregate(t=Sum('total'))['t'] or 0
        curr_count = curr_orders.count()
        prev_count = prev_orders.count()

        # User has no role field — use is_staff/is_active instead
        curr_customers = User.objects.filter(date_joined__range=(start, end), is_staff=False).count()
        prev_customers = User.objects.filter(date_joined__range=(prev_start, prev_end), is_staff=False).count()
        total_customers = User.objects.filter(is_staff=False).count()

        curr_aov = curr_orders.filter(status='completed').aggregate(a=Avg('total'))['a'] or 0
        prev_aov = prev_orders.filter(status='completed').aggregate(a=Avg('total'))['a'] or 0
        total_sales = Order.objects.filter(status='completed').aggregate(t=Sum('total'))['t'] or 0

        return Response({
            'total_sales': float(total_sales),
            'orders_count': Order.objects.count(),
            'total_customers': total_customers,
            'revenue': float(curr_revenue),
            'revenue_change': pct_change(curr_revenue, prev_revenue),
            'orders': curr_count,
            'orders_change': pct_change(curr_count, prev_count),
            'new_customers': curr_customers,
            'new_customers_change': pct_change(curr_customers, prev_customers),
            'aov': float(curr_aov),
            'aov_change': pct_change(curr_aov, prev_aov),
            'new_customers_pct': round((curr_customers / total_customers * 100) if total_customers else 0, 1),
            'avg_order_value': float(curr_aov),
        })


# ─── SALES ────────────────────────────────────
class SalesChartView(APIView):
    permission_classes = [IsAdminUser]

    def get(self, request):
        days = int(request.query_params.get('period', 30))
        granularity = request.query_params.get('granularity', 'day')
        end = timezone.now()
        start = end - timedelta(days=days)

        qs = Order.objects.filter(
            created_at__range=(start, end),
            status__in=['completed', 'shipped'],
        )

        if granularity == 'month':
            qs = qs.annotate(period=TruncMonth('created_at'))
        elif granularity == 'week':
            qs = qs.annotate(period=TruncWeek('created_at'))
        else:
            qs = qs.annotate(period=TruncDate('created_at'))

        grouped = qs.values('period').annotate(
            revenue=Sum('total'), orders=Count('id')
        ).order_by('period')

        return Response([
            {
                'date': item['period'].strftime('%Y-%m-%d'),
                'revenue': float(item['revenue'] or 0),
                'orders': item['orders'],
            }
            for item in grouped
        ])


class SalesBreakdownView(APIView):
    permission_classes = [IsAdminUser]

    def get(self, request):
        start, end, _, _ = get_date_range(request)
        breakdown = (
            Order.objects.filter(created_at__range=(start, end))
            .values('status')
            .annotate(count=Count('id'), revenue=Sum('total'))
            .order_by('-count')
        )
        return Response([
            {'status': b['status'], 'count': b['count'], 'revenue': float(b['revenue'] or 0)}
            for b in breakdown
        ])


class HourlySalesView(APIView):
    permission_classes = [IsAdminUser]

    def get(self, request):
        start, end, _, _ = get_date_range(request)
        data = (
            Order.objects.filter(created_at__range=(start, end), status='completed')
            .annotate(hour=ExtractHour('created_at'))
            .values('hour')
            .annotate(count=Count('id'), revenue=Sum('total'))
            .order_by('hour')
        )
        hour_map = {d['hour']: d for d in data}
        return Response([
            {
                'hour': h,
                'label': f"{h:02d}:00",
                'count': hour_map.get(h, {}).get('count', 0),
                'revenue': float(hour_map.get(h, {}).get('revenue') or 0),
            }
            for h in range(24)
        ])


# ─── PRODUCTS ─────────────────────────────────
class ProductCategoryChartView(APIView):
    permission_classes = [IsAdminUser]

    def get(self, request):
        data = (
            Product.objects.values('category__name')
            .annotate(count=Count('id'))
            .order_by('-count')
        )
        return Response([
            {'name': d['category__name'] or 'Uncategorized', 'count': d['count']}
            for d in data
        ])


class TopProductsView(APIView):
    permission_classes = [IsAdminUser]

    def get(self, request):
        start, end, _, _ = get_date_range(request)
        limit = int(request.query_params.get('limit', 10))

        data = (
            OrderItem.objects.filter(
                order__created_at__range=(start, end),
                order__status='completed',
            )
            .values('product__id', 'product__name', 'product__category__name')
            .annotate(
                units_sold=Sum('quantity'),
                revenue=Sum(F('quantity') * F('price')),  # unit_price → price
            )
            .order_by('-revenue')[:limit]
        )
        return Response([
            {
                'id': d['product__id'],
                'name': d['product__name'] or 'Unknown',
                'category': d['product__category__name'] or 'Uncategorized',
                'units_sold': d['units_sold'],
                'revenue': float(d['revenue'] or 0),
            }
            for d in data
        ])


class ProductStockView(APIView):
    permission_classes = [IsAdminUser]

    def get(self, request):
        products = Product.objects.select_related('category').values(
            'id', 'name', 'stock', 'is_active', 'category__name'  # status → is_active
        ).order_by('stock')[:20]
        return Response([
            {
                'id': p['id'],
                'name': p['name'],
                'stock': p['stock'],
                'status': 'active' if p['is_active'] else 'inactive',
                'category': p['category__name'] or 'Uncategorized',
                'stock_level': 'critical' if p['stock'] == 0 else 'low' if p['stock'] <= 10 else 'ok',
            }
            for p in products
        ])


# ─── CUSTOMERS ────────────────────────────────
class TopCustomersView(APIView):
    permission_classes = [IsAdminUser]

    def get(self, request):
        start, end, _, _ = get_date_range(request)
        limit = int(request.query_params.get('limit', 10))
        data = (
            Order.objects.filter(created_at__range=(start, end), status='completed')
            .values('user__id', 'user__first_name', 'user__last_name', 'user__email')  # customer → user
            .annotate(total_spent=Sum('total'), order_count=Count('id'))
            .order_by('-total_spent')[:limit]
        )
        return Response([
            {
                'id': d['user__id'],
                'name': f"{d['user__first_name']} {d['user__last_name']}".strip(),
                'email': d['user__email'],
                'total_spent': float(d['total_spent'] or 0),
                'order_count': d['order_count'],
                'avg_order': float((d['total_spent'] or 0) / d['order_count']) if d['order_count'] else 0,
            }
            for d in data
        ])


class CustomerGrowthView(APIView):
    permission_classes = [IsAdminUser]

    def get(self, request):
        days = int(request.query_params.get('period', 30))
        end = timezone.now()
        start = end - timedelta(days=days)
        data = (
            User.objects.filter(date_joined__range=(start, end), is_staff=False)
            .annotate(day=TruncDate('date_joined'))
            .values('day')
            .annotate(new_customers=Count('id'))
            .order_by('day')
        )
        return Response([
            {'date': d['day'].strftime('%Y-%m-%d'), 'new_customers': d['new_customers']}
            for d in data
        ])


class CustomerRetentionView(APIView):
    permission_classes = [IsAdminUser]

    def get(self, request):
        start, end, _, _ = get_date_range(request)
        customer_orders = (
            Order.objects.filter(created_at__range=(start, end), status='completed')
            .values('user')  # customer → user
            .annotate(order_count=Count('id'))
        )
        one_time = sum(1 for c in customer_orders if c['order_count'] == 1)
        repeat = sum(1 for c in customer_orders if c['order_count'] > 1)
        total = one_time + repeat
        return Response({
            'one_time': one_time,
            'repeat': repeat,
            'total': total,
            'repeat_rate': round((repeat / total * 100) if total else 0, 1),
            'segments': [
                {'name': 'One-time buyers', 'value': one_time},
                {'name': 'Repeat buyers', 'value': repeat},
            ]
        })


class CustomersByRoleView(APIView):
    permission_classes = [IsAdminUser]

    def get(self, request):
        # No role/status fields on default User — use is_staff and is_active
        by_role = [
            {'role': 'admin', 'count': User.objects.filter(is_staff=True).count()},
            {'role': 'customer', 'count': User.objects.filter(is_staff=False).count()},
        ]
        by_status = [
            {'status': 'active', 'count': User.objects.filter(is_active=True).count()},
            {'status': 'inactive', 'count': User.objects.filter(is_active=False).count()},
        ]
        return Response({'by_role': by_role, 'by_status': by_status})