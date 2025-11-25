// src/App.js
import React, { useState } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import { AppProvider } from "./context/AppContext";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import ProtectedRoute from "./components/ProtectedRoute";
import HomePage from "./pages/HomePage";
import ShopPage from "./pages/ShopPage";
import ProductPage from "./pages/ProductsPage";
import CartPage from "./pages/CartPage";
import CheckoutPage from "./pages/CheckoutPage";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import AccessoriesPage from "./pages/AccessoriesPage";
import ShoesPage from "./pages/ShoesPage";
import ProfilePage from "./pages/ProfilePage";
import OrderPage from "./pages/OrdersPage";
import AboutPage from "./constants/AboutPage" ;
import ContagePage from "./pages/ContactPage";
import MenPage from "./pages/MenPage";
import WomenPage from "./pages/WomenPage";
import FaqsPage from "./constants/FaqsPage";

export default function App() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <AppProvider>
      <Router>
        <div className="min-h-screen bg-gray-50 flex flex-col">
          <Navbar
            mobileMenuOpen={mobileMenuOpen}
            setMobileMenuOpen={setMobileMenuOpen}
          />

          {/* Main content area with proper spacing for fixed navbar */}
          <main className="flex-grow pt-20">
            <Toaster position="top-right" reverseOrder={false} />
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/shop" element={<ShopPage />} />
              <Route path="/product/:id" element={<ProductPage />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />
              <Route path="/men" element={<MenPage />} />
              <Route path="/women" element={<WomenPage />} />
              <Route path="/accessories" element={<AccessoriesPage />} />
              <Route path="/shoes" element={<ShoesPage />} />

              {/* PUBLIC Routes - Anyone can view */}
              <Route path="/cart" element={<CartPage />} />
              <Route path="/orders" element={<OrderPage />} />
              <Route path="/contact" element={<ContagePage />} />
              <Route path="/about" element={<AboutPage />} />
              <Route path="/FAQs" element={<FaqsPage />} />

              {/* Protected Routes - Login Required */}
              <Route
                path="/checkout"
                element={
                  <ProtectedRoute>
                    <CheckoutPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/profile"
                element={
                  <ProtectedRoute>
                    <ProfilePage />
                  </ProtectedRoute>
                }
              />
            </Routes>
          </main>

          <Footer />
        </div>
      </Router>
    </AppProvider>
  );
}