import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAppContext } from "../context/AppContext";
import { API_BASE_URL } from "../services/api";
import { showError, showSuccess } from "../services/toast";

export default function CheckoutMpesaPage() {
  const { cart, placeOrder } = useAppContext();
  const navigate = useNavigate();
  const [phoneNumber, setPhoneNumber] = useState("");
  const [address, setAddress] = useState({
    full_name: "", phone_number: "", address_line1: "",
    address_line2: "", city: "", county: "", postal_code: "",
  });
  const [processing, setProcessing] = useState(false);

  const BASE = `${API_BASE_URL}/api`;
  const formatPhone = (value) => value.replace(/\D/g, "").replace(/^0/, "254");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setProcessing(true);
    let orderId = null;

    try {
      const order = await placeOrder({
        address,
        items: cart.map((i) => ({ product_id: i.id, quantity: i.quantity })),
      });
      orderId = order.id;

      const token = localStorage.getItem("access_token");

      const payRes = await fetch(`${BASE}/payments/initiate/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          order_id: orderId,
          phone_number: formatPhone(phoneNumber),
        }),
      });
      const payData = await payRes.json();
      if (!payRes.ok) throw new Error(payData.error || "M-PESA initiation failed");

      showSuccess("M-PESA prompt sent. Complete payment on your phone.");

      for (let i = 0; i < 20; i += 1) {
        const statusRes = await fetch(`${BASE}/payments/status/${orderId}/`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const statusData = await statusRes.json();

        if (statusData.status === "completed") {
          showSuccess("Payment successful!");
          navigate("/orders");
          return;
        }

        if (statusData.status === "failed") {
          await fetch(`${BASE}/orders/${orderId}/cancel/`, {
            method: "POST",
            headers: { Authorization: `Bearer ${token}` },
          });
          throw new Error("Payment failed. Order was cancelled.");
        }

        await new Promise((r) => setTimeout(r, 2000));
      }

      // Timeout — don't cancel, redirect to orders
      showSuccess("Payment is being confirmed. Check your orders for status.");
      navigate("/orders");

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
        {Object.keys(address).map((key) => (
          <input
            key={key}
            required={!["address_line2", "postal_code"].includes(key)}
            placeholder={key.replace(/_/g, " ").replace(/\b\w/g, c => c.toUpperCase())}
            value={address[key]}
            onChange={(e) => setAddress({ ...address, [key]: e.target.value })}
            className="w-full border rounded-md px-3 py-2"
          />
        ))}
        <input
          required
          value={phoneNumber}
          onChange={(e) => setPhoneNumber(e.target.value)}
          placeholder="M-PESA phone number e.g. 0712345678"
          className="w-full border rounded-md px-3 py-2"
        />
        <button
          disabled={processing}
          className="w-full bg-green-600 hover:bg-green-700 disabled:opacity-60 text-white py-2.5 rounded-md font-bold transition-all"
        >
          {processing ? "Processing..." : "Pay with M-PESA"}
        </button>
      </form>
    </div>
  );
}