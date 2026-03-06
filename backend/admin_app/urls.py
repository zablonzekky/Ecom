"""
admin_app/urls.py

Already included in your ecommerce/urls.py as:
    path("api/admin/", include("admin_app.urls"))

All admin routes live under /api/admin/
"""
from django.urls import path, include
from .auth import AdminLoginView, AdminLogoutView, AdminMeView

urlpatterns = [
    # ── Authentication ─────────────────────────────────────────────────────
    path("auth/login/",   AdminLoginView.as_view(),  name="admin-login"),
    path("auth/logout/",  AdminLogoutView.as_view(), name="admin-logout"),
    path("auth/me/",      AdminMeView.as_view(),     name="admin-me"),

    # ── Users ──────────────────────────────────────────────────────────────
    path("users/",        include("admin_app.users.urls")),

    # ── Orders ─────────────────────────────────────────────────────────────
    path("orders/",       include("admin_app.orders.urls")),

    # ── Products ───────────────────────────────────────────────────────────
    path("products/",     include("admin_app.products.urls")),

    # ── Analytics ──────────────────────────────────────────────────────────
    path("analytics/",    include("admin_app.analytics.urls")),

    # ── Discounts ──────────────────────────────────────────────────────────
    path("discounts/",    include("admin_app.discounts.urls")),

    # ── Reviews ────────────────────────────────────────────────────────────
    path("reviews/",      include("admin_app.reviews.urls")),

    # ── Notifications + Activity Logs ──────────────────────────────────────
    path("notifications/", include("admin_app.notifications.urls")),
]