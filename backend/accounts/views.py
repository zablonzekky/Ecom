from django.contrib.auth import get_user_model
User = get_user_model()
from django.core.mail import send_mail
from django.conf import settings
from rest_framework import status, viewsets
from rest_framework.permissions import IsAuthenticated, AllowAny, IsAdminUser
from rest_framework.views import APIView
from rest_framework.response import Response

from orders.models import Order
from products.models import Product
from .models import NewsletterSubscription, ContactMessage
from .serializers import (
    ContactMessageSerializer,
    NewsletterSubscriptionSerializer,
    RegisterSerializer,
    UserProfileSerializer,
    UserProfileUpdateSerializer,
)


class RegisterView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        serializer = RegisterSerializer(data=request.data)
        if serializer.is_valid():
            user = serializer.save()
            return Response(serializer.to_representation(user), status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class UserProfileView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        return Response(UserProfileSerializer(request.user).data)

    def put(self, request):
        serializer = UserProfileUpdateSerializer(request.user, data=request.data, context={"request": request})
        if serializer.is_valid():
            serializer.save()
            return Response({'message': 'Profile updated successfully', 'user': UserProfileSerializer(request.user).data})
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class NewsletterSubscribeView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        serializer = NewsletterSubscriptionSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        subscription, _ = NewsletterSubscription.objects.get_or_create(email=serializer.validated_data["email"])
        if not subscription.is_active:
            subscription.is_active = True
            subscription.save(update_fields=["is_active"])

        send_mail(
            "Newsletter subscription confirmed",
            "Thank you for subscribing to our updates and promotions.",
            getattr(settings, "DEFAULT_FROM_EMAIL", "no-reply@ecom.local"),
            [subscription.email],
            fail_silently=True,
        )
        return Response({"success": True, "message": "Subscription successful"}, status=status.HTTP_201_CREATED)


class ContactMessageView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        serializer = ContactMessageSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        msg = serializer.save()
        send_mail(
            "New contact message",
            f"From: {msg.name} <{msg.email}>\n\n{msg.message}",
            getattr(settings, "DEFAULT_FROM_EMAIL", "no-reply@ecom.local"),
            [getattr(settings, "CONTACT_RECEIVER_EMAIL", "support@ecom.local")],
            fail_silently=True,
        )
        return Response({"success": True, "message": "Message sent successfully"}, status=status.HTTP_201_CREATED)


class AdminDashboardView(APIView):
    permission_classes = [IsAuthenticated, IsAdminUser]

    def get(self, request):
        return Response(
            {
                "users": User.objects.count(),
                "products": Product.objects.count(),
                "orders": Order.objects.count(),
                "pending_orders": Order.objects.filter(status="pending").count(),
                "out_of_stock": Product.objects.filter(stock=0).count(),
            }
        )


class AdminUserViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = User.objects.order_by("-date_joined")
    permission_classes = [IsAuthenticated, IsAdminUser]
    serializer_class = UserProfileSerializer
