# orders/admin.py
from django.contrib import admin
from .models import Address, Order, OrderItem

@admin.register(Order)
class OrderAdmin(admin.ModelAdmin):
    list_display = ['order_number', 'user', 'status', 'total', 'created_at']
    list_filter = ['status', 'created_at']

admin.site.register(Address)
admin.site.register(OrderItem)