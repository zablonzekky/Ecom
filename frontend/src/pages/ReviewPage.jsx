import React, { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Star, Check, ArrowLeft } from "lucide-react";
import { useAppContext } from "../context/AppContext";

const API_BASE_URL = process.env.REACT_APP_API_URL || "http://localhost:8000";

function ReviewPage() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const { products, user } = useAppContext();

  const product = products.find((p) => p.slug === slug);

  const [rating, setRating] = useState(0);
  const [hovered, setHovered] = useState(0);
  const [title, setTitle] = useState("");
  const [comment, setComment] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-500 mb-4">Please log in to leave a review.</p>
          <button
            onClick={() => navigate("/login")}
            className="text-sm text-blue-600 underline"
          >
            Go to Login
          </button>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-500 mb-4">Product not found.</p>
          <button
            onClick={() => navigate("/shop")}
            className="text-sm text-blue-600 underline"
          >
            Back to Shop
          </button>
        </div>
      </div>
    );
  }

  const handleSubmit = async () => {
    if (!rating) {
      setError("Please select a star rating.");
      return;
    }
    setError("");
    setLoading(true);
    try {
      const token = localStorage.getItem("access_token");
      const res = await fetch(
        `${API_BASE_URL}/api/products/${product.slug}/review/`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            rating,
            ...(title.trim() && { title: title.trim() }),
            ...(comment.trim() && { comment: comment.trim() }),
          }),
        }
      );

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.detail || data.error || "Failed to submit.");
      }

      setSuccess(true);
      setTimeout(() => navigate(`/product/${slug}`), 2500);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const ratingLabels = ["", "Poor", "Fair", "Good", "Very Good", "Excellent"];

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="text-center">
          <div className="w-14 h-14 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Check size={26} className="text-green-600" />
          </div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">
            Review submitted!
          </h2>
          <p className="text-sm text-gray-500">
            It will appear after approval. Redirecting you back…
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-lg mx-auto px-4 py-12">

        {/* Back */}
        <button
          onClick={() => navigate(`/product/${slug}`)}
          className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-800 transition mb-8"
        >
          <ArrowLeft size={15} />
          Back to product
        </button>

        {/* Product summary */}
        <div className="flex items-center gap-4 mb-8 pb-8 border-b border-gray-100">
          {product.primary_image && (
            <img
              src={product.primary_image}
              alt={product.name}
              className="w-16 h-16 rounded-xl object-cover bg-gray-100 flex-shrink-0"
            />
          )}
          <div>
            <p className="text-xs text-gray-400 uppercase tracking-wide mb-0.5">
              {product.product_type}
            </p>
            <h1 className="text-base font-bold text-gray-900">{product.name}</h1>
            <p className="text-sm text-gray-500">
              KES {parseFloat(product.current_price || product.price).toLocaleString()}
            </p>
          </div>
        </div>

        <h2 className="text-2xl font-bold text-gray-900 mb-1">Leave a Review</h2>
        <p className="text-sm text-gray-400 mb-8">
          Share your experience to help other shoppers.
        </p>

        {/* Star rating — required, comment optional */}
        <div className="mb-6">
          <p className="text-sm font-semibold text-gray-700 mb-3">
            Your rating <span className="text-red-500">*</span>
          </p>
          <div className="flex items-center gap-2">
            <div className="flex gap-1">
              {[1, 2, 3, 4, 5].map((val) => (
                <button
                  key={val}
                  onClick={() => setRating(val)}
                  onMouseEnter={() => setHovered(val)}
                  onMouseLeave={() => setHovered(0)}
                  className="transition-transform hover:scale-110"
                >
                  <Star
                    size={36}
                    className={
                      val <= (hovered || rating)
                        ? "text-yellow-400 fill-yellow-400"
                        : "text-gray-200 fill-gray-200"
                    }
                  />
                </button>
              ))}
            </div>
            {(hovered || rating) > 0 && (
              <span className="text-sm font-medium text-gray-600 ml-2">
                {ratingLabels[hovered || rating]}
              </span>
            )}
          </div>
          {!rating && error && (
            <p className="text-xs text-red-500 mt-1.5">{error}</p>
          )}
        </div>

        {/* Title — optional */}
        <div className="mb-4">
          <label className="text-sm font-semibold text-gray-700 block mb-1.5">
            Title{" "}
            <span className="text-gray-400 font-normal">(optional)</span>
          </label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Summarise your experience"
            className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:border-gray-400 transition"
          />
        </div>

        {/* Comment — optional */}
        <div className="mb-6">
          <label className="text-sm font-semibold text-gray-700 block mb-1.5">
            Comment{" "}
            <span className="text-gray-400 font-normal">(optional)</span>
          </label>
          <textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            rows={5}
            placeholder="What did you like or dislike? Would you recommend this?"
            className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:border-gray-400 transition resize-none"
          />
          <p className="text-xs text-gray-400 mt-1">
            A star rating alone is enough — a comment helps even more.
          </p>
        </div>

        {error && rating > 0 && (
          <p className="text-sm text-red-500 mb-4">{error}</p>
        )}

        <button
          onClick={handleSubmit}
          disabled={loading || !rating}
          className="w-full py-3.5 rounded-xl bg-gray-900 text-white text-sm font-semibold hover:bg-gray-700 transition disabled:opacity-40 disabled:cursor-not-allowed"
        >
          {loading ? "Submitting…" : "Submit Review"}
        </button>

        <p className="text-xs text-center text-gray-400 mt-4">
          Reviews are held for moderation before going live.
        </p>
      </div>
    </div>
  );
}

export default ReviewPage;
