import React, { useState } from "react";
import { API_BASE_URL } from "../services/api";
import { showError, showSuccess } from "../services/toast";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/accounts/auth/password/reset/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      if (res.ok) {
        setSubmitted(true);
        showSuccess("Password reset link sent to your email.");
      } else {
        showError("Unable to send reset link. Please check the email address.");
      }
    } catch {
      showError("Something went wrong. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  if (submitted) {
    return (
      <div className="max-w-md mx-auto py-12 px-4 text-center">
        <div className="bg-green-50 border border-green-200 rounded-xl p-8">
          <div className="text-4xl mb-4">📧</div>
          <h1 className="text-2xl font-bold mb-2 text-gray-800">Check your email</h1>
          <p className="text-gray-500 mb-6">
            We sent a password reset link to <span className="font-medium text-gray-700">{email}</span>.
            Check your inbox and follow the link to reset your password.
          </p>
          <button
            onClick={() => setSubmitted(false)}
            className="text-blue-600 text-sm underline"
          >
            Didn't receive it? Try again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto py-12 px-4">
      <div className="bg-white border rounded-xl p-8 shadow-sm">
        <h1 className="text-2xl font-bold mb-1 text-gray-800">Forgot Password</h1>
        <p className="text-gray-500 text-sm mb-6">
          Enter your email and we'll send you a link to reset your password.
        </p>
        <form onSubmit={submit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email address
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="you@example.com"
            />
          </div>
          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-blue-600 text-white rounded-md py-2 font-medium hover:bg-blue-700 disabled:opacity-60 transition"
          >
            {isLoading ? "Sending..." : "Send Reset Link"}
          </button>
        </form>
      </div>
    </div>
  );
}
