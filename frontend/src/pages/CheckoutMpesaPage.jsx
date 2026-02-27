import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAppContext } from "../context/AppContext";
import { API_BASE_URL } from "../services/api";
import { showError, showSuccess } from "../services/toast";

export default function CheckoutMpesaPage() {
  const { cart, placeOrder } = useAppContext();
  const navigate = useNavigate();
  const [phoneNumber, setPhoneNumber] = useState("");
  const [address, setAddress] = useState({ full_name: "", phone_number: "", address_line1: "", address_line2: "", city: "", county: "", postal_code: "" });
  const [processing, setProcessing] = useState(false);

  const formatPhone = (value) => value.replace(/\D/g, "").replace(/^0/, "254");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setProcessing(true);
    try {
      const order = await placeOrder({ address, items: cart.map((i) => ({ product_id: i.id, quantity: i.quantity })) });
      const token = localStorage.getItem("access_token");
      const payRes = await fetch(`${API_BASE_URL}/payments/initiate/`, { method: "POST", headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` }, body: JSON.stringify({ order_id: order.id, phone_number: formatPhone(phoneNumber) }) });
      const payData = await payRes.json();
      if (!payRes.ok) throw new Error(payData.error || "M-PESA initiation failed");

      showSuccess("M-PESA prompt sent. Complete payment on your phone.");
      for (let i = 0; i < 20; i += 1) {
        const statusRes = await fetch(`${API_BASE_URL}/payments/status/${order.id}/`, { headers: { Authorization: `Bearer ${token}` } });
        const statusData = await statusRes.json();
        if (statusData.status === "completed") {
          showSuccess("Payment successful.");
          window.open(`${API_BASE_URL}/payments/receipt/${order.id}/`, "_blank");
          navigate("/orders");
          return;
        }
        if (statusData.status === "failed") {
          await fetch(`${API_BASE_URL}/orders/${order.id}/cancel/`, { method: "POST", headers: { Authorization: `Bearer ${token}` } });
          throw new Error("Payment failed. Order was cancelled.");
        }
        await new Promise((r) => setTimeout(r, 2000));
      }
      throw new Error("Payment confirmation timed out.");
    } catch (err) {
      showError(err.message || "Payment failed");
    } finally {
      setProcessing(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">M-PESA Checkout</h1>
      <form onSubmit={handleSubmit} className="space-y-3">
        {Object.keys(address).map((key) => <input key={key} required={!['address_line2','postal_code'].includes(key)} placeholder={key.replace('_',' ')} value={address[key]} onChange={(e)=>setAddress({ ...address, [key]: e.target.value })} className="w-full border rounded-md px-3 py-2" />)}
        <input required value={phoneNumber} onChange={(e)=>setPhoneNumber(e.target.value)} placeholder="M-PESA phone number" className="w-full border rounded-md px-3 py-2" />
        <button disabled={processing} className="w-full bg-blue-600 text-white py-2.5 rounded-md">{processing ? 'Processing...' : 'Pay with M-PESA'}</button>
      </form>
    </div>
  );
}
