import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAppContext } from "../context/AppContext";
import { 
  Trash2, 
  Plus, 
  Minus, 
  ShoppingBag, 
  ArrowLeft, 
  ShieldCheck, 
  RotateCcw, 
  CreditCard 
} from "lucide-react";
import ConfirmModal from "../components/ConfirmModal";

function CartPage() {
  const navigate = useNavigate();
  const { user, cart, updateCartItemQuantity, removeFromCart, getCartTotal } = useAppContext();
  const [deleteItemId, setDeleteItemId] = useState(null);

  const token =
    localStorage.getItem("access_token") ||
    localStorage.getItem("token") ||
    sessionStorage.getItem("access_token");
  
  const isAuthenticated = !!(user || token);

  const handleQuantityChange = (cartItemId, newQuantity) => {
    if (newQuantity < 1) return;
    updateCartItemQuantity(cartItemId, newQuantity);
  };

  const handleRemoveItem = (cartItemId) => {
    setDeleteItemId(cartItemId);
  };

  const handleCheckout = () => {
    if (!isAuthenticated) {
      navigate("/login");
      return;
    }
    navigate("/checkout");
  };

  // Resolve image from either list serializer (primary_image string)
  // or detail serializer (images array of objects)
  const resolveImage = (item) => {
    if (item.primary_image) return item.primary_image;
    if (Array.isArray(item.images) && item.images.length > 0) {
      const first = item.images[0];
      return typeof first === "string" ? first : first?.image || null;
    }
    return null;
  };

  const cartTotal = getCartTotal();
  const shippingThreshold = 5000;
  const shippingCost = cartTotal > shippingThreshold ? 0 : 300;
  const totalWithShipping = cartTotal + shippingCost;

  // VIEW: Empty Cart
  if (cart.length === 0) {
    return (
      <div className="min-h-screen bg-[#fdfaf7] flex items-center justify-center">
        <div className="text-center max-w-md px-4">
          <div className="bg-stone-100 w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-6">
            <ShoppingBag className="h-12 w-12 text-stone-400" />
          </div>
          <h2 className="text-3xl font-serif font-bold text-stone-900 mb-4">
            Your Cart is Empty
          </h2>
          <p className="text-stone-600 mb-8">
            It looks like you haven't discovered your next favorite piece yet.
          </p>
          <button
            onClick={() => navigate("/shop")}
            className="bg-stone-800 text-white px-8 py-3 rounded-md font-medium hover:bg-stone-900 transition-colors inline-flex items-center gap-2 shadow-sm"
          >
            <ArrowLeft className="h-4 w-4" />
            Continue Shopping
          </button>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="min-h-screen bg-[#fdfaf7] py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="mb-10">
            <button
              onClick={() => navigate("/shop")}
              className="flex items-center text-stone-600 hover:text-amber-800 transition-colors mb-6 group"
            >
              <ArrowLeft className="h-4 w-4 mr-2 group-hover:-translate-x-1 transition-transform" />
              Back to Shop
            </button>
            <h1 className="text-4xl font-serif font-bold text-stone-900">
              Shopping Cart
            </h1>
            <p className="text-stone-500 mt-2">
              {cart.length} {cart.length === 1 ? "item" : "items"} ready for checkout
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
            {/* Cart Items List */}
            <div className="lg:col-span-2 space-y-6">
              {cart.map((item) => {
                const price = parseFloat(item.current_price || item.price);
                const itemTotal = price * item.quantity;
                const imgSrc = resolveImage(item);

                return (
                  <div
                    key={item.cartItemId}
                    className="bg-white rounded-xl p-6 flex flex-col sm:flex-row gap-6 border border-stone-100 shadow-sm hover:shadow-md transition-shadow"
                  >
                    {/* Image */}
                    <div className="w-full sm:w-32 h-40 sm:h-32 flex-shrink-0 bg-stone-50 rounded-lg overflow-hidden border border-stone-100">
                      {imgSrc ? (
                        <img
                          src={imgSrc}
                          alt={item.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-stone-300">
                          <ShoppingBag className="h-8 w-8" />
                        </div>
                      )}
                    </div>

                    {/* Details */}
                    <div className="flex-1 flex flex-col justify-between">
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="text-lg font-bold text-stone-900 mb-1 leading-tight">
                            {item.name}
                          </h3>
                          <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-stone-500">
                            <p>
                              Size:{" "}
                              <span className="text-stone-800 font-medium">
                                {item.selectedSize}
                              </span>
                            </p>
                            {item.category_name && (
                              <p>
                                Category:{" "}
                                <span className="text-stone-800 font-medium">
                                  {item.category_name}
                                </span>
                              </p>
                            )}
                          </div>
                        </div>
                        <button
                          onClick={() => handleRemoveItem(item.cartItemId)}
                          className="text-stone-400 hover:text-red-700 transition-colors p-1"
                          title="Remove item"
                        >
                          <Trash2 className="h-5 w-5" />
                        </button>
                      </div>

                      <div className="flex items-center justify-between mt-6">
                        <div className="flex items-center border border-stone-200 rounded-lg overflow-hidden">
                          <button
                            onClick={() =>
                              handleQuantityChange(item.cartItemId, item.quantity - 1)
                            }
                            className="w-10 h-10 flex items-center justify-center hover:bg-stone-50 text-stone-600 transition-colors"
                          >
                            <Minus className="h-3 w-3" />
                          </button>
                          <span className="w-10 text-center font-semibold text-stone-900">
                            {item.quantity}
                          </span>
                          <button
                            onClick={() =>
                              handleQuantityChange(item.cartItemId, item.quantity + 1)
                            }
                            className="w-10 h-10 flex items-center justify-center hover:bg-stone-50 text-stone-600 transition-colors"
                          >
                            <Plus className="h-3 w-3" />
                          </button>
                        </div>

                        <div className="text-right">
                          <p className="text-xl font-bold text-stone-900">
                            KES {itemTotal.toLocaleString()}
                          </p>
                          <p className="text-xs text-stone-400 uppercase tracking-wider">
                            KES {price.toLocaleString()} EA
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Summary Sidebar */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-xl shadow-sm border border-stone-100 p-8 sticky top-24">
                <h2 className="text-xl font-bold text-stone-900 mb-6 pb-4 border-b border-stone-100">
                  Order Summary
                </h2>

                <div className="space-y-4 mb-8">
                  <div className="flex justify-between text-stone-600">
                    <span>Subtotal</span>
                    <span className="font-semibold text-stone-900">
                      KES {cartTotal.toLocaleString()}
                    </span>
                  </div>

                  <div className="flex justify-between text-stone-600">
                    <span>Shipping</span>
                    <span className="font-semibold">
                      {shippingCost === 0 ? (
                        <span className="text-emerald-700 font-medium">Free</span>
                      ) : (
                        `KES ${shippingCost.toLocaleString()}`
                      )}
                    </span>
                  </div>

                  {cartTotal < shippingThreshold && (
                    <div className="bg-amber-50/50 border border-amber-100 p-3 rounded-lg">
                      <p className="text-xs text-amber-900 leading-relaxed">
                        Enjoy free shipping on orders over{" "}
                        <b>KES {shippingThreshold.toLocaleString()}</b>. Add{" "}
                        <b>KES {(shippingThreshold - cartTotal).toLocaleString()}</b> more
                        to qualify.
                      </p>
                    </div>
                  )}

                  <div className="border-t border-stone-100 pt-4 mt-4">
                    <div className="flex justify-between items-baseline">
                      <span className="text-lg font-bold text-stone-900">Total</span>
                      <span className="text-2xl font-black text-stone-900">
                        KES {totalWithShipping.toLocaleString()}
                      </span>
                    </div>
                  </div>
                </div>

                <button
                  onClick={handleCheckout}
                  className="w-full bg-stone-800 text-white py-4 rounded-lg font-bold text-md hover:bg-stone-900 transition-all shadow-md active:scale-[0.98] mb-4"
                >
                  {isAuthenticated ? "Proceed to Checkout" : "Login to Checkout"}
                </button>

                <button
                  onClick={() => navigate("/shop")}
                  className="w-full border border-stone-200 text-stone-600 py-3 rounded-lg font-semibold hover:bg-stone-50 transition-colors"
                >
                  Continue Shopping
                </button>

                <div className="space-y-4 pt-6 mt-6 border-t border-stone-100">
                  <div className="flex items-center gap-3 text-xs text-stone-500 uppercase tracking-widest font-medium">
                    <ShieldCheck className="h-4 w-4 text-amber-700" />
                    <span>Secure Transactions</span>
                  </div>
                  <div className="flex items-center gap-3 text-xs text-stone-500 uppercase tracking-widest font-medium">
                    <RotateCcw className="h-4 w-4 text-amber-700" />
                    <span>30-Day Returns</span>
                  </div>
                  <div className="flex items-center gap-3 text-xs text-stone-500 uppercase tracking-widest font-medium">
                    <CreditCard className="h-4 w-4 text-amber-700" />
                    <span>M-Pesa & Card Support</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <ConfirmModal
        open={!!deleteItemId}
        title="Remove Item"
        message="Are you sure you want to remove this item from your collection?"
        confirmText="Remove"
        cancelText="Keep"
        onCancel={() => setDeleteItemId(null)}
        onConfirm={() => {
          removeFromCart(deleteItemId);
          setDeleteItemId(null);
        }}
      />
    </>
  );
}

export default CartPage;