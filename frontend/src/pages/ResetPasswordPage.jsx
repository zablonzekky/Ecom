import React, { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { API_BASE_URL } from "../services/api";
import { showError, showSuccess } from "../services/toast";

export default function ResetPasswordPage() {
  const { uid, token } = useParams();
  const navigate = useNavigate();
  const [password, setPassword] = useState({ new_password1: "", new_password2: "" });
  const [isLoading, setIsLoading] = useState(false);
  const [done, setDone] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    if (password.new_password1 !== password.new_password2)
      return showError("Passwords do not match.");
    if (password.new_password1.length < 8)
      return showError("Password must be at least 8 characters.");

    setIsLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/accounts/auth/password/reset/confirm/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          uid,
          token,
          new_password1: password.new_password1,
          new_password2: password.new_password2,
        }),
      });

      if (res.ok) {
        setDone(true);
        showSuccess("Password reset successfully!");
      } else {
        const data = await res.json().catch(() => ({}));
        const message =
          data?.token?.[0] ||
          data?.uid?.[0] ||
          data?.new_password2?.[0] ||
          data?.detail ||
          "Failed to reset password. The link may have expired.";
        showError(message);
      }
    } catch {
      showError("Something went wrong. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  if (done) {
    return (
      <div className="max-w-md mx-auto py-12 px-4 text-center">
        <div className="bg-green-50 border border-green-200 rounded-xl p-8">
          <div className="text-4xl mb-4">✅</div>
          <h1 className="text-2xl font-bold mb-2 text-gray-800">Password Reset!</h1>
          <p className="text-gray-500 mb-6">
            Your password has been updated. You can now log in with your new password.
          </p>
          <button
            onClick={() => navigate("/login")}
            className="bg-blue-600 text-white rounded-md px-6 py-2 font-medium hover:bg-blue-700 transition"
          >
            Go to Login
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto py-12 px-4">
      <div className="bg-white border rounded-xl p-8 shadow-sm">
        <h1 className="text-2xl font-bold mb-1 text-gray-800">Set New Password</h1>
        <p className="text-gray-500 text-sm mb-6">
          Choose a strong password for your account.
        </p>
        <form onSubmit={submit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              New password
            </label>
            <input
              type="password"
              required
              value={password.new_password1}
              onChange={(e) => setPassword({ ...password, new_password1: e.target.value })}
              className="w-full border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="At least 8 characters"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Confirm new password
            </label>
            <input
              type="password"
              required
              value={password.new_password2}
              onChange={(e) => setPassword({ ...password, new_password2: e.target.value })}
              className="w-full border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Repeat your new password"
            />
          </div>
          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-blue-600 text-white rounded-md py-2 font-medium hover:bg-blue-700 disabled:opacity-60 transition"
          >
            {isLoading ? "Resetting..." : "Reset Password"}
          </button>
        </form>
      </div>
    </div>
  );
}
