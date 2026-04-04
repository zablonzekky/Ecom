from django.db import models
from django.contrib.auth import get_user_model
User = get_user_model()
from products.models import Product


class ShippingZone(models.Model):
    ZONE_TYPES = [
        ('cbd', 'CBD / City Center'),
        ('suburb', 'Suburbs'),
        ('upcountry', 'Upcountry'),
    ]

    name = models.CharField(max_length=100)
    zone_type = models.CharField(max_length=20, choices=ZONE_TYPES)
    counties = models.JSONField(default=list, help_text="List of county names this zone covers")
    cities = models.JSONField(default=list, blank=True, help_text="Optional finer-grain city/area names")
    base_rate = models.DecimalField(max_digits=10, decimal_places=2)
    free_shipping_threshold = models.DecimalField(
        max_digits=10, decimal_places=2, null=True, blank=True,
        help_text="Order subtotal above which shipping is free. Leave blank to disable."
    )
    is_active = models.BooleanField(default=True)
    priority = models.PositiveIntegerField(
        default=0,
        help_text="Higher priority zones are matched first. Use for city overrides within a county."
    )

    class Meta:
        ordering = ['-priority']
        verbose_name = "Shipping Zone"
        verbose_name_plural = "Shipping Zones"

    def __str__(self):
        return f"{self.name} ({self.get_zone_type_display()}) — KES {self.base_rate}"


class Address(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='addresses')
    full_name = models.CharField(max_length=200)
    phone_number = models.CharField(max_length=20)
    address_line1 = models.CharField(max_length=255)
    address_line2 = models.CharField(max_length=255, blank=True)
    city = models.CharField(max_length=100)
    county = models.CharField(max_length=100)
    postal_code = models.CharField(max_length=20, blank=True)
    is_default = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        verbose_name_plural = 'Addresses'

    def __str__(self):
        return f"{self.full_name} - {self.city}"


class Order(models.Model):
    STATUS_CHOICES = [
        ('pending', 'Pending'),
        ('processing', 'Processing'),
        ('shipped', 'Shipped'),
        ('delivered', 'Delivered'),
        ('completed', 'Completed'),
        ('cancelled', 'Cancelled'),
        ('refunded', 'Refunded'),
    ]

    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='orders')
    order_number = models.CharField(max_length=20, unique=True)
    address = models.ForeignKey(Address, on_delete=models.SET_NULL, null=True)
    shipping_zone = models.ForeignKey(
        ShippingZone, on_delete=models.SET_NULL, null=True, blank=True,
        help_text="Zone used to calculate shipping for this order"
    )
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
    subtotal = models.DecimalField(max_digits=10, decimal_places=2)
    shipping_cost = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    total = models.DecimalField(max_digits=10, decimal_places=2)
    notes = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"Order {self.order_number}"


class OrderItem(models.Model):
    order = models.ForeignKey(Order, on_delete=models.CASCADE, related_name='items')
    product = models.ForeignKey(Product, on_delete=models.CASCADE)
    quantity = models.PositiveIntegerField(default=1)
    price = models.DecimalField(max_digits=10, decimal_places=2)

    def __str__(self):
        return f"{self.quantity}x {self.product.name}"

    @property
    def subtotal(self):
        return self.quantity * self.price


class OrderTimeline(models.Model):
    order = models.ForeignKey(Order, on_delete=models.CASCADE, related_name='timeline')
    status = models.CharField(max_length=50)
    note = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    created_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True)

    class Meta:
        ordering = ['created_at']

    def __str__(self):
        return f"{self.order.order_number} - {self.status}"


class Refund(models.Model):
    STATUS_CHOICES = [
        ('pending', 'Pending'),
        ('approved', 'Approved'),
        ('rejected', 'Rejected'),
        ('processed', 'Processed'),
    ]

    order = models.OneToOneField(Order, on_delete=models.CASCADE, related_name='refund')
    reason = models.TextField()
    amount = models.DecimalField(max_digits=10, decimal_places=2)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"Refund for {self.order.order_number}"