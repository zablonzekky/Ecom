import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAppContext } from "../context/AppContext";
import { API_BASE_URL } from "../services/api";
import { showError, showSuccess } from "../services/toast";

function CheckoutPage() {
  const { cart, user, placeOrder, userAddresses } = useAppContext();
  const navigate = useNavigate();
  const [paymentMethod, setPaymentMethod] = useState("mpesa");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [address, setAddress] = useState({ full_name: "", phone_number: "", address_line1: "", address_line2: "", city: "", county: "", postal_code: "" });
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState("");

  const subtotal = cart.reduce((sum, item) => sum + (item.current_price || item.price) * item.quantity, 0);
  const shipping = 200;
  const total = subtotal + shipping;

  const formatPhoneNumber = (phone) => {
    let cleaned = phone.replace(/\D/g, "");
    if (cleaned.startsWith("0")) cleaned = `254${cleaned.substring(1)}`;
    return cleaned;
  };

  const createPayment = async (orderId) => {
    const token = localStorage.getItem("access_token");
    const endpoint = paymentMethod === "paypal" ? `${API_BASE_URL}/payments/paypal/initiate/` : `${API_BASE_URL}/payments/initiate/`;
    const payload = paymentMethod === "paypal" ? { order_id: orderId, currency: "USD" } : { order_id: orderId, phone_number: formatPhoneNumber(phoneNumber) };

    const response = await fetch(endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body: JSON.stringify(payload),
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.error || "Payment could not be started");
    return data;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!user) {
      showError("Please sign in to continue.");
      navigate("/login", { state: { from: "/checkout" } });
      return;
    }
    if (cart.length === 0) return showError("Your cart is empty.");
    if (paymentMethod === "mpesa") {
      const formatted = formatPhoneNumber(phoneNumber);
      if (formatted.length !== 12 || !formatted.startsWith("254")) {
        setError("Enter a valid Kenyan phone number, e.g. 0712345678.");
        return;
      }
    }

    setProcessing(true);
    try {
      const order = await placeOrder({ address, items: cart.map((item) => ({ product_id: item.id, quantity: item.quantity })), notes: "" });
      const payment = await createPayment(order.id);

      if (paymentMethod === "paypal" && payment.approval_url) {
        showSuccess("Redirecting you to PayPal...");
        window.location.href = payment.approval_url;
        return;
      }

      showSuccess("Payment initiated successfully. Complete the prompt to finish your order.");
      navigate("/orders");
    } catch (err) {
      const msg = err.message || "Checkout failed. Please try again.";
      setError(msg);
      showError(msg);
    } finally {
      setProcessing(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Checkout</h1>
      {error && <div className="bg-red-50 border border-red-200 text-red-800 rounded-md p-3 mb-4">{error}</div>}
      <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="space-y-4">
          {userAddresses.length > 0 && <p className="text-sm text-gray-600">Select a saved address or enter a new one.</p>}
          {userAddresses.map((addr) => (
            <button key={addr.id} type="button" className="w-full text-left border rounded-md p-3 hover:bg-gray-50" onClick={() => { setAddress({ full_name: addr.full_name, phone_number: addr.phone_number, address_line1: addr.address_line1, address_line2: addr.address_line2 || "", city: addr.city, county: addr.county, postal_code: addr.postal_code || "" }); setPhoneNumber(addr.phone_number); }}>
              <div className="font-medium">{addr.full_name}</div><div className="text-sm text-gray-600">{addr.address_line1}, {addr.city}</div>
            </button>
          ))}
          {Object.keys(address).map((key) => (
            <input key={key} required={!["address_line2", "postal_code"].includes(key)} placeholder={key.replace("_", " ")} value={address[key]} onChange={(e) => setAddress({ ...address, [key]: e.target.value })} className="w-full border border-gray-300 rounded-md px-3 py-2" />
          ))}
          <div className="border rounded-md p-3">
            <p className="font-medium mb-2">Payment method</p>
            <label className="block text-sm mb-2"><input type="radio" checked={paymentMethod === "mpesa"} onChange={() => setPaymentMethod("mpesa")} /> M-PESA</label>
            <label className="block text-sm"><input type="radio" checked={paymentMethod === "paypal"} onChange={() => setPaymentMethod("paypal")} /> PayPal</label>
            {paymentMethod === "mpesa" && <input type="tel" placeholder="M-PESA phone number" value={phoneNumber} onChange={(e) => setPhoneNumber(e.target.value)} className="w-full mt-3 border border-gray-300 rounded-md px-3 py-2" required />}
          </div>
        </div>
        <div className="bg-white border border-gray-200 rounded-lg p-6 h-fit">
          <h2 className="text-xl font-semibold mb-4">Order summary</h2>
          <div className="space-y-2 mb-4">{cart.map((item) => <div key={`${item.id}-${item.selectedSize}`} className="flex justify-between text-sm"><span>{item.name} × {item.quantity}</span><span>KES {((item.current_price || item.price) * item.quantity).toLocaleString()}</span></div>)}</div>
          <div className="border-t pt-3 text-sm space-y-2">
            <div className="flex justify-between"><span>Subtotal</span><span>KES {subtotal.toLocaleString()}</span></div>
            <div className="flex justify-between"><span>Shipping</span><span>KES {shipping.toLocaleString()}</span></div>
            <div className="flex justify-between font-semibold text-base"><span>Total</span><span>KES {total.toLocaleString()}</span></div>
          </div>
          <button type="submit" disabled={processing} className="w-full mt-6 bg-gray-900 text-white rounded-md py-2.5 disabled:opacity-60">{processing ? "Processing..." : `Pay with ${paymentMethod === "paypal" ? "PayPal" : "M-PESA"}`}</button>
        </div>
      </form>
    </div>
  );
}

export default CheckoutPage;
