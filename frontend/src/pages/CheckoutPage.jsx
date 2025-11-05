import React, { useState } from "react";
import { useAppContext } from "../context/AppContext";

// Checkout Page
function CheckoutPage() {
  const { cart, user, setCurrentPage } = useAppContext();
  const [phoneNumber, setPhoneNumber] = useState('');
  const [address, setAddress] = useState({
    fullName: '',
    phone: '',
    addressLine1: '',
    city: '',
    county: ''
  });
  const [processing, setProcessing] = useState(false);

  const subtotal = cart.reduce((sum, item) => {
    const price = item.current_price || item.price;
    return sum + (price * item.quantity);
  }, 0);
  const shipping = 200;
  const total = subtotal + shipping;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!user) {
      alert('Please login to continue');
      setCurrentPage('login');
      return;
    }

    setProcessing(true);
    // Simulate payment processing
    setTimeout(() => {
      alert('Order placed successfully! You will receive an M-PESA prompt shortly.');
      setProcessing(false);
      setCurrentPage('home');
    }, 2000);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-3xl font-bold mb-8">Checkout</h1>
      
      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Shipping Information */}
          <div>
            <h2 className="text-xl font-bold mb-4">Shipping Information</h2>
            <div className="space-y-4">
              <input
                type="text"
                placeholder="Full Name"
                value={address.fullName}
                onChange={(e) => setAddress({...address, fullName: e.target.value})}
                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
                required
              />
              <input
                type="tel"
                placeholder="Phone Number"
                value={address.phone}
                onChange={(e) => setAddress({...address, phone: e.target.value})}
                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
                required
              />
              <input
                type="text"
                placeholder="Address"
                value={address.addressLine1}
                onChange={(e) => setAddress({...address, addressLine1: e.target.value})}
                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
                required
              />
              <input
                type="text"
                placeholder="City"
                value={address.city}
                onChange={(e) => setAddress({...address, city: e.target.value})}
                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
                required
              />
              <input
                type="text"
                placeholder="County"
                value={address.county}
                onChange={(e) => setAddress({...address, county: e.target.value})}
                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
                required
              />
            </div>

            <h2 className="text-xl font-bold mt-8 mb-4">M-PESA Payment</h2>
            <input
              type="tel"
              placeholder="M-PESA Phone Number (e.g., 0712345678)"
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
              required
            />
          </div>

          {/* Order Summary */}
          <div>
            <h2 className="text-xl font-bold mb-4">Order Summary</h2>
            <div className="bg-white p-6 rounded-lg shadow">
              <div className="space-y-3 mb-4">
                {cart.map((item) => {
                  const price = item.current_price || item.price;
                  return (
                    <div key={`${item.id}-${item.size}`} className="flex justify-between text-sm">
                      <span>{item.name} (Size: {item.size}) x{item.quantity}</span>
                      <span>KES {(price * item.quantity).toLocaleString()}</span>
                    </div>
                  );
                })}
              </div>
              <div className="border-t pt-4 space-y-2">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span>KES {subtotal.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span>Shipping</span>
                  <span>KES {shipping.toLocaleString()}</span>
                </div>
                <div className="border-t pt-2 flex justify-between font-bold text-lg">
                  <span>Total</span>
                  <span>KES {total.toLocaleString()}</span>
                </div>
              </div>
              <button
                type="submit"
                disabled={processing}
                className="w-full mt-6 bg-green-600 text-white py-3 rounded-lg font-semibold hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
              >
                {processing ? 'Processing...' : 'Place Order & Pay with M-PESA'}
              </button>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}
export default CheckoutPage;