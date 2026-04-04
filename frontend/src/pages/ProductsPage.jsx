import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Star, Heart, ChevronLeft, ChevronRight, Check, ShoppingCart } from "lucide-react";
import { useAppContext } from "../context/AppContext";

function ProductPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { selectedProduct, fetchProductBySlug, addToCart, user, isLoading } = useAppContext();

  const [selectedImage, setSelectedImage] = useState(0);
  const [selectedSize, setSelectedSize] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState("description");
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [cartState, setCartState] = useState("idle"); // idle | added
  const [showToast, setShowToast] = useState(false);

  useEffect(() => {
    fetchProductBySlug(id);
    // Reset UI state when navigating between products
    setSelectedImage(0);
    setSelectedSize("");
    setQuantity(1);
    setActiveTab("description");
  }, [id]);

  const product = selectedProduct;

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-sm text-gray-400">Loading product…</p>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-500 mb-4">Product not found.</p>
          <button onClick={() => navigate("/shop")} className="text-sm text-blue-600 underline">
            Back to Shop
          </button>
        </div>
      </div>
    );
  }

  // DetailSerializer returns images as [{id, image, alt_text, ...}], extract URLs
  const rawImages = product.images?.length > 0 ? product.images : null;
  const displayImages = rawImages
    ? rawImages.map((img) => (typeof img === "string" ? img : img.image))
    : [product.primary_image];

  const price = parseFloat(product.current_price || product.price);
  const originalPrice =
    product.discount_percentage > 0 ? parseFloat(product.price) : null;

  const triggerToast = () => {
    setShowToast(true);
    setTimeout(() => setShowToast(false), 2500);
  };

  const handleAddToCart = () => {
    if (product.sizes?.length > 0 && !selectedSize) return;
    const size = product.sizes?.length > 0 ? selectedSize : "Standard";
    addToCart(product, size, quantity);
    setCartState("added");
    triggerToast();
    setTimeout(() => setCartState("idle"), 2500);
  };

  const handleBuyNow = () => {
    if (product.sizes?.length > 0 && !selectedSize) return;
    const size = product.sizes?.length > 0 ? selectedSize : "Standard";
    addToCart(product, size, quantity);
    navigate("/cart");
  };

  const Stars = ({ rating, size = 16 }) =>
    [...Array(5)].map((_, i) => (
      <Star
        key={i}
        size={size}
        className={
          i < Math.floor(rating)
            ? "text-yellow-400 fill-yellow-400"
            : "text-gray-200 fill-gray-200"
        }
      />
    ));

  return (
    <div className="min-h-screen bg-white">

      {/* ── Toast ── */}
      {showToast && (
        <div className="fixed top-5 right-5 z-50 flex items-center gap-3 bg-green-500 text-white px-5 py-3.5 rounded-xl shadow-lg">
          <Check size={18} className="flex-shrink-0" />
          <span className="text-sm font-semibold">Product added to cart!</span>
        </div>
      )}

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10">

        {/* Breadcrumb */}
        <nav className="text-sm text-gray-400 mb-8 flex items-center gap-1.5">
          <button onClick={() => navigate("/")} className="hover:text-gray-700 transition">Home</button>
          <span>/</span>
          <button onClick={() => navigate("/shop")} className="hover:text-gray-700 transition">Shop</button>
          <span>/</span>
          <span className="text-gray-800">{product.name}</span>
        </nav>

        {/* Main Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">

          {/* ── Images ── */}
          <div className="space-y-3">
            <div className="relative aspect-square bg-gray-50 rounded-xl overflow-hidden group">
              <img
                src={displayImages[selectedImage]}
                alt={product.name}
                className="w-full h-full object-cover"
              />
              {displayImages.length > 1 && (
                <>
                  <button
                    onClick={() =>
                      setSelectedImage(
                        (prev) => (prev - 1 + displayImages.length) % displayImages.length
                      )
                    }
                    className="absolute left-3 top-1/2 -translate-y-1/2 bg-white p-2 rounded-full shadow opacity-0 group-hover:opacity-100 transition"
                  >
                    <ChevronLeft size={18} />
                  </button>
                  <button
                    onClick={() =>
                      setSelectedImage((prev) => (prev + 1) % displayImages.length)
                    }
                    className="absolute right-3 top-1/2 -translate-y-1/2 bg-white p-2 rounded-full shadow opacity-0 group-hover:opacity-100 transition"
                  >
                    <ChevronRight size={18} />
                  </button>
                </>
              )}
              {product.discount_percentage > 0 && (
                <span className="absolute top-3 left-3 bg-red-500 text-white text-xs font-semibold px-2.5 py-1 rounded-full">
                  -{product.discount_percentage}%
                </span>
              )}
            </div>

            {displayImages.length > 1 && (
              <div className="flex gap-2">
                {displayImages.map((img, i) => (
                  <button
                    key={i}
                    onClick={() => setSelectedImage(i)}
                    className={`w-16 h-16 rounded-lg overflow-hidden border-2 transition ${
                      selectedImage === i
                        ? "border-gray-900"
                        : "border-transparent hover:border-gray-300"
                    }`}
                  >
                    <img src={img} alt="" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* ── Info ── */}
          <div className="flex flex-col gap-6">

            <div className="flex items-start justify-between gap-4">
              <h1 className="text-3xl font-bold text-gray-900 leading-tight">
                {product.name}
              </h1>
              <button
                onClick={() => setIsWishlisted(!isWishlisted)}
                className="flex-shrink-0 p-2 rounded-full border border-gray-200 hover:border-gray-400 transition"
              >
                <Heart
                  size={18}
                  className={isWishlisted ? "fill-red-500 text-red-500" : "text-gray-400"}
                />
              </button>
            </div>

            {/* Rating */}
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-0.5">
                <Stars rating={product.average_rating || 0} />
              </div>
              <span className="text-sm text-gray-500">
                {product.average_rating > 0
                  ? `${product.average_rating} · ${product.review_count} review${product.review_count !== 1 ? "s" : ""}`
                  : "No reviews yet"}
              </span>
            </div>

            {/* Price */}
            <div className="flex items-baseline gap-3">
              <span className="text-3xl font-bold text-gray-900">
                KES {price.toLocaleString()}
              </span>
              {originalPrice && (
                <>
                  <span className="text-lg text-gray-400 line-through">
                    KES {originalPrice.toLocaleString()}
                  </span>
                  <span className="text-sm text-green-600 font-medium">
                    Save KES {(originalPrice - price).toLocaleString()}
                  </span>
                </>
              )}
            </div>

            <hr className="border-gray-100" />

            {/* Sizes */}
            {product.sizes?.length > 0 && (
              <div>
                <p className="text-sm font-semibold text-gray-700 mb-2.5">Size</p>
                <div className="flex flex-wrap gap-2">
                  {product.sizes.map((s) => (
                    <button
                      key={s.value}
                      onClick={() => s.stock > 0 && setSelectedSize(s.value)}
                      disabled={s.stock === 0}
                      className={`px-4 py-2 rounded-lg text-sm font-medium border transition ${
                        s.stock === 0
                          ? "border-gray-100 text-gray-300 cursor-not-allowed bg-gray-50"
                          : selectedSize === s.value
                          ? "border-gray-900 bg-gray-900 text-white"
                          : "border-gray-200 text-gray-700 hover:border-gray-400"
                      }`}
                    >
                      {s.value}
                    </button>
                  ))}
                </div>
                {!selectedSize && (
                  <p className="text-xs text-red-500 mt-1.5">Please select a size</p>
                )}
              </div>
            )}

            {/* Quantity */}
            <div>
              <p className="text-sm font-semibold text-gray-700 mb-2.5">Quantity</p>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                  className="w-9 h-9 rounded-lg border border-gray-200 hover:border-gray-400 flex items-center justify-center text-gray-600 font-medium transition"
                >
                  −
                </button>
                <span className="w-8 text-center font-semibold text-gray-900">{quantity}</span>
                <button
                  onClick={() => setQuantity((q) => q + 1)}
                  className="w-9 h-9 rounded-lg border border-gray-200 hover:border-gray-400 flex items-center justify-center text-gray-600 font-medium transition"
                >
                  +
                </button>
              </div>
            </div>

            {/* Stock */}
            <div>
              {product.stock === 0 ? (
                <span className="text-sm text-red-500 font-medium">Out of stock</span>
              ) : product.stock <= 10 ? (
                <span className="text-sm text-orange-500 font-medium">Only {product.stock} left</span>
              ) : (
                <span className="text-sm text-green-600 font-medium">In stock</span>
              )}
            </div>

            {/* Actions — blue → green on add */}
            <div className="flex gap-3">
              <button
                onClick={handleAddToCart}
                disabled={product.stock === 0}
                className={`flex-1 py-3 rounded-xl text-sm font-semibold flex items-center justify-center gap-2 transition-all duration-300 disabled:opacity-40 disabled:cursor-not-allowed ${
                  cartState === "added"
                    ? "bg-green-500 text-white"
                    : "bg-blue-600 hover:bg-blue-700 text-white"
                }`}
              >
                {cartState === "added" ? (
                  <><Check size={16} /> Added!</>
                ) : (
                  <><ShoppingCart size={16} /> Add to Cart</>
                )}
              </button>

              <button
                onClick={handleBuyNow}
                disabled={product.stock === 0}
                className="flex-1 py-3 rounded-xl text-sm font-semibold bg-gray-900 text-white hover:bg-gray-700 transition disabled:opacity-40 disabled:cursor-not-allowed"
              >
                Buy Now
              </button>
            </div>

            <p className="text-xs text-gray-400">
              Free shipping on orders over KES 5,000 · Easy 30-day returns
            </p>
          </div>
        </div>

        {/* ── Tabs ── */}
        <div className="mt-16 border-t border-gray-100">
          <div className="flex gap-8 pt-1">
            {["description", "features", "reviews"].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`py-4 text-sm font-semibold capitalize border-b-2 transition ${
                  activeTab === tab
                    ? "border-gray-900 text-gray-900"
                    : "border-transparent text-gray-400 hover:text-gray-700"
                }`}
              >
                {tab}
                {tab === "reviews" && product.review_count > 0 && (
                  <span className="ml-1.5 text-xs text-gray-400">({product.review_count})</span>
                )}
              </button>
            ))}
          </div>

          <div className="py-8 max-w-2xl">
            {activeTab === "description" && (
              <p className="text-gray-600 leading-relaxed text-sm">
                {product.description || "No description available."}
              </p>
            )}

            {activeTab === "features" && (
              <ul className="space-y-2">
                {product.features?.length > 0 ? (
                  product.features.map((f, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm text-gray-600">
                      <Check size={15} className="text-green-500 flex-shrink-0 mt-0.5" />
                      {f}
                    </li>
                  ))
                ) : (
                  <p className="text-sm text-gray-400">No features listed.</p>
                )}
              </ul>
            )}

            {activeTab === "reviews" && (
              <ReviewsTab product={product} user={user} />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ── Reviews Tab ── */
function ReviewsTab({ product, user }) {
  const navigate = useNavigate();

  const Stars = ({ rating }) =>
    [...Array(5)].map((_, i) => (
      <Star
        key={i}
        size={14}
        className={
          i < Math.floor(rating)
            ? "text-yellow-400 fill-yellow-400"
            : "text-gray-200 fill-gray-200"
        }
      />
    ));

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          {product.average_rating > 0 && (
            <>
              <span className="text-3xl font-bold text-gray-900">
                {product.average_rating}
              </span>
              <div>
                <div className="flex gap-0.5 mb-0.5">
                  <Stars rating={product.average_rating} />
                </div>
                <p className="text-xs text-gray-400">{product.review_count} reviews</p>
              </div>
            </>
          )}
        </div>

        {user ? (
          <button
            onClick={() => navigate(`/product/${product.slug}/review`)}
            className="text-sm font-semibold text-gray-900 border border-gray-900 px-4 py-2 rounded-lg hover:bg-gray-900 hover:text-white transition"
          >
            Write a review
          </button>
        ) : (
          <button
            onClick={() => navigate("/login")}
            className="text-sm text-gray-400 border border-gray-200 px-4 py-2 rounded-lg hover:border-gray-400 transition"
          >
            Log in to review
          </button>
        )}
      </div>

      {product.reviews?.length > 0 ? (
        <div className="space-y-6">
          {product.reviews.map((r) => (
            <div key={r.id} className="border-b border-gray-100 pb-6 last:border-0">
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-sm font-semibold text-gray-800">{r.user_name}</span>
                <span className="text-xs text-gray-400">{r.date}</span>
              </div>
              <div className="flex gap-0.5 mb-2">
                <Stars rating={r.rating} />
              </div>
              {r.title && (
                <p className="text-sm font-medium text-gray-800 mb-1">{r.title}</p>
              )}
              {r.comment && (
                <p className="text-sm text-gray-600 leading-relaxed">{r.comment}</p>
              )}
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-10 border border-dashed border-gray-200 rounded-xl">
          <p className="text-sm text-gray-400 mb-3">No reviews yet.</p>
          {user ? (
            <button
              onClick={() => navigate(`/product/${product.slug}/review`)}
              className="text-sm font-semibold text-blue-600 hover:underline"
            >
              Be the first to review this product
            </button>
          ) : (
            <p className="text-xs text-gray-400">Log in to leave a review.</p>
          )}
        </div>
      )}
    </div>
  );
}

export default ProductPage;