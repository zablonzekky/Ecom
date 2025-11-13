import { useAppContext } from "../context/AppContext";
import React, { useEffect, useState } from "react";
import ProductCard from "../components/ProductCard";

function AccessoriesPage() {
  const { products } = useAppContext();
  const [accessoryImages, setAccessoryImages] = useState({});

  // Fetch images from Unsplash API
  useEffect(() => {
    const fetchAccessoryImages = async () => {
      const imageMap = {};
      const searchTerms = {
        watch: "luxury watch",
        sunglasses: "designer sunglasses",
        jewelry: "fashion jewelry",
        belt: "leather belt",
        bag: "designer handbag",
      };

      try {
        for (const [type, query] of Object.entries(searchTerms)) {
          const res = await fetch(
            `https://api.unsplash.com/search/photos?page=1&query=${query}&client_id=YOUR_UNSPLASH_ACCESS_KEY&per_page=10`
          );
          const data = await res.json();

          if (data.results && data.results.length > 0) {
            imageMap[type] = data.results.map((photo) => ({
              url: photo.urls.regular,
              alt: photo.alt_description || `${type} image`,
              photographer: photo.user.name,
            }));
          }
        }
        setAccessoryImages(imageMap);
      } catch (err) {
        console.error("Error fetching accessory images:", err);
      }
    };

    fetchAccessoryImages();
  }, []);

  // Select only accessory-type products
  const accessoryProducts = products.filter((product) =>
    ["watch", "sunglasses", "jewelry", "belt", "bag"].includes(
      product.product_type?.toLowerCase()
    )
  );

  // Attach Unsplash images dynamically
  const enhancedProducts = accessoryProducts.map((product) => {
    const type = product.product_type?.toLowerCase();
    const images = accessoryImages[type];

    return {
      ...product,
      image:
        images && images.length > 0
          ? images[Math.floor(Math.random() * images.length)].url
          : product.image,
      imageAlt: images
        ? `Premium ${type} from our accessories collection`
        : product.title,
    };
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {/* Header */}
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          Premium Accessories
        </h1>
        <p className="text-lg text-gray-600 max-w-2xl mx-auto">
          Discover timeless pieces that complement your style — from luxury
          watches to elegant jewelry and everyday essentials.
        </p>
      </div>

      {/* Products Section */}
      <div className="mb-6 text-gray-600 text-lg">
        Showing {enhancedProducts.length} accessories
      </div>

      {/* Conditional Rendering */}
      {Object.keys(accessoryImages).length === 0 &&
        enhancedProducts.length > 0 && (
          <div className="text-sm text-blue-600 mb-6 animate-pulse">
            Fetching premium accessory images...
          </div>
        )}

      {enhancedProducts.length === 0 ? (
        <div className="text-center py-20">
          <div className="text-gray-400 text-6xl mb-4">👜</div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">
            No accessories available
          </h3>
          <p className="text-gray-600">
            Please check back later for new arrivals.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {enhancedProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}
    </div>
  );
}

export default AccessoriesPage;
