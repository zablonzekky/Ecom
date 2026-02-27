import React, { useMemo, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Eye, EyeOff, Lock, User } from "lucide-react";
import { useAppContext } from "../context/AppContext";
import { showError, showSuccess } from "../services/toast";

function LoginPage() {
  const { login } = useAppContext();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formError, setFormError] = useState("");
  const navigate = useNavigate();
  const location = useLocation();

  const from = location.state?.from?.pathname || "/";

  const canSubmit = useMemo(
    () => username.trim().length > 0 && password.length > 0 && !loading,
    [username, password, loading]
  );

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError("");

    if (!username.trim() || !password) {
      const msg = "Please enter both username and password.";
      setFormError(msg);
      showError(msg);
      return;
    }

    setLoading(true);
    try {
      await login(username.trim(), password);
      showSuccess("Login successful.");
      navigate(from, { replace: true });
    } catch (err) {
      const msg = err.message || "Invalid username or password.";
      setFormError(msg);
      showError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center px-4 py-10">
      <div className="w-full max-w-md bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
        <h1 className="text-2xl font-bold text-center text-gray-900 mb-1">Welcome Back</h1>
        <p className="text-center text-sm text-gray-600 mb-5">Sign in to continue shopping.</p>

        <div className="grid grid-cols-3 gap-2 mb-4">
          <Link to="/auth/google" className="border border-gray-300 rounded-md py-2 text-center text-sm font-medium hover:bg-gray-50">Google</Link>
          <Link to="/auth/facebook" className="border border-gray-300 rounded-md py-2 text-center text-sm font-medium hover:bg-gray-50">Facebook</Link>
          <Link to="/auth/linkedin" className="border border-gray-300 rounded-md py-2 text-center text-sm font-medium hover:bg-gray-50">LinkedIn</Link>
        </div>

        {formError && (
          <div className="mb-3 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
            {formError}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-3" noValidate>
          <label className="block">
            <span className="mb-1 block text-sm font-medium text-gray-700">Username</span>
            <div className="relative">
              <User size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                autoComplete="username"
                className="w-full border border-gray-300 rounded-md pl-9 pr-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter your username"
              />
            </div>
          </label>

          <label className="block">
            <div className="mb-1 flex items-center justify-between">
              <span className="text-sm font-medium text-gray-700">Password</span>
              <Link to="/forgot-password" className="text-sm text-blue-700 hover:underline">Forgot password?</Link>
            </div>
            <div className="relative">
              <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                type={showPassword ? "text" : "password"}
                autoComplete="current-password"
                className="w-full border border-gray-300 rounded-md pl-9 pr-10 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter your password"
              />
              <button
                type="button"
                aria-label={showPassword ? "Hide password" : "Show password"}
                onClick={() => setShowPassword((prev) => !prev)}
                className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-gray-500 hover:text-gray-700"
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </label>

          <button
            disabled={!canSubmit}
            className="w-full bg-blue-600 text-white py-2.5 rounded-md font-medium disabled:opacity-60 hover:bg-blue-700 transition"
          >
            {loading ? "Signing in..." : "Sign In"}
          </button>
        </form>

        <p className="text-sm text-center mt-4 text-gray-700">
          No account? <Link to="/register" className="text-blue-700 hover:underline">Create one</Link>
        </p>
      </div>
    </div>
  );
}

export default LoginPage;
