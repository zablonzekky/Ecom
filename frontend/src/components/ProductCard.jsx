import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Star, Heart, ShoppingCart, Zap, Check } from "lucide-react";
import { useAppContext } from "../context/AppContext";

function ProductCard({ product, viewMode = "grid" }) {
  const navigate = useNavigate();
  const { addToCart } = useAppContext();
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [showAddedNotif, setShowAddedNotif] = useState(false);

  const handleClick = () => {
    navigate(`/product/${product.slug}`);
  };

  const handleAddToCart = (e) => {
    e.stopPropagation();
    const defaultSize =
      product.sizes && product.sizes.length > 0
        ? product.sizes[0].value
        : "Standard";

    addToCart(product, defaultSize, 1);
    setShowAddedNotif(true);
    setTimeout(() => setShowAddedNotif(false), 2000);
  };

  const handleWishlist = (e) => {
    e.stopPropagation();
    setIsWishlisted(!isWishlisted);
  };

  const price = product.current_price || product.price;
  const originalPrice = product.discount_percentage > 0 ? product.price : null;
  const stockStatus =
    product.stock > 10
      ? "In Stock"
      : product.stock > 0
        ? "Low Stock"
        : "Out of Stock";
  const isLowStock = product.stock > 0 && product.stock <= 10;
  const isOutOfStock = product.stock === 0;
  if (viewMode === "list") {
    return (
      <div
        onClick={handleClick}
        className="bg-white rounded-xl shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden cursor-pointer border border-gray-100 flex gap-6 p-4 group"
      >
        {/* Image Section */}
        <div className="relative w-48 h-40 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
          {product.primary_image && (
            <img
              src={product.primary_image}
              alt={product.name}
              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
            />
          )}
          {product.discount_percentage > 0 && (
            <div className="absolute top-3 left-3 bg-red-600 text-white px-3 py-1 rounded-full text-xs font-bold shadow-lg">
              -{product.discount_percentage}%
            </div>
          )}
          {product.is_featured && (
            <div className="absolute top-3 right-3 bg-amber-400 text-gray-900 px-2.5 py-0.5 rounded-full text-xs font-bold flex items-center gap-1">
              <Zap size={12} className="fill-current" /> Featured
            </div>
          )}
          {isOutOfStock && (
            <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
              <span className="text-white font-bold">Out of Stock</span>
            </div>
          )}
        </div>

        {/* Content Section */}
        <div className="flex-1 flex flex-col justify-between">
          <div>
            <h3 className="font-bold text-lg mb-2 text-gray-800 group-hover:text-blue-600 transition-colors line-clamp-2">
              {product.name}
            </h3>
            <p className="text-sm text-gray-500 mb-3 line-clamp-2">
              {product.product_type}
            </p>

            {/* Rating */}
            <div className="flex items-center gap-3 mb-3">
              {product.average_rating > 0 && (
                <div className="flex items-center gap-1">
                  <div className="flex">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        size={14}
                        className={`${
                          i < Math.round(product.average_rating)
                            ? "text-yellow-400 fill-yellow-400"
                            : "text-gray-300"
                        }`}
                      />
                    ))}
                  </div>
                  <span className="text-xs font-semibold text-gray-700">
                    {product.average_rating}
                  </span>
                  <span className="text-xs text-gray-500">
                    ({product.review_count})
                  </span>
                </div>
              )}
            </div>

            {/* Stock Status */}
            <div className="mb-3">
              <span
                className={`text-xs font-semibold px-2.5 py-1 rounded-full ${
                  isOutOfStock
                    ? "bg-red-100 text-red-700"
                    : isLowStock
                      ? "bg-orange-100 text-orange-700"
                      : "bg-green-100 text-green-700"
                }`}
              >
                {stockStatus}
              </span>
            </div>
          </div>

          {/* Price & Action */}
          <div className="flex items-center justify-between pt-3 border-t border-gray-100">
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-bold text-gray-900">
                KES {price.toLocaleString()}
              </span>
              {originalPrice && (
                <span className="text-sm text-gray-400 line-through">
                  KES {originalPrice.toLocaleString()}
                </span>
              )}
            </div>
            <button
              onClick={handleAddToCart}
              disabled={isOutOfStock}
              className="flex items-center gap-2 bg-blue-700 hover:bg-blue-800 disabled:bg-gray-400 text-white px-4 py-2 rounded-lg font-semibold transition-all duration-300 text-sm"
            >
              <ShoppingCart size={16} />
              Add
            </button>
          </div>
        </div>
      </div>
    );
  }
  return (
    <div
      onClick={handleClick}
      className="bg-white rounded-2xl shadow-sm overflow-hidden cursor-pointer hover:shadow-2xl transition-all duration-300 group border border-gray-100 h-full flex flex-col relative"
    >
      {/* Image Container */}
      <div className="relative h-80 bg-gray-100 overflow-hidden">
        {product.primary_image && (
          <img
            src={product.primary_image}
            alt={product.name}
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
          />
        )}

        {/* Badges */}
        <div className="absolute top-4 right-4 flex flex-col gap-2">
          {product.discount_percentage > 0 && (
            <div className="bg-red-600 text-white px-3 py-1.5 rounded-full text-sm font-bold shadow-lg">
              -{product.discount_percentage}%
            </div>
          )}
          {product.is_featured && (
            <div className="bg-amber-400 text-gray-900 px-2.5 py-1 rounded-full text-xs font-bold flex items-center gap-1 shadow-lg">
              <Zap size={13} className="fill-current" /> Featured
            </div>
          )}
        </div>

        {/* Wishlist Button */}
        <button
          onClick={handleWishlist}
          className="absolute top-4 left-4 bg-white/90 backdrop-blur-sm rounded-full p-2.5 hover:bg-white shadow-md transition-all duration-300 opacity-0 group-hover:opacity-100"
        >
          <Heart
            size={20}
            className={`transition-all duration-300 ${
              isWishlisted
                ? "fill-red-500 text-red-500"
                : "text-gray-600 hover:text-red-500"
            }`}
          />
        </button>

        {/* Out of Stock Overlay */}
        {isOutOfStock && (
          <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
            <span className="text-white font-bold text-lg">Out of Stock</span>
          </div>
        )}

        {/* Hover Overlay */}
        <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      </div>

      {/* Content Container */}
      <div className="p-5 flex-1 flex flex-col">
        {/* Category/Type */}
        <p className="text-xs text-gray-500 font-semibold uppercase tracking-wider mb-2">
          {product.product_type}
        </p>

        {/* Product Name */}
        <h3 className="font-bold text-lg mb-3 line-clamp-2 text-gray-800 group-hover:text-blue-600 transition-colors min-h-[3.5rem]">
          {product.name}
        </h3>

        {/* Rating */}
        <div className="flex items-center mb-4">
          {product.average_rating > 0 ? (
            <div className="flex items-center gap-2">
              <div className="flex">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    size={16}
                    className={`${
                      i < Math.round(product.average_rating)
                        ? "text-yellow-400 fill-yellow-400"
                        : "text-gray-300"
                    }`}
                  />
                ))}
              </div>
              <span className="text-sm font-semibold text-gray-700">
                {product.average_rating}
              </span>
              <span className="text-xs text-gray-500">
                ({product.review_count})
              </span>
            </div>
          ) : (
            <span className="text-sm text-gray-500">No reviews yet</span>
          )}
        </div>

        {/* Stock Status */}
        <div className="mb-4">
          <span
            className={`text-xs font-semibold px-3 py-1.5 rounded-full inline-block ${
              isOutOfStock
                ? "bg-red-100 text-red-700"
                : isLowStock
                  ? "bg-orange-100 text-orange-700"
                  : "bg-green-100 text-green-700"
            }`}
          >
            {stockStatus}
            {isLowStock && ` (${product.stock} left)`}
          </span>
        </div>

        {/* Price & Button - Sticky to bottom */}
        <div className="mt-auto pt-4 border-t border-gray-100">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-bold text-gray-900">
                KES {price.toLocaleString()}
              </span>
              {originalPrice && (
                <span className="text-sm text-gray-400 line-through">
                  KES {originalPrice.toLocaleString()}
                </span>
              )}
            </div>
          </div>
          <button
            onClick={handleAddToCart}
            disabled={isOutOfStock}
            className="w-full flex items-center justify-center gap-2 bg-blue-700 hover:bg-blue-800 disabled:bg-gray-400 text-white py-3 rounded-lg font-bold transition-all duration-300 text-sm shadow-md hover:shadow-lg"
          >
            <ShoppingCart size={18} />
            Add to Cart
          </button>
        </div>
      </div>

      {/* Toast Notification - Fixed positioning */}
      {showAddedNotif && (
        <div className="fixed top-4 right-4 bg-green-500 text-white px-6 py-4 rounded-lg shadow-lg z-50 flex items-center gap-2 animate-bounce">
          <Check size={20} className="flex-shrink-0" />
          <span className="font-semibold">Product added to cart!</span>
        </div>
      )}
    </div>
  );
}

export default ProductCard;
