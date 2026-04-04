from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.db import transaction
from django.utils.crypto import get_random_string
from .models import Address, Order, OrderItem
from .serializers import AddressSerializer, OrderSerializer, CreateOrderSerializer
from .services import get_shipping_cost
from products.models import Product


class AddressViewSet(viewsets.ModelViewSet):
    serializer_class = AddressSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        """
        Filter addresses by the current user.
        Includes a check for drf-yasg schema generation.
        """
        if getattr(self, 'swagger_fake_view', False):
            return Address.objects.none()

        return Address.objects.filter(user=self.request.user)

    def perform_create(self, serializer):
        # If this is set as default, unset other defaults for this user
        if serializer.validated_data.get('is_default'):
            Address.objects.filter(
                user=self.request.user,
                is_default=True
            ).update(is_default=False)
        serializer.save(user=self.request.user)

    def perform_update(self, serializer):
        # If updating an address to be default, unset others
        if serializer.validated_data.get('is_default'):
            Address.objects.filter(user=self.request.user, is_default=True).exclude(
                id=serializer.instance.id
            ).update(is_default=False)
        serializer.save()


class OrderViewSet(viewsets.ModelViewSet):
    serializer_class = OrderSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        """
        Filter orders by current user and prefetch items for performance.
        Includes a check for drf-yasg schema generation.
        """
        if getattr(self, 'swagger_fake_view', False):
            return Order.objects.none()

        return Order.objects.filter(user=self.request.user).prefetch_related('items__product')

    @action(detail=False, methods=['post'], url_path='shipping-estimate')
    def shipping_estimate(self, request):
        """
        Returns a shipping cost estimate for a given address and subtotal.
        Useful for showing the cost to the customer before they confirm checkout.

        Request body:
            address_id (int): ID of the saved address to deliver to
            subtotal   (float): Current cart subtotal in KES
        """
        address_id = request.data.get('address_id')
        subtotal = request.data.get('subtotal', 0)

        if not address_id:
            return Response({'error': 'address_id is required'}, status=status.HTTP_400_BAD_REQUEST)

        try:
            address = Address.objects.get(id=address_id, user=request.user)
        except Address.DoesNotExist:
            return Response({'error': 'Invalid address'}, status=status.HTTP_400_BAD_REQUEST)

        result = get_shipping_cost(
            city=address.city,
            county=address.county,
            subtotal=float(subtotal),
        )

        if result.get('error'):
            return Response({'error': result['error']}, status=status.HTTP_400_BAD_REQUEST)

        zone = result['zone']
        return Response({
            'shipping_cost': result['cost'],
            'zone_name': zone.name,
            'zone_type': zone.zone_type,
            'reason': result['reason'],
            'free_shipping_threshold': (
                float(zone.free_shipping_threshold)
                if zone.free_shipping_threshold else None
            ),
        })

    @transaction.atomic
    def create(self, request):
        """Create a new order with dynamically calculated shipping cost."""
        serializer = CreateOrderSerializer(data=request.data)

        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        data = serializer.validated_data

        # Validate that the address belongs to the user
        try:
            address = Address.objects.get(id=data['address_id'], user=request.user)
        except Address.DoesNotExist:
            return Response({'error': 'Invalid address'}, status=status.HTTP_400_BAD_REQUEST)

        # Calculate totals and prep items
        subtotal = 0
        order_items_data = []

        for item_data in data['items']:
            try:
                product = Product.objects.get(id=item_data['product_id'], is_active=True)

                # Check stock availability
                if hasattr(product, 'stock') and product.stock < item_data['quantity']:
                    return Response(
                        {'error': f'Insufficient stock for {product.name}'},
                        status=status.HTTP_400_BAD_REQUEST
                    )

                item_price = product.current_price
                subtotal += item_price * item_data['quantity']

                order_items_data.append({
                    'product': product,
                    'quantity': item_data['quantity'],
                    'price': item_price,
                })

            except Product.DoesNotExist:
                return Response({'error': 'Invalid product'}, status=status.HTTP_400_BAD_REQUEST)

        # Dynamic shipping calculation
        shipping_result = get_shipping_cost(
            city=address.city,
            county=address.county,
            subtotal=float(subtotal),
        )

        if shipping_result.get('error'):
            return Response({'error': shipping_result['error']}, status=status.HTTP_400_BAD_REQUEST)

        shipping_cost = shipping_result['cost']
        total = subtotal + shipping_cost

        order = Order.objects.create(
            user=request.user,
            order_number=f'ORD-{get_random_string(10).upper()}',
            address=address,
            shipping_zone=shipping_result['zone'],
            subtotal=subtotal,
            shipping_cost=shipping_cost,
            total=total,
            notes=data.get('notes', ''),
        )

        # Save OrderItems and deduct stock
        for item_info in order_items_data:
            OrderItem.objects.create(order=order, **item_info)

            if hasattr(item_info['product'], 'stock'):
                item_info['product'].stock -= item_info['quantity']
                item_info['product'].save()

        response_serializer = OrderSerializer(order, context={'request': request})
        return Response(response_serializer.data, status=status.HTTP_201_CREATED)

    @action(detail=True, methods=['post'])
    def cancel(self, request, pk=None):
        """Cancel an order and restore stock levels."""
        order = self.get_object()

        if order.status not in ['pending', 'processing']:
            return Response(
                {'error': 'Only pending or processing orders can be cancelled'},
                status=status.HTTP_400_BAD_REQUEST
            )

        order.status = 'cancelled'
        order.save()

        # Restore stock to inventory
        for item in order.items.all():
            if hasattr(item.product, 'stock'):
                item.product.stock += item.quantity
                item.product.save()

        serializer = self.get_serializer(order)
        return Response(serializer.data)