// src/pages/CartPage.jsx
import React from "react";
import { useNavigate } from "react-router-dom";
import { useAppContext } from "../context/AppContext";
import { Trash2, Plus, Minus, ShoppingBag, ArrowLeft } from "lucide-react";

function CartPage() {
  const navigate = useNavigate();
  const { cart, updateCartItemQuantity, removeFromCart, getCartTotal } = useAppContext();

  const handleQuantityChange = (cartItemId, newQuantity) => {
    if (newQuantity < 1) return;
    updateCartItemQuantity(cartItemId, newQuantity);
  };

  const handleRemoveItem = (cartItemId) => {
    if (window.confirm("Remove this item from cart?")) {
      removeFromCart(cartItemId);
    }
  };

  const cartTotal = getCartTotal();
  const shippingCost = cartTotal > 5000 ? 0 : 300;
  const totalWithShipping = cartTotal + shippingCost;

  if (cart.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center max-w-md px-4">
          <ShoppingBag className="h-24 w-24 mx-auto text-gray-400 mb-6" />
          <h2 className="text-3xl font-bold text-gray-900 mb-4">Your Cart is Empty</h2>
          <p className="text-gray-600 mb-8">
            Looks like you haven't added any items to your cart yet.
          </p>
          <button
            onClick={() => navigate("/shop")}
            className="bg-blue-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-blue-700 transition inline-flex items-center gap-2"
          >
            <ArrowLeft className="h-5 w-5" />
            Continue Shopping
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => navigate("/shop")}
            className="flex items-center text-blue-600 hover:text-blue-700 mb-4"
          >
            <ArrowLeft className="h-5 w-5 mr-2" />
            Continue Shopping
          </button>
          <h1 className="text-4xl font-extrabold text-gray-900">Shopping Cart</h1>
          <p className="text-gray-600 mt-2">{cart.length} {cart.length === 1 ? 'item' : 'items'} in your cart</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2 space-y-4">
            {cart.map((item) => {
              const price = item.current_price || item.price;
              const itemTotal = price * item.quantity;

              return (
                <div
                  key={item.cartItemId}
                  className="bg-white rounded-2xl shadow-sm p-6 flex gap-6 border border-gray-100"
                >
                  {/* Product Image */}
                  <div className="w-32 h-32 flex-shrink-0 bg-gray-100 rounded-xl overflow-hidden">
                    {item.primary_image ? (
                      <img
                        src={item.primary_image}
                        alt={item.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-400">
                        No Image
                      </div>
                    )}
                  </div>

                  {/* Product Details */}
                  <div className="flex-1">
                    <div className="flex justify-between mb-2">
                      <div>
                        <h3 className="text-xl font-bold text-gray-900 mb-1">
                          {item.name}
                        </h3>
                        <p className="text-sm text-gray-600 mb-2">
                          Size: <span className="font-semibold">{item.selectedSize}</span>
                        </p>
                        <p className="text-sm text-gray-600">
                          Category: {item.category_name}
                        </p>
                      </div>
                      <button
                        onClick={() => handleRemoveItem(item.cartItemId)}
                        className="text-red-500 hover:text-red-700 transition p-2 h-fit"
                        title="Remove item"
                      >
                        <Trash2 className="h-5 w-5" />
                      </button>
                    </div>

                    {/* Quantity and Price */}
                    <div className="flex items-center justify-between mt-4">
                      <div className="flex items-center gap-3 bg-gray-100 rounded-lg p-1">
                        <button
                          onClick={() => handleQuantityChange(item.cartItemId, item.quantity - 1)}
                          className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-white transition"
                        >
                          <Minus className="h-4 w-4" />
                        </button>
                        <span className="font-bold text-lg w-8 text-center">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => handleQuantityChange(item.cartItemId, item.quantity + 1)}
                          className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-white transition"
                        >
                          <Plus className="h-4 w-4" />
                        </button>
                      </div>

                      <div className="text-right">
                        <p className="text-2xl font-bold text-gray-900">
                          KES {itemTotal.toLocaleString()}
                        </p>
                        <p className="text-sm text-gray-500">
                          KES {price.toLocaleString()} each
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl shadow-sm p-6 border border-gray-100 sticky top-24">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Order Summary</h2>

              <div className="space-y-4 mb-6">
                <div className="flex justify-between text-gray-700">
                  <span>Subtotal</span>
                  <span className="font-semibold">KES {cartTotal.toLocaleString()}</span>
                </div>

                <div className="flex justify-between text-gray-700">
                  <span>Shipping</span>
                  <span className="font-semibold">
                    {shippingCost === 0 ? (
                      <span className="text-green-600">FREE</span>
                    ) : (
                      `KES ${shippingCost.toLocaleString()}`
                    )}
                  </span>
                </div>

                {cartTotal < 5000 && (
                  <div className="bg-blue-50 p-3 rounded-lg">
                    <p className="text-sm text-blue-800">
                      Add <span className="font-bold">KES {(5000 - cartTotal).toLocaleString()}</span> more for free shipping!
                    </p>
                  </div>
                )}

                <div className="border-t pt-4">
                  <div className="flex justify-between text-lg font-bold text-gray-900">
                    <span>Total</span>
                    <span>KES {totalWithShipping.toLocaleString()}</span>
                  </div>
                </div>
              </div>

              <button
                onClick={() => navigate("/checkout")}
                className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-4 rounded-xl font-bold text-lg hover:from-blue-700 hover:to-purple-700 transition shadow-lg hover:shadow-xl mb-3"
              >
                Proceed to Checkout
              </button>

              <button
                onClick={() => navigate("/shop")}
                className="w-full bg-gray-100 text-gray-700 py-3 rounded-xl font-semibold hover:bg-gray-200 transition"
              >
                Continue Shopping
              </button>

              {/* Trust Badges */}
              <div className="mt-6 pt-6 border-t space-y-3">
                <div className="flex items-center gap-3 text-sm text-gray-600">
                  <svg className="h-5 w-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span>Secure checkout</span>
                </div>
                <div className="flex items-center gap-3 text-sm text-gray-600">
                  <svg className="h-5 w-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span>30-day returns</span>
                </div>
                <div className="flex items-center gap-3 text-sm text-gray-600">
                  <svg className="h-5 w-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span>M-PESA payments</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default CartPage;