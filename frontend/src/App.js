import React, { useState } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import { AppProvider } from "./context/AppContext";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import ProtectedRoute from "./components/ProtectedRoute";
import ScrollToTop from "./components/ScrollToTop";
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
import SocialAuthPage from "./pages/SocialAuthPage";
import AdminPanelPage from "./pages/AdminPanelPage";

export default function App() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <AppProvider>
      <Router>
        <ScrollToTop />
        <div className="min-h-screen bg-gray-50 flex flex-col">
          <Navbar mobileMenuOpen={mobileMenuOpen} setMobileMenuOpen={setMobileMenuOpen} />
          <main className="flex-grow pt-20">
            <Toaster position="top-right" reverseOrder={false} />
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/shop" element={<ShopPage />} />
              <Route path="/product/:id" element={<ProductPage />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />
              <Route path="/forgot-password" element={<ForgotPasswordPage />} />
              <Route path="/reset-password/:token" element={<ResetPasswordPage />} />
              <Route path="/auth/:provider" element={<SocialAuthPage />} />
              <Route path="/men" element={<MenPage />} />
              <Route path="/women" element={<WomenPage />} />
              <Route path="/accessories" element={<AccessoriesPage />} />
              <Route path="/shoes" element={<ShoesPage />} />
              <Route path="/cart" element={<CartPage />} />
              <Route path="/orders" element={<OrderPage />} />
              <Route path="/contact" element={<ContactPage />} />
              <Route path="/about" element={<AboutPage />} />
              <Route path="/FAQs" element={<FaqsPage />} />

              <Route path="/checkout" element={<ProtectedRoute><CheckoutPage /></ProtectedRoute>} />
              <Route path="/checkout/mpesa" element={<ProtectedRoute><CheckoutMpesaPage /></ProtectedRoute>} />
              <Route path="/checkout/paypal" element={<ProtectedRoute><CheckoutPaypalPage /></ProtectedRoute>} />
              <Route path="/profile" element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />
              <Route path="/admin" element={<ProtectedRoute><AdminPanelPage /></ProtectedRoute>} />
            </Routes>
          </main>
          <Footer />
        </div>
      </Router>
    </AppProvider>
  );
}
