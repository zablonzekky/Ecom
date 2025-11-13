import { useAppContext } from "../context/AppContext";
import React from "react";
import ProductCard from "../components/ProductCard";

function ShopPage() {
  const { products } = useAppContext();

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <h1 className="text-3xl font-bold mb-6 text-gray-900">Shop All Products</h1>

      <div className="mb-4 text-gray-600">
        Showing {products.length} products
      </div>

      {products.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      ) : (
        <p className="text-gray-500">No products available at the moment.</p>
      )}
    </div>
  );
}

export default ShopPage;
