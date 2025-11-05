// src/components/ProductCard.jsx
import React from "react";
import { useNavigate } from "react-router-dom";
import { Star } from "lucide-react";

function ProductCard({ product }) {
  const navigate = useNavigate();

  const handleClick = () => {
    navigate(`/product/${product.id}`);
  };

  const price = product.current_price || product.price;
  const originalPrice = product.discount_percentage > 0 ? product.price : null;

  return (
    <div
      onClick={handleClick}
      className="bg-white rounded-2xl shadow-sm overflow-hidden cursor-pointer hover:shadow-2xl transition-all duration-300 group border border-gray-100"
    >
      <div className="relative h-72 bg-gradient-to-br from-gray-100 to-gray-200 overflow-hidden">
        {product.primary_image && (
          <img
            src={product.primary_image}
            alt={product.name}
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
          />
        )}
        {product.discount_percentage > 0 && (
          <div className="absolute top-4 right-4 bg-gradient-to-r from-red-500 to-pink-500 text-white px-3 py-1.5 rounded-full text-sm font-bold shadow-lg">
            -{product.discount_percentage}%
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      </div>
      <div className="p-5">
        <h3 className="font-bold text-lg mb-2 truncate text-gray-800 group-hover:text-blue-600 transition-colors">
          {product.name}
        </h3>
        <div className="flex items-center mb-3">
          {product.average_rating > 0 && (
            <>
              <div className="flex items-center bg-yellow-50 px-2 py-1 rounded-full">
                <Star className="h-4 w-4 text-yellow-500 fill-current" />
                <span className="ml-1 text-sm font-semibold text-gray-700">
                  {product.average_rating}
                </span>
              </div>
              <span className="ml-2 text-sm text-gray-500">
                ({product.review_count})
              </span>
            </>
          )}
        </div>
        <div className="flex items-center justify-between">
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
      </div>
    </div>
  );
}

export default ProductCard;