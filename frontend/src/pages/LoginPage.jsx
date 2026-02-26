import React, { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAppContext } from "../context/AppContext";
import { API_BASE_URL } from "../services/api";
import { showError, showSuccess } from "../services/toast";

function LoginPage() {
  const { login } = useAppContext();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from?.pathname || "/";

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      await login(username, password);
      showSuccess("Login successful.");
      setTimeout(() => navigate(from, { replace: true }), 800);
    } catch (err) {
      const errorMsg = err?.message || "Unable to sign in. Check your credentials and try again.";
      setError(errorMsg);
      showError(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  const handleSocialLogin = (provider) => {
    window.location.href = `${API_BASE_URL}/accounts/auth/${provider}/`;
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white border border-gray-200 rounded-xl shadow-sm p-6">
        <div className="text-center mb-6">
          <h1 className="text-2xl font-semibold text-gray-900">Sign in</h1>
          <p className="text-sm text-gray-600 mt-1">Access your account and continue shopping.</p>
        </div>

        <div className="grid grid-cols-2 gap-3 mb-4">
          <button
            type="button"
            onClick={() => handleSocialLogin("google")}
            className="border border-gray-300 rounded-md px-3 py-2 text-sm font-medium hover:bg-gray-50"
            disabled={loading}
          >
            Continue with Google
          </button>
          <button
            type="button"
            onClick={() => handleSocialLogin("facebook")}
            className="border border-gray-300 rounded-md px-3 py-2 text-sm font-medium hover:bg-gray-50"
            disabled={loading}
          >
            Continue with Facebook
          </button>
        </div>

        {error && <div className="mb-3 text-sm text-red-700 bg-red-50 border border-red-200 rounded-md p-2">{error}</div>}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-1">Username</label>
            <input
              id="username"
              type="text"
              required
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-gray-400"
              placeholder="Enter your username"
              disabled={loading}
            />
          </div>
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">Password</label>
            <input
              id="password"
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-gray-400"
              placeholder="Enter your password"
              disabled={loading}
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gray-900 text-white rounded-md px-4 py-2 font-medium hover:bg-black disabled:opacity-60"
          >
            {loading ? "Signing in..." : "Sign in"}
          </button>
        </form>

        <p className="text-sm text-gray-600 text-center mt-4">
          Don&apos;t have an account?{" "}
          <button type="button" onClick={() => navigate("/register")} className="text-blue-700 hover:underline" disabled={loading}>
            Create account
          </button>
        </p>
      </div>
    </div>
  );
}

export default LoginPage;
