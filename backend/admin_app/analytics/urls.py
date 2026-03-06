from django.urls import path
from .views import (
    DashboardStatsView,
    SalesChartView,
    SalesBreakdownView,
    HourlySalesView,
    ProductCategoryChartView,
    TopProductsView,
    ProductStockView,
    TopCustomersView,
    CustomerGrowthView,
    CustomerRetentionView,
    CustomersByRoleView,
)

urlpatterns = [
    # Overview
    path('dashboard/', DashboardStatsView.as_view(), name='analytics-dashboard'),

    # Sales
    path('sales/chart/', SalesChartView.as_view(), name='analytics-sales-chart'),
    path('sales/breakdown/', SalesBreakdownView.as_view(), name='analytics-sales-breakdown'),
    path('sales/hourly/', HourlySalesView.as_view(), name='analytics-sales-hourly'),

    # Products
    path('products/categories/', ProductCategoryChartView.as_view(), name='analytics-product-categories'),
    path('products/top/', TopProductsView.as_view(), name='analytics-top-products'),
    path('products/stock/', ProductStockView.as_view(), name='analytics-product-stock'),

    # Customers
    path('customers/top/', TopCustomersView.as_view(), name='analytics-top-customers'),
    path('customers/growth/', CustomerGrowthView.as_view(), name='analytics-customer-growth'),
    path('customers/retention/', CustomerRetentionView.as_view(), name='analytics-customer-retention'),
    path('customers/by-role/', CustomersByRoleView.as_view(), name='analytics-customers-by-role'),
]
