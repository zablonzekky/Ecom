import React from "react";
import { useNavigate } from "react-router-dom";

export default function CheckoutPage() {
  const navigate = useNavigate();
  return (
    <div className="max-w-3xl mx-auto px-4 py-10">
      <h1 className="text-3xl font-bold text-gray-900 mb-3">Choose Payment Method</h1>
      <p className="text-gray-600 mb-8">Select your preferred payment gateway to proceed.</p>
      <div className="grid md:grid-cols-2 gap-4">
        <button onClick={() => navigate('/checkout/mpesa')} className="border border-gray-300 bg-white rounded-xl p-6 text-left hover:border-blue-600">
          <h2 className="text-xl font-semibold">M-PESA</h2>
          <p className="text-sm text-gray-600 mt-2">Pay from your phone using STK push.</p>
        </button>
        <button onClick={() => navigate('/checkout/paypal')} className="border border-gray-300 bg-white rounded-xl p-6 text-left hover:border-blue-600">
          <h2 className="text-xl font-semibold">PayPal</h2>
          <p className="text-sm text-gray-600 mt-2">Pay with your PayPal account securely.</p>
        </button>
      </div>
    </div>
  );
}
