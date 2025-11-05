from django.shortcuts import render

# Create your views here.
# orders/views.py
from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.db import transaction
from django.utils.crypto import get_random_string
from .models import Address, Order, OrderItem
from .serializers import AddressSerializer, OrderSerializer, CreateOrderSerializer
from products.models import Product, Size


class AddressViewSet(viewsets.ModelViewSet):
    serializer_class = AddressSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        return Address.objects.filter(user=self.request.user)
    
    def perform_create(self, serializer):
        # If this is set as default, unset other defaults
        if serializer.validated_data.get('is_default'):
            Address.objects.filter(user=self.request.user, is_default=True).update(is_default=False)
        serializer.save(user=self.request.user)
    
    def perform_update(self, serializer):
        if serializer.validated_data.get('is_default'):
            Address.objects.filter(user=self.request.user, is_default=True).exclude(
                id=serializer.instance.id
            ).update(is_default=False)
        serializer.save()


class OrderViewSet(viewsets.ModelViewSet):
    serializer_class = OrderSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        return Order.objects.filter(user=self.request.user).prefetch_related('items__product')
    
    @transaction.atomic
    def create(self, request):
        """Create a new order"""
        serializer = CreateOrderSerializer(data=request.data)
        
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        
        data = serializer.validated_data
        
        # Validate address
        try:
            address = Address.objects.get(id=data['address_id'], user=request.user)
        except Address.DoesNotExist:
            return Response({'error': 'Invalid address'}, status=status.HTTP_400_BAD_REQUEST)
        
        # Calculate totals
        subtotal = 0
        order_items = []
        
        for item_data in data['items']:
            try:
                product = Product.objects.get(id=item_data['product_id'], is_active=True)
                size = Size.objects.get(product=product, value=item_data['size'])
                
                # Check stock
                if size.stock < item_data['quantity']:
                    return Response(
                        {'error': f'Insufficient stock for {product.name} size {size.value}'},
                        status=status.HTTP_400_BAD_REQUEST
                    )
                
                item_price = product.current_price
                item_subtotal = item_price * item_data['quantity']
                subtotal += item_subtotal
                
                order_items.append({
                    'product': product,
                    'size': size.value,
                    'quantity': item_data['quantity'],
                    'price': item_price
                })
                
            except (Product.DoesNotExist, Size.DoesNotExist):
                return Response({'error': 'Invalid product or size'}, status=status.HTTP_400_BAD_REQUEST)
        
        # Create order
        shipping_cost = 200  # Fixed shipping cost (KES)
        total = subtotal + shipping_cost
        
        order = Order.objects.create(
            user=request.user,
            order_number=f'ORD-{get_random_string(10).upper()}',
            address=address,
            subtotal=subtotal,
            shipping_cost=shipping_cost,
            total=total,
            notes=data.get('notes', '')
        )
        
        # Create order items and update stock
        for item_data in order_items:
            OrderItem.objects.create(order=order, **item_data)
            size_obj = Size.objects.get(product=item_data['product'], value=item_data['size'])
            size_obj.stock -= item_data['quantity']
            size_obj.save()
        
        serializer = OrderSerializer(order, context={'request': request})
        return Response(serializer.data, status=status.HTTP_201_CREATED)
    
    @action(detail=True, methods=['post'])
    def cancel(self, request, pk=None):
        """Cancel an order"""
        order = self.get_object()
        
        if order.status not in ['pending', 'processing']:
            return Response(
                {'error': 'Cannot cancel order in current status'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        order.status = 'cancelled'
        order.save()
        
        # Restore stock
        for item in order.items.all():
            size = Size.objects.get(product=item.product, value=item.size)
            size.stock += item.quantity
            size.save()
        
        serializer = self.get_serializer(order)
        return Response(serializer.data)
