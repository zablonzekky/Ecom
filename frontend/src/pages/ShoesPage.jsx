import React, { useState } from "react";
import { Search, Grid, List } from "lucide-react";
import ProductCard from "../components/ProductCard";

function ShoesPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [viewMode, setViewMode] = useState("grid");
  const [sortBy, setSortBy] = useState("featured");

  // ✅ Clean dummy data with real image URLs
  const shoesData = [
    {
      id: 1,
      title: "Nike Air Max 270",
      brand: "Nike",
      description: "Modern lifestyle sneakers with maximal cushioning.",
      price: 12999,
      current_price: 10999,
      rating: 4.7,
      product_type: "sneakers",
      category_name: "men",
      image:
        "https://images.unsplash.com/photo-1606813902902-9cfec0e4e827?auto=format&fit=crop&w=800&q=80",
    },
    {
      id: 2,
      title: "Adidas Ultraboost 21",
      brand: "Adidas",
      description: "Premium running shoes with responsive cushioning.",
      price: 15999,
      current_price: 13999,
      rating: 4.8,
      product_type: "running",
      category_name: "unisex",
      image:
        "https://images.unsplash.com/photo-1618354691373-4a3b1fef0e0b?auto=format&fit=crop&w=800&q=80",
    },
    {
      id: 3,
      title: "Classic Leather Loafers",
      brand: "Clarks",
      description: "Elegant leather loafers for formal occasions.",
      price: 8900,
      current_price: 7500,
      rating: 4.5,
      product_type: "formal",
      category_name: "men",
      image:
        "https://images.unsplash.com/photo-1600181952037-7c7a6e4f67b5?auto=format&fit=crop&w=800&q=80",
    },
    {
      id: 4,
      title: "Nike Dunk Low Retro",
      brand: "Nike",
      description: "Iconic basketball-inspired lifestyle sneakers.",
      price: 11999,
      current_price: 10999,
      rating: 4.6,
      product_type: "sneakers",
      category_name: "unisex",
      image:
        "https://images.unsplash.com/photo-1618354691533-47e8a6ebdf2f?auto=format&fit=crop&w=800&q=80",
    },
    {
      id: 5,
      title: "Hiking Boots Pro",
      brand: "Merrell",
      description: "Professional hiking boots for outdoor adventures.",
      price: 14500,
      current_price: 12500,
      rating: 4.8,
      product_type: "hiking",
      category_name: "unisex",
      image:
        "https://images.unsplash.com/photo-1579338556884-c3d8c7a1fc97?auto=format&fit=crop&w=800&q=80",
    },
    {
      id: 6,
      title: "Women's Fashion Heels",
      brand: "Steve Madden",
      description: "Elegant high heels for special occasions.",
      price: 6800,
      current_price: 5500,
      rating: 4.3,
      product_type: "heels",
      category_name: "women",
      image:
        "https://images.unsplash.com/photo-1567016562382-e3c11341e2d4?auto=format&fit=crop&w=800&q=80",
    },
  ];

  // ✅ Filter + sort logic (safe from undefined errors)
  const filteredProducts = shoesData
    .filter((shoe) => {
      const title = shoe?.title?.toLowerCase() || "";
      const brand = shoe?.brand?.toLowerCase() || "";
      const type = shoe?.product_type?.toLowerCase() || "";
      const term = searchTerm.toLowerCase();

      return (
        title.includes(term) || brand.includes(term) || type.includes(term)
      );
    })
    .sort((a, b) => {
      switch (sortBy) {
        case "price-low":
          return (a.current_price || a.price) - (b.current_price || b.price);
        case "price-high":
          return (b.current_price || b.price) - (a.current_price || a.price);
        case "rating":
          return (b.rating || 0) - (a.rating || 0);
        case "name":
          return a.title.localeCompare(b.title);
        default:
          return 0;
      }
    });

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Hero Section */}
      <div className="text-center mb-10">
        <h1 className="text-4xl font-bold text-gray-900 mb-2">Step Into Style</h1>
        <p className="text-gray-600 text-lg">
          Find your perfect pair — comfort, quality, and confidence in every step.
        </p>
      </div>

      {/* Search + Controls */}
      <div className="flex flex-col md:flex-row justify-between items-center gap-4 mb-8">
        {/* Search */}
        <div className="relative w-full md:w-96">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
          <input
            type="text"
            placeholder="Search by name or brand..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Sort + View */}
        <div className="flex items-center gap-4">
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          >
            <option value="featured">Featured</option>
            <option value="price-low">Price: Low to High</option>
            <option value="price-high">Price: High to Low</option>
            <option value="rating">Top Rated</option>
            <option value="name">Name A–Z</option>
          </select>

          <div className="flex border border-gray-300 rounded-lg overflow-hidden">
            <button
              onClick={() => setViewMode("grid")}
              className={`p-3 ${viewMode === "grid" ? "bg-blue-600 text-white" : "bg-white text-gray-600"}`}
            >
              <Grid size={18} />
            </button>
            <button
              onClick={() => setViewMode("list")}
              className={`p-3 ${viewMode === "list" ? "bg-blue-600 text-white" : "bg-white text-gray-600"}`}
            >
              <List size={18} />
            </button>
          </div>
        </div>
      </div>

      {/* Product Grid */}
      {filteredProducts.length > 0 ? (
        <div
          className={`${
            viewMode === "grid"
              ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
              : "space-y-6"
          }`}
        >
          {filteredProducts.map((shoe) => (
            <ProductCard key={shoe.id} product={shoe} viewMode={viewMode} />
          ))}
        </div>
      ) : (
        <div className="text-center py-16 text-gray-600">
          <p className="text-5xl mb-4">👟</p>
          <h3 className="text-xl font-semibold">No shoes found</h3>
          <p>Try adjusting your search terms.</p>
        </div>
      )}
    </div>
  );
}

export default ShoesPage;
