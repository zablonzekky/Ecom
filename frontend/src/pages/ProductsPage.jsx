import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAppContext } from "../context/AppContext";
import {
  Star,
  Heart,
  Share2,
  Truck,
  Shield,
  Check,
  ChevronLeft,
  ChevronRight,
  Package,
  Ruler,
} from "lucide-react";

function ProductPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { products, addToCart } = useAppContext();

  const [selectedImage, setSelectedImage] = useState(0);
  const [selectedSize, setSelectedSize] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState("description");
  const [isWishlisted, setIsWishlisted] = useState(false);

  // Find product by ID
  const product = products.find((p) => p.id === parseInt(id));

  useEffect(() => {
    if (!product) {
      navigate("/shop");
    }
  }, [product, navigate]);

  if (!product) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Product not found
          </h2>
          <button
            onClick={() => navigate("/shop")}
            className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition"
          >
            Back to Shop
          </button>
        </div>
      </div>
    );
  }

  const handleAddToCart = () => {
    if (!selectedSize && product.sizes && product.sizes.length > 0) {
      alert("Please select a size");
      return;
    }

    const sizeToAdd =
      product.sizes && product.sizes.length > 0 ? selectedSize : "Standard";
    addToCart(product, sizeToAdd, quantity);
    alert("Added to cart successfully!");
  };

  const handleBuyNow = () => {
    if (!selectedSize && product.sizes && product.sizes.length > 0) {
      alert("Please select a size");
      return;
    }

    const sizeToAdd =
      product.sizes && product.sizes.length > 0 ? selectedSize : "Standard";
    addToCart(product, sizeToAdd, quantity);
    navigate("/cart");
  };

  const nextImage = () => {
    if (product.images && product.images.length > 0) {
      setSelectedImage((prev) => (prev + 1) % product.images.length);
    }
  };

  const prevImage = () => {
    if (product.images && product.images.length > 0) {
      setSelectedImage(
        (prev) => (prev - 1 + product.images.length) % product.images.length
      );
    }
  };

  const renderStars = (rating) => {
    return [...Array(5)].map((_, i) => (
      <Star
        key={i}
        className={`h-4 w-4 ${
          i < Math.floor(rating)
            ? "text-yellow-400 fill-current"
            : "text-gray-300"
        }`}
      />
    ));
  };

  const displayImages =
    product.images && product.images.length > 0
      ? product.images
      : [product.primary_image];

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Breadcrumb */}
        <nav className="flex items-center space-x-2 text-sm text-gray-600 mb-8">
          <button onClick={() => navigate("/")} className="hover:text-blue-600">
            Home
          </button>
          <span>/</span>
          <button
            onClick={() => navigate("/shop")}
            className="hover:text-blue-600"
          >
            Shop
          </button>
          <span>/</span>
          <span className="text-gray-900 font-medium">{product.name}</span>
        </nav>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Image Gallery */}
          <div className="space-y-4">
            {/* Main Image */}
            <div className="relative aspect-square bg-white rounded-2xl overflow-hidden shadow-lg group">
              <img
                src={displayImages[selectedImage]}
                alt={product.name}
                className="w-full h-full object-cover"
              />

              {/* Navigation Arrows */}
              {displayImages.length > 1 && (
                <>
                  <button
                    onClick={prevImage}
                    className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white p-3 rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <ChevronLeft className="h-6 w-6 text-gray-800" />
                  </button>
                  <button
                    onClick={nextImage}
                    className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white p-3 rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <ChevronRight className="h-6 w-6 text-gray-800" />
                  </button>
                </>
              )}

              {/* Discount Badge */}
              {product.discount_percentage > 0 && (
                <div className="absolute top-4 left-4 bg-gradient-to-r from-red-500 to-pink-500 text-white px-4 py-2 rounded-full text-sm font-bold shadow-lg">
                  SAVE {product.discount_percentage}%
                </div>
              )}

              {/* Stock Badge */}
              {product.stock < 10 && (
                <div className="absolute top-4 right-4 bg-orange-500 text-white px-3 py-1.5 rounded-full text-xs font-semibold">
                  Only {product.stock} left!
                </div>
              )}
            </div>

            {/* Thumbnail Gallery */}
            {displayImages.length > 1 && (
              <div className="grid grid-cols-4 gap-3">
                {displayImages.map((image, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedImage(index)}
                    className={`aspect-square rounded-xl overflow-hidden border-2 transition-all ${
                      selectedImage === index
                        ? "border-blue-600 shadow-lg scale-105"
                        : "border-gray-200 hover:border-gray-300"
                    }`}
                  >
                    <img
                      src={image}
                      alt={`${product.name} ${index + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Product Info */}
          <div className="space-y-6">
            <div>
              {/* Wishlist + Share */}
              <div className="flex items-center justify-end mb-3 gap-2">
                <button
                  onClick={() => setIsWishlisted(!isWishlisted)}
                  className={`p-2 rounded-full border-2 transition-all ${
                    isWishlisted
                      ? "border-red-500 bg-red-50 text-red-500"
                      : "border-gray-300 hover:border-gray-400"
                  }`}
                >
                  <Heart
                    className={`h-5 w-5 ${isWishlisted ? "fill-current" : ""}`}
                  />
                </button>
                <button className="p-2 rounded-full border-2 border-gray-300 hover:border-gray-400 transition">
                  <Share2 className="h-5 w-5" />
                </button>
              </div>

              <h1 className="text-4xl font-extrabold text-gray-900 mb-4">
                {product.name}
              </h1>

              {/* Rating */}
              <div className="flex items-center gap-4 mb-4">
                <div className="flex items-center gap-1 bg-yellow-50 px-3 py-2 rounded-full">
                  {renderStars(product.average_rating)}
                  <span className="ml-2 font-bold text-gray-900">
                    {product.average_rating}
                  </span>
                </div>
                <a
                  href="#reviews"
                  className="text-blue-600 hover:underline font-medium"
                >
                  {product.review_count} reviews
                </a>
              </div>

              {/* Price */}
              <div className="flex items-baseline gap-3 mb-6">
                <span className="text-4xl font-extrabold text-gray-900">
                  KES {(product.current_price || product.price).toLocaleString()}
                </span>
                {product.discount_percentage > 0 && (
                  <>
                    <span className="text-2xl text-gray-400 line-through">
                      KES {product.price.toLocaleString()}
                    </span>
                    <span className="text-green-600 font-bold text-lg">
                      You save KES{" "}
                      {(product.price - product.current_price).toLocaleString()}
                    </span>
                  </>
                )}
              </div>
            </div>

            {/* Size Selection */}
            {product.sizes && product.sizes.length > 0 && (
              <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-bold text-lg text-gray-900">
                    Select Size
                  </h3>
                  <button className="text-blue-600 text-sm font-medium hover:underline flex items-center gap-1">
                    <Ruler className="h-4 w-4" />
                    Size Guide
                  </button>
                </div>
                <div className="grid grid-cols-5 gap-3">
                  {product.sizes.map((size) => (
                    <button
                      key={size.value}
                      onClick={() => setSelectedSize(size.value)}
                      disabled={size.stock === 0}
                      className={`relative py-3 rounded-xl font-bold text-center transition-all ${
                        size.stock === 0
                          ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                          : selectedSize === size.value
                          ? "bg-blue-600 text-white shadow-lg scale-105"
                          : "bg-gray-50 text-gray-900 hover:bg-gray-100 border-2 border-gray-200 hover:border-blue-300"
                      }`}
                    >
                      {size.value}
                      {size.stock < 5 && size.stock > 0 && (
                        <span className="absolute -top-1 -right-1 w-2 h-2 bg-orange-500 rounded-full"></span>
                      )}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Quantity */}
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
              <h3 className="font-bold text-lg mb-4 text-gray-900">Quantity</h3>
              <div className="flex items-center gap-4">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="w-12 h-12 rounded-xl border-2 border-gray-300 hover:border-blue-600 hover:bg-blue-50 transition font-bold text-xl"
                >
                  -
                </button>
                <span className="text-2xl font-bold w-16 text-center">
                  {quantity}
                </span>
                <button
                  onClick={() => setQuantity(quantity + 1)}
                  className="w-12 h-12 rounded-xl border-2 border-gray-300 hover:border-blue-600 hover:bg-blue-50 transition font-bold text-xl"
                >
                  +
                </button>
              </div>
            </div>

            {/* Add to Cart Buttons */}
            <div className="space-y-3">
              <button
                onClick={handleAddToCart}
                className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-4 rounded-xl font-bold text-lg hover:from-blue-700 hover:to-purple-700 transition shadow-lg hover:shadow-xl"
              >
                Add to Cart
              </button>
              <button
                onClick={handleBuyNow}
                className="w-full bg-gray-900 text-white py-4 rounded-xl font-bold text-lg hover:bg-gray-800 transition"
              >
                Buy Now
              </button>
            </div>

            {/* Trust Badges */}
            <div className="grid grid-cols-3 gap-4 pt-6 border-t">
              <div className="text-center">
                <Truck className="h-8 w-8 text-blue-600 mx-auto mb-2" />
                <p className="text-xs font-semibold text-gray-700">
                  Free Shipping
                </p>
                <p className="text-xs text-gray-500">Orders over 5K</p>
              </div>
              <div className="text-center">
                <Shield className="h-8 w-8 text-green-600 mx-auto mb-2" />
                <p className="text-xs font-semibold text-gray-700">
                  Secure Payment
                </p>
                <p className="text-xs text-gray-500">M-PESA Ready</p>
              </div>
              <div className="text-center">
                <Package className="h-8 w-8 text-purple-600 mx-auto mb-2" />
                <p className="text-xs font-semibold text-gray-700">
                  Easy Returns
                </p>
                <p className="text-xs text-gray-500">30 Days</p>
              </div>
            </div>
          </div>
        </div>

        {/* Product Details Tabs */}
        <div className="mt-16">
          <div className="border-b border-gray-200 bg-white rounded-t-2xl">
            <div className="flex gap-8 px-6">
              {["description", "features", "reviews"].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`py-4 font-bold capitalize transition relative ${
                    activeTab === tab
                      ? "text-blue-600"
                      : "text-gray-600 hover:text-gray-900"
                  }`}
                >
                  {tab}
                  {activeTab === tab && (
                    <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600"></div>
                  )}
                </button>
              ))}
            </div>
          </div>

          <div className="bg-white p-8 rounded-b-2xl shadow-sm border border-t-0 border-gray-100">
            {activeTab === "description" && (
              <div className="prose max-w-none">
                <p className="text-gray-700 text-lg leading-relaxed">
                  {product.description || "No description available."}
                </p>
              </div>
            )}

            {activeTab === "features" && (
              <div className="grid md:grid-cols-2 gap-4">
                {product.features && product.features.length > 0 ? (
                  product.features.map((feature, index) => (
                    <div key={index} className="flex items-start gap-3">
                      <Check className="h-6 w-6 text-green-600 flex-shrink-0 mt-0.5" />
                      <span className="text-gray-700 text-lg">{feature}</span>
                    </div>
                  ))
                ) : (
                  <p className="text-gray-600">No features listed.</p>
                )}
              </div>
            )}

            {activeTab === "reviews" && (
              <div id="reviews" className="space-y-6">
                <div className="flex items-center justify-between mb-8">
                  <div>
                    <h3 className="text-2xl font-bold text-gray-900 mb-2">
                      Customer Reviews
                    </h3>
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-1">
                        {renderStars(product.average_rating)}
                      </div>
                      <span className="text-2xl font-bold">
                        {product.average_rating}
                      </span>
                      <span className="text-gray-600">out of 5</span>
                    </div>
                  </div>
                  <button className="bg-blue-600 text-white px-6 py-3 rounded-xl font-bold hover:bg-blue-700 transition">
                    Write a Review
                  </button>
                </div>

                <div className="space-y-6">
                  {product.reviews && product.reviews.length > 0 ? (
                    product.reviews.map((review) => (
                      <div key={review.id} className="bg-gray-50 p-6 rounded-2xl">
                        <div className="flex items-start justify-between mb-3">
                          <div>
                            <div className="flex items-center gap-3 mb-2">
                              <span className="font-bold text-gray-900">
                                {review.user_name}
                              </span>
                              {review.verified && (
                                <span className="bg-green-100 text-green-700 text-xs font-semibold px-2 py-1 rounded-full flex items-center gap-1">
                                  <Check className="h-3 w-3" />
                                  Verified Purchase
                                </span>
                              )}
                            </div>
                            <div className="flex items-center gap-2">
                              <div className="flex">
                                {renderStars(review.rating)}
                              </div>
                              <span className="text-sm text-gray-500">
                                {review.date}
                              </span>
                            </div>
                          </div>
                        </div>
                        <p className="text-gray-700 leading-relaxed">
                          {review.comment}
                        </p>
                      </div>
                    ))
                  ) : (
                    <p className="text-gray-600 text-center py-8">
                      No reviews yet. Be the first to review this product!
                    </p>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default ProductPage;
