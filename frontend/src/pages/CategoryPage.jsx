import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { useAppContext } from "../context/AppContext";
import ProductCard from "../components/ProductCard";
import { Search, Grid, List } from "lucide-react";

function CategoryPage() {
  const { categorySlug } = useParams();
  const { products, isLoading, fetchProductsByCategory, categories } = useAppContext();
  const [searchTerm, setSearchTerm] = useState("");
  const [viewMode, setViewMode] = useState("grid");
  const [sortBy, setSortBy] = useState("featured");

  // Get category name from context for display
  const category = categories.find((c) => c.slug === categorySlug);
  const categoryName = category?.name || categorySlug.charAt(0).toUpperCase() + categorySlug.slice(1);

  useEffect(() => {
    fetchProductsByCategory(categorySlug);
  }, [categorySlug]);

  const filteredProducts = products
    .filter((p) => {
      const term = searchTerm.toLowerCase();
      const name = p?.name?.toLowerCase() || "";
      const brand = p?.brand?.toLowerCase() || "";
      const type = p?.product_type?.toLowerCase() || "";
      return name.includes(term) || brand.includes(term) || type.includes(term);
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
          return (a.name || "").localeCompare(b.name || "");
        default:
          return 0;
      }
    });

  if (isLoading)
    return <p className="text-center py-16">Loading products...</p>;

  return (
    <div className="w-full bg-gray-50">
      <div className="w-full px-4 sm:px-6 lg:px-8">
        <h1 className="text-4xl font-bold mb-6">{categoryName}</h1>

        {/* Search + Sort + View */}
        <div className="flex flex-col md:flex-row justify-between items-center gap-4 mb-8">
          <div className="relative w-full md:w-96">
            <Search
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
              size={20}
            />
            <input
              type="text"
              placeholder="Search by name, brand or type..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>

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
                className={`p-3 ${
                  viewMode === "grid"
                    ? "bg-blue-600 text-white"
                    : "bg-white text-gray-600"
                }`}
              >
                <Grid size={18} />
              </button>
              <button
                onClick={() => setViewMode("list")}
                className={`p-3 ${
                  viewMode === "list"
                    ? "bg-blue-600 text-white"
                    : "bg-white text-gray-600"
                }`}
              >
                <List size={18} />
              </button>
            </div>
          </div>
        </div>

        {filteredProducts.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredProducts.map((p) => (
              <ProductCard key={p.id} product={p} viewMode={viewMode} />
            ))}
          </div>
        ) : (
          <div className="text-center py-16 text-gray-600">
            <p className="text-5xl mb-4">🛍️</p>
            <h3 className="text-xl font-semibold">No products found</h3>
            <p>Try adjusting your search terms.</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default CategoryPage;