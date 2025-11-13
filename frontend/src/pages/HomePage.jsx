// src/pages/HomePage.jsx
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAppContext } from "../context/AppContext";
import { ArrowRight, Truck, Shield, RefreshCw, Star } from "lucide-react";
import ProductCard from "../components/ProductCard";
import Layout from "../components/Layout";

function HomePage() {
  const { products = [] } = useAppContext();
  const navigate = useNavigate();
  const featuredProducts = Array.isArray(products)
    ? products.filter((p) => p.is_featured).slice(0, 8)
    : [];

  // Carousel state
  const heroImages = [
    "https://images.unsplash.com/photo-1503341455253-b2e723bb3dbb?auto=format&fit=crop&w=1200&q=80",
    "https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?auto=format&fit=crop&w=1200&q=80",
    "https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=1200&q=80",
  ];
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(
      () => setCurrentIndex((prev) => (prev + 1) % heroImages.length),
      5000
    );
    return () => clearInterval(timer);
  }, [heroImages.length]);

  return (
    <Layout>
    <div className="min-h-screen bg-[#F4EDE4]">
      {/* Hero Section */}
      <section className="relative h-[85vh] w-full overflow-hidden">
        {heroImages.map((img, i) => (
          <div
            key={i}
            className={`absolute inset-0 transition-opacity duration-1000 ${
              i === currentIndex ? "opacity-100" : "opacity-0"
            }`}
            style={{
              backgroundImage: `url(${img})`,
              backgroundSize: "cover",
              backgroundPosition: "center",
            }}
          ></div>
        ))}

        <div className="absolute inset-0 bg-gradient-to-t from-[#4E3B2C]/70 via-[#4E3B2C]/40 to-transparent"></div>

        <div className="relative z-10 flex flex-col justify-center items-start h-full max-w-6xl mx-auto px-6">
          <h1 className="text-5xl md:text-6xl font-bold text-white leading-tight mb-6 drop-shadow-lg">
            Elevate Your Everyday Style
          </h1>
          <p className="text-lg md:text-xl text-[#F8EAD8] mb-8 max-w-2xl">
            Discover timeless pieces crafted with care — where comfort meets
            modern design.
          </p>
          <button
            onClick={() => navigate("/shop")}
            className="bg-[#A6754D] text-white px-8 py-4 rounded-lg font-semibold hover:bg-[#8D5F3B] transition flex items-center gap-2"
          >
            Shop Now <ArrowRight className="h-5 w-5" />
          </button>
        </div>

        {/* Carousel indicators */}
        <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 flex space-x-2">
          {heroImages.map((_, i) => (
            <button
              key={i}
              onClick={() => setCurrentIndex(i)}
              className={`h-3 w-3 rounded-full transition-all ${
                i === currentIndex ? "bg-white w-6" : "bg-white/60"
              }`}
            ></button>
          ))}
        </div>
      </section>

      {/* Features */}
      <section className="py-20 bg-[#FAF6F0]">
        <div className="max-w-6xl mx-auto px-6 text-center">
          <h2 className="text-3xl font-semibold text-[#4E3B2C] mb-12">
            Why Shop With Us
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
            {[
              {
                icon: <Truck className="h-10 w-10 text-[#A6754D]" />,
                title: "Free Delivery",
                desc: "Enjoy free shipping on orders above KES 5,000.",
              },
              {
                icon: <Shield className="h-10 w-10 text-[#A6754D]" />,
                title: "Secure Payments",
                desc: "Shop with confidence through protected checkout.",
              },
              {
                icon: <RefreshCw className="h-10 w-10 text-[#A6754D]" />,
                title: "Easy Returns",
                desc: "Hassle-free 30-day returns on all purchases.",
              },
            ].map((feature, i) => (
              <div
                key={i}
                className="bg-[#F4EDE4] border border-[#DCC7AA] rounded-xl py-10 px-6 hover:shadow-md transition"
              >
                <div className="mb-4 flex justify-center">{feature.icon}</div>
                <h3 className="text-xl font-semibold text-[#4E3B2C] mb-2">
                  {feature.title}
                </h3>
                <p className="text-[#7C6652]">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Products */}
      <section className="py-20 bg-[#F4EDE4]">
        <div className="max-w-7xl mx-auto px-6 text-center">
          <h2 className="text-3xl font-semibold text-[#4E3B2C] mb-12">
            Featured Products
          </h2>

          {featuredProducts.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
              {featuredProducts.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <Star className="h-16 w-16 text-[#A6754D] mx-auto mb-4" />
              <p className="text-[#7C6652] text-lg mb-4">
                No featured products found.
              </p>
              <button
                onClick={() => navigate("/shop")}
                className="bg-[#A6754D] text-white px-8 py-3 rounded-lg hover:bg-[#8D5F3B] transition"
              >
                Browse All Products
              </button>
            </div>
          )}
        </div>
      </section>

      {/* Newsletter */}
      <section className="py-20 bg-[#E8DCC4] text-center">
        <div className="max-w-4xl mx-auto px-6">
          <h2 className="text-3xl font-semibold text-[#4E3B2C] mb-4">
            Stay in the Loop
          </h2>
          <p className="text-[#7C6652] mb-8">
            Be the first to know about new arrivals and exclusive offers.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <input
              type="email"
              placeholder="Enter your email"
              className="px-4 py-3 rounded-lg flex-1 text-[#4E3B2C] focus:outline-none border border-[#DCC7AA]"
            />
            <button className="bg-[#A6754D] text-white px-6 py-3 rounded-lg font-semibold hover:bg-[#8D5F3B] transition">
              Subscribe
            </button>
          </div>
        </div>
      </section>
    </div>
        </Layout>
  );
}

export default HomePage;
