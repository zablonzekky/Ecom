from django.contrib.auth import get_user_model
from django.core.mail import send_mail
from django.conf import settings

from rest_framework import status, viewsets
from rest_framework.permissions import IsAuthenticated, AllowAny, IsAdminUser
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.decorators import api_view, permission_classes
from rest_framework_simplejwt.tokens import RefreshToken

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

User = get_user_model()


# SOCIAL AUTH
@api_view(["GET"])
@permission_classes([IsAuthenticated])
def social_auth_token(request):
    refresh = RefreshToken.for_user(request.user)
    return Response({
        "tokens": {
            "refresh": str(refresh),
            "access": str(refresh.access_token),
        },
        "email": request.user.email,
        "first_name": request.user.first_name,
        "last_name": request.user.last_name,
    })


# REGISTER
class RegisterView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        serializer = RegisterSerializer(data=request.data)
        if serializer.is_valid():
            user = serializer.save()
            return Response(
                serializer.to_representation(user),
                status=status.HTTP_201_CREATED,
            )
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


# USER PROFILE
class UserProfileView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        return Response(UserProfileSerializer(request.user).data)

    def put(self, request):
        serializer = UserProfileUpdateSerializer(
            request.user,
            data=request.data,
            context={"request": request},
        )
        if serializer.is_valid():
            serializer.save()
            return Response({
                "message": "Profile updated successfully.",
                "user": UserProfileSerializer(request.user).data,
            })
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


# NEWSLETTER (public subscribe)
class NewsletterSubscribeView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        serializer = NewsletterSubscriptionSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        email = serializer.validated_data["email"]
        existing = NewsletterSubscription.objects.filter(email=email).first()

        if existing:
            if existing.is_active:
                return Response(
                    {"email": ["Already subscribed."]},
                    status=status.HTTP_400_BAD_REQUEST,
                )
            existing.is_active = True
            existing.save(update_fields=["is_active"])
            subscription = existing
        else:
            subscription = NewsletterSubscription.objects.create(email=email)

        send_mail(
            "Newsletter subscription confirmed",
            "Thanks for subscribing!",
            getattr(settings, "DEFAULT_FROM_EMAIL", "no-reply@ecom.local"),
            [subscription.email],
            fail_silently=True,
        )

        return Response(
            {"success": True, "message": "Subscription successful."},
            status=status.HTTP_201_CREATED,
        )


# CONTACT (public submit)
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

        return Response(
            {"success": True, "message": "Message sent successfully."},
            status=status.HTTP_201_CREATED,
        )


# ADMIN DASHBOARD
class AdminDashboardView(APIView):
    permission_classes = [IsAuthenticated, IsAdminUser]

    def get(self, request):
        return Response({
            "users": User.objects.count(),
            "products": Product.objects.count(),
            "orders": Order.objects.count(),
            "pending_orders": Order.objects.filter(status="pending").count(),
            "out_of_stock": Product.objects.filter(stock=0).count(),
        })


# ADMIN USERS
class AdminUserViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = User.objects.order_by("-date_joined")
    serializer_class = UserProfileSerializer
    permission_classes = [IsAuthenticated, IsAdminUser]


# ADMIN NEWSLETTER
class AdminNewsletterView(APIView):
    permission_classes = [IsAuthenticated, IsAdminUser]

    def get(self, request):
        subs = NewsletterSubscription.objects.order_by("-created_at")
        return Response(NewsletterSubscriptionSerializer(subs, many=True).data)


# ADMIN CONTACT MESSAGES
class AdminContactMessageView(APIView):
    permission_classes = [IsAuthenticated, IsAdminUser]

    def get(self, request):
        msgs = ContactMessage.objects.order_by("-created_at")
        return Response(ContactMessageSerializer(msgs, many=True).data)
# ADMIN REPLY TO CONTACT MESSAGE
class AdminReplyContactMessageView(APIView):
    permission_classes = [IsAuthenticated, IsAdminUser]

    def post(self, request, pk):
        try:
            msg = ContactMessage.objects.get(pk=pk)
        except ContactMessage.DoesNotExist:
            return Response({"error": "Message not found."}, status=status.HTTP_404_NOT_FOUND)

        reply_body = request.data.get("reply", "").strip()
        if not reply_body:
            return Response({"error": "Reply cannot be empty."}, status=status.HTTP_400_BAD_REQUEST)

        sent = send_mail(
            subject=f"Re: Message from {msg.name}",
            message=f"Hi {msg.name},\n\n{reply_body}\n\nBest regards,\nEcombay Support Team",
            from_email=getattr(settings, "DEFAULT_FROM_EMAIL", "support@ecombay.com"),
            recipient_list=[msg.email],
            fail_silently=False,
        )

        if sent:
            return Response({"success": True, "message": f"Reply sent to {msg.email}."})
        return Response({"error": "Failed to send email."}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)