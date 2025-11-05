from django.contrib import admin
from django.contrib import admin
from .models import MpesaTransaction

@admin.register(MpesaTransaction)
class MpesaTransactionAdmin(admin.ModelAdmin):
    list_display = ['order', 'phone_number', 'amount', 'status', 'created_at']
    list_filter = ['status', 'created_at']
    