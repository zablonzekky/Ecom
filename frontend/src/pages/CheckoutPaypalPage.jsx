import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAppContext } from "../context/AppContext";
import { API_BASE_URL } from "../services/api";
import { showError, showSuccess } from "../services/toast";

export default function CheckoutPaypalPage() {
  const { cart, placeOrder } = useAppContext();
  const navigate = useNavigate();
  const [paypalEmail, setPaypalEmail] = useState("");
  const [address, setAddress] = useState({ full_name: "", phone_number: "", address_line1: "", address_line2: "", city: "", county: "", postal_code: "" });
  const [processing, setProcessing] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setProcessing(true);
    try {
      const order = await placeOrder({ address, items: cart.map((i) => ({ product_id: i.id, quantity: i.quantity })) });
      const token = localStorage.getItem("access_token");
      const initRes = await fetch(`${API_BASE_URL}/payments/paypal/initiate/`, { method: "POST", headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` }, body: JSON.stringify({ order_id: order.id, email_hint: paypalEmail }) });
      const initData = await initRes.json();
      if (!initRes.ok) throw new Error(initData.error || "PayPal init failed");

      if (initData.approval_url) {
        window.open(initData.approval_url, "_blank");
      }
      const captureRes = await fetch(`${API_BASE_URL}/payments/paypal/capture/`, { method: "POST", headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` }, body: JSON.stringify({ paypal_order_id: initData.paypal_order_id }) });
      const captureData = await captureRes.json();
      if (!captureRes.ok || !captureData.success) {
        await fetch(`${API_BASE_URL}/orders/${order.id}/cancel/`, { method: "POST", headers: { Authorization: `Bearer ${token}` } });
        throw new Error(captureData.error || "PayPal payment failed");
      }

      showSuccess("PayPal payment successful.");
      window.open(`${API_BASE_URL}/payments/receipt/${order.id}/`, "_blank");
      navigate("/orders");
    } catch (err) {
      showError(err.message || "Payment failed");
    } finally {
      setProcessing(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">PayPal Checkout</h1>
      <form onSubmit={handleSubmit} className="space-y-3">
        {Object.keys(address).map((key) => <input key={key} required={!['address_line2','postal_code'].includes(key)} placeholder={key.replace('_',' ')} value={address[key]} onChange={(e)=>setAddress({ ...address, [key]: e.target.value })} className="w-full border rounded-md px-3 py-2" />)}
        <input required type="email" value={paypalEmail} onChange={(e)=>setPaypalEmail(e.target.value)} placeholder="PayPal email" className="w-full border rounded-md px-3 py-2" />
        <button disabled={processing} className="w-full bg-blue-600 text-white py-2.5 rounded-md">{processing ? 'Processing...' : 'Pay with PayPal'}</button>
      </form>
    </div>
  );
}
