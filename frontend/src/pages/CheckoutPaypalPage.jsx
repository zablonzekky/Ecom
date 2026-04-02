import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAppContext } from "../context/AppContext";
import { API_BASE_URL } from "../services/api";
import { showError, showSuccess } from "../services/toast";

export default function CheckoutPaypalPage() {
  const { cart, placeOrder } = useAppContext();
  const navigate = useNavigate();
  const [paypalEmail, setPaypalEmail] = useState("");
  const [address, setAddress] = useState({
    full_name: "", phone_number: "", address_line1: "",
    address_line2: "", city: "", county: "", postal_code: ""
  });
  const [processing, setProcessing] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setProcessing(true);

    // ✅ Open blank window IMMEDIATELY on user click (before any await)
    // Browsers only allow window.open() during a direct user gesture.
    // After an await, it's treated as a popup and gets blocked.
    const paypalWindow = window.open("", "_blank");
    if (!paypalWindow) {
      showError("Popup was blocked. Please allow popups for this site and try again.");
      setProcessing(false);
      return;
    }

    // Show a loading screen inside the blank tab while we fetch the PayPal URL
    paypalWindow.document.write(`
      <html>
        <head><title>Connecting to PayPal...</title></head>
        <body style="font-family:sans-serif;display:flex;align-items:center;
                     justify-content:center;height:100vh;margin:0;background:#f0f4ff;">
          <div style="text-align:center;">
            <h2 style="color:#003087;">Connecting to PayPal...</h2>
            <p style="color:#555;">Please wait, do not close this tab.</p>
          </div>
        </body>
      </html>
    `);

    let order = null;

    try {
      const token = localStorage.getItem("access_token");

      // ── Step 1: Create the order ──────────────────────────────────────
      try {
        order = await placeOrder({
          address,
          items: cart.map((i) => ({ product_id: i.id, quantity: i.quantity })),
        });
      } catch (orderErr) {
        paypalWindow.close();
        throw new Error("Failed to create order: " + (orderErr.message || "Unknown error"));
      }

      // ── Step 2: Initiate PayPal on the backend ────────────────────────
      let initRes, initData;
      try {
        initRes = await fetch(`${API_BASE_URL}/api/payments/paypal/initiate/`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ order_id: order.id, email_hint: paypalEmail }),
        });
        initData = await initRes.json();
      } catch (fetchErr) {
        paypalWindow.close();
        throw new Error(
          `PayPal connection failed — your Order #${order?.id} was saved. ` +
          `Go to your orders to retry payment. (${fetchErr.message})`
        );
      }

      if (!initRes.ok) {
        paypalWindow.close();
        throw new Error(
          `PayPal error (Order #${order?.id} saved): ` +
          (initData?.error || `HTTP ${initRes.status}`)
        );
      }

      // ── Step 3: Redirect the pre-opened tab to PayPal ─────────────────
      if (initData.approval_url) {
        // Navigate the already-open tab — no new popup needed
        paypalWindow.location.href = initData.approval_url;
        showSuccess("PayPal opened! Complete payment there, then check your orders.");
        navigate("/orders");
      } else {
        paypalWindow.close();
        throw new Error("No PayPal approval URL returned from server.");
      }

    } catch (err) {
      showError(err.message || "Payment initiation failed");

      // If order was created but PayPal failed, redirect after delay
      // so the user can see and retry their pending order
      if (order?.id) {
        showError(`Redirecting to your orders in 3 seconds...`);
        setTimeout(() => navigate("/orders"), 3000);
      }
    } finally {
      setProcessing(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">PayPal Checkout</h1>

      <form onSubmit={handleSubmit} className="space-y-3">
        {Object.keys(address).map((key) => (
          <input
            key={key}
            required={!["address_line2", "postal_code"].includes(key)}
            placeholder={key.replace(/_/g, " ").toUpperCase()}
            value={address[key]}
            onChange={(e) => setAddress({ ...address, [key]: e.target.value })}
            className="w-full border rounded-md px-3 py-2 bg-blue-50/20"
          />
        ))}

        <input
          required
          type="email"
          value={paypalEmail}
          onChange={(e) => setPaypalEmail(e.target.value)}
          placeholder="PAYPAL EMAIL"
          className="w-full border rounded-md px-3 py-2 bg-blue-50/20"
        />

        <button
          type="submit"
          disabled={processing}
          className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-60 
                     text-white py-3 rounded-md font-bold transition-all"
        >
          {processing ? "Connecting to PayPal..." : "Pay with PayPal"}
        </button>
      </form>
    </div>
  );
}