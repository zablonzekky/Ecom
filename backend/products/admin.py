 #products/admin.py
from django.contrib import admin
from .models import Category, Product, ProductImage, Size, Review

@admin.register(Category)
class CategoryAdmin(admin.ModelAdmin):
    list_display = ['name', 'gender', 'is_active']
    prepopulated_fields = {'slug': ('name',)}

@admin.register(Product)
class ProductAdmin(admin.ModelAdmin):
    list_display = ['name', 'category', 'price', 'discount_price', 'stock', 'is_featured']
    prepopulated_fields = {'slug': ('name',)}
    list_filter = ['category', 'is_featured', 'is_active']

admin.site.register(ProductImage)
admin.site.register(Size)
admin.site.register(Review)