import React, { useState } from "react";
import { API_BASE_URL } from "../services/api";
import { showError, showSuccess } from "../services/toast";

export default function ContactPage() {
  const [form, setForm] = useState({ name: "", email: "", message: "" });

  const submit = async (e) => {
    e.preventDefault();
    const res = await fetch(`${API_BASE_URL}/accounts/contact/`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    const data = await res.json();
    if (res.ok) {
      showSuccess("Message sent successfully.");
      setForm({ name: "", email: "", message: "" });
    } else {
      showError(data.error || "Failed to send message.");
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-2xl mx-auto bg-white rounded-xl border p-6">
        <h1 className="text-3xl font-bold mb-2">Contact Us</h1>
        <p className="text-gray-600 mb-6">Send us a message and our team will get back to you.</p>
        <form onSubmit={submit} className="space-y-3">
          <input value={form.name} onChange={(e)=>setForm({ ...form, name: e.target.value })} required placeholder="Name" className="w-full border rounded-md px-3 py-2" />
          <input type="email" value={form.email} onChange={(e)=>setForm({ ...form, email: e.target.value })} required placeholder="Email" className="w-full border rounded-md px-3 py-2" />
          <textarea value={form.message} onChange={(e)=>setForm({ ...form, message: e.target.value })} required placeholder="Message" rows={5} className="w-full border rounded-md px-3 py-2" />
          <button className="bg-blue-600 text-white px-4 py-2 rounded-md">Send Message</button>
        </form>
      </div>
    </div>
  );
}
