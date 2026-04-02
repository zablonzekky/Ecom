import React, { useState } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import { AppProvider } from "./context/AppContext";
import { AuthProvider, useAuth } from "./context/Authcontext";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import ProtectedRoute from "./components/ProtectedRoute";
import ScrollToTop from "./components/ScrollToTop";

import AdminLayout from "./components/Layout/AdminLayout";
import AdminLoginPage from "./pages/admin/Adminlogin";
import DashboardPage from "./pages/admin/Dashboard";
import UsersPage from "./pages/admin/Users";
import AdminOrdersPage from "./pages/admin/Orders";
import ProductList from "./pages/admin/ProductList";
import CreateProduct from "./pages/admin/CreateProduct";
import ProductCategories from "./pages/admin/ProductCategories";
import AnalyticsPage from "./pages/analytics/analytics";
import SettingsPage from "./pages/admin/Settings";
import { DiscountsPage } from "./Shared/Discounts";
import { ReviewsPage } from "./Shared/Reviews";
import { NotificationsPage } from "./Shared/Notifications";

// Storefront pages
import HomePage from "./pages/HomePage";
import ShopPage from "./pages/ShopPage";
import ProductPage from "./pages/ProductsPage";
import CartPage from "./pages/CartPage";
import CheckoutPage from "./pages/CheckoutPage";
import CheckoutMpesaPage from "./pages/CheckoutMpesaPage";
import CheckoutPaypalPage from "./pages/CheckoutPaypalPage";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import AccessoriesPage from "./pages/AccessoriesPage";
import ShoesPage from "./pages/ShoesPage";
import ProfilePage from "./pages/ProfilePage";
import OrderPage from "./pages/OrdersPage";
import AboutPage from "./pages/AboutPage";
import ContactPage from "./pages/ContactPage";
import MenPage from "./pages/MenPage";
import WomenPage from "./pages/WomenPage";
import FaqsPage from "./constants/FaqsPage";
import ForgotPasswordPage from "./pages/ForgotPasswordPage";
import ResetPasswordPage from "./pages/ResetPasswordPage";

// ─── Admin Protected Route ────────────────────────────────────────────────────
function AdminProtectedRoute({ children }) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "100vh" }}>
        <div className="spinner" style={{ width: 36, height: 36 }} />
      </div>
    );
  }

  // FIX: no user OR no admin token → admin login (not storefront /login)
  if (!user || !localStorage.getItem('admin_access_token')) {
    return <Navigate to="/admin/login" replace />;
  }

  // Logged in but not admin/editor → back to admin login
  if (!['admin', 'editor'].includes(user.role)) {
    return <Navigate to="/admin/login" replace />;
  }

  return children;
}

function AdminRoutes() {
  return (
    <AdminProtectedRoute>
      <AdminLayout />
    </AdminProtectedRoute>
  );
}

// ─── Storefront Layout ────────────────────────────────────────────────────────
function StorefrontLayout({ children }) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Navbar mobileMenuOpen={mobileMenuOpen} setMobileMenuOpen={setMobileMenuOpen} />
      <main className="flex-grow pt-20">{children}</main>
      <Footer />
    </div>
  );
}

// ─── Root App ─────────────────────────────────────────────────────────────────
export default function App() {
  return (
    <AuthProvider>
      <AppProvider>
        <Router future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
          <ScrollToTop />
          <Toaster
            position="top-right"
            reverseOrder={false}
            toastOptions={{
              style: {
                fontFamily: "Plus Jakarta Sans, sans-serif",
                fontSize: 13,
              },
              success: { style: { borderLeft: "4px solid var(--success)" } },
              error:   { style: { borderLeft: "4px solid var(--danger)" } },
            }}
          />
          <Routes>
            {/* ── Admin Routes (no storefront chrome) ── */}
            <Route path="/admin/login" element={<AdminLoginPage />} />
            <Route path="/admin" element={<Navigate to="/admin/dashboard" replace />} />
            <Route element={<AdminRoutes />}>
              <Route path="/admin/dashboard"            element={<DashboardPage />} />
              <Route path="/admin/users"                element={<UsersPage />} />
              <Route path="/admin/customers"            element={<UsersPage />} />
              <Route path="/admin/orders"               element={<AdminOrdersPage />} />
              <Route path="/admin/orders/refunds"       element={<AdminOrdersPage />} />
              <Route path="/admin/products"             element={<ProductList />} />
              <Route path="/admin/products/create"      element={<CreateProduct />} />
              <Route path="/admin/products/categories"  element={<ProductCategories />} />
              <Route path="/admin/analytics"            element={<AnalyticsPage />} />
              <Route path="/admin/analytics/sales"      element={<AnalyticsPage />} />
              <Route path="/admin/discounts"            element={<DiscountsPage />} />
              <Route path="/admin/promotions"           element={<DiscountsPage />} />
              <Route path="/admin/reviews"              element={<ReviewsPage />} />
              <Route path="/admin/notifications"        element={<NotificationsPage />} />
              <Route path="/admin/logs"                 element={<NotificationsPage />} />
              <Route path="/admin/settings"             element={<SettingsPage />} />
              <Route path="/admin/settings/*"           element={<SettingsPage />} />
            </Route>

            {/* ── Storefront Routes (with Navbar + Footer) ── */}
            <Route
              path="*"
              element={
                <StorefrontLayout>
                  <Routes>
                    {/* Public */}
                    <Route path="/"                           element={<HomePage />} />
                    <Route path="/shop"                       element={<ShopPage />} />
                    <Route path="/product/:id"                element={<ProductPage />} />
                    <Route path="/login"                      element={<LoginPage />} />
                    <Route path="/register"                   element={<RegisterPage />} />
                    <Route path="/forgot-password"            element={<ForgotPasswordPage />} />
                    <Route path="/reset-password/:uid/:token" element={<ResetPasswordPage />} />
                    <Route path="/men"                        element={<MenPage />} />
                    <Route path="/women"                      element={<WomenPage />} />
                    <Route path="/accessories"                element={<AccessoriesPage />} />
                    <Route path="/shoes"                      element={<ShoesPage />} />
                    <Route path="/cart"                       element={<CartPage />} />
                    <Route path="/orders"                     element={<OrderPage />} />
                    <Route path="/contact"                    element={<ContactPage />} />
                    <Route path="/about"                      element={<AboutPage />} />
                    <Route path="/FAQs"                       element={<FaqsPage />} />

                    {/* Protected storefront routes */}
                    <Route path="/checkout"         element={<ProtectedRoute><CheckoutPage /></ProtectedRoute>} />
                    <Route path="/checkout/mpesa"   element={<ProtectedRoute><CheckoutMpesaPage /></ProtectedRoute>} />
                    <Route path="/checkout/paypal"  element={<ProtectedRoute><CheckoutPaypalPage /></ProtectedRoute>} />
                    <Route path="/profile"          element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />
                  </Routes>
                </StorefrontLayout>
              }
            />
          </Routes>
        </Router>
      </AppProvider>
    </AuthProvider>
  );
}