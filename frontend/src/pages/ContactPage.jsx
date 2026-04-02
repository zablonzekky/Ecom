import React, { useState } from "react";
import { API_BASE_URL } from "../services/api";
import { showError, showSuccess } from "../services/toast";
import Layout from "../components/Layout/Layout";
import { Send } from "lucide-react";

export default function ContactPage() {
  const [form, setForm] = useState({ name: "", email: "", message: "" });
  const [loading, setLoading] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/api/accounts/contact/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (res.ok) {
        showSuccess("Message sent! We'll get back to you within 24 hours.");
        setForm({ name: "", email: "", message: "" });
      } else {
        const errorMsg =
          Object.values(data)?.[0]?.[0] ||
          data.error ||
          data.detail ||
          "Failed to send message.";
        showError(errorMsg);
      }
    } catch {
      showError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout>
      {/* -mx-4 (or negative margin) won't work reliably — instead use full bleed via fixed inset */}
      <div className="min-h-screen bg-[#F4EDE4] flex flex-col -mx-4 sm:-mx-6 lg:-mx-8">
        {/* Hero Banner — full bleed */}
        <div className="bg-gray-900 text-white py-16 px-6 text-center w-full">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">Get in Touch</h1>
          <p className="text-gray-400 text-lg max-w-xl mx-auto">
            Have a question about an order, a product, or just want to say hello?
            Send us a message and our team will respond promptly.
          </p>
        </div>

        {/* Form */}
        <div className="flex-1 w-full px-4 sm:px-6 lg:px-8 py-16">
          <div className="max-w-3xl mx-auto bg-white rounded-2xl border border-[#DCC7AA] shadow-sm p-8">
            <h2 className="text-2xl font-bold text-[#4E3B2C] mb-1">Send a Message</h2>
            <p className="text-sm text-[#7C6652] mb-8">
              Fill in the form below and we'll get back to you as soon as possible.
            </p>

            <form onSubmit={submit} className="space-y-5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div>
                  <label className="block text-sm font-medium text-[#4E3B2C] mb-1.5">
                    Full Name <span className="text-red-400">*</span>
                  </label>
                  <input
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    required
                    placeholder="Full Name"
                    className="w-full border border-[#DCC7AA] rounded-lg px-4 py-2.5 text-[#4E3B2C] placeholder-[#B5A090] focus:outline-none focus:ring-2 focus:ring-[#A6754D]/40 focus:border-[#A6754D] transition"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-[#4E3B2C] mb-1.5">
                    Email Address <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="email"
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                    required
                    placeholder="Email Address"
                    className="w-full border border-[#DCC7AA] rounded-lg px-4 py-2.5 text-[#4E3B2C] placeholder-[#B5A090] focus:outline-none focus:ring-2 focus:ring-[#A6754D]/40 focus:border-[#A6754D] transition"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-[#4E3B2C] mb-1.5">
                  Message <span className="text-red-400">*</span>
                </label>
                <textarea
                  value={form.message}
                  onChange={(e) => setForm({ ...form, message: e.target.value })}
                  required
                  placeholder="Tell us how we can help you..."
                  rows={7}
                  className="w-full border border-[#DCC7AA] rounded-lg px-4 py-2.5 text-[#4E3B2C] placeholder-[#B5A090] focus:outline-none focus:ring-2 focus:ring-[#A6754D]/40 focus:border-[#A6754D] transition resize-none"
                />
              </div>

              <div className="flex items-center justify-between pt-1">
                <p className="text-xs text-[#B5A090]">
                  Your message is sent securely to our support team.
                </p>
                <button
                  type="submit"
                  disabled={loading}
                  className="inline-flex items-center gap-2 bg-[#A6754D] hover:bg-[#8D5F3B] disabled:opacity-60 disabled:cursor-not-allowed text-white px-6 py-2.5 rounded-lg font-semibold transition"
                >
                  {loading ? (
                    <>
                      <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                      </svg>
                      Sending...
                    </>
                  ) : (
                    <>
                      <Send size={16} />
                      Send Message
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </Layout>
  );
}