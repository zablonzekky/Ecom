import React, { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import Layout from "../components/Layout/Layout";
import api from "../services/api";
import { showError, showSuccess } from "../services/toast";

/* ─── Password strength ─────────────────────────────────────────────────────── */
function PasswordStrength({ password }) {
  if (!password) return null;
  const checks = [
    password.length >= 8,
    /[A-Z]/.test(password),
    /\d/.test(password),
    /[^A-Za-z0-9]/.test(password),
  ];
  const score = checks.filter(Boolean).length;
  const label = ["", "Weak", "Fair", "Good", "Strong"][score];
  const color = ["", "#ef4444", "#f97316", "#3b82f6", "#16a34a"][score];

  return (
    <div className="mt-1.5 space-y-1.5">
      <div className="flex gap-1">
        {[0, 1, 2, 3].map((i) => (
          <div
            key={i}
            className="h-1 flex-1 rounded-full transition-all duration-300"
            style={{ backgroundColor: i < score ? color : "#e5e7eb" }}
          />
        ))}
      </div>
      {label && (
        <p className="text-xs font-medium" style={{ color }}>
          {label} password
        </p>
      )}
    </div>
  );
}

/* ─── Field wrapper ─────────────────────────────────────────────────────────── */
function Field({ label, required, error, children }) {
  return (
    <div className="flex flex-col gap-1">
      <label className="text-sm text-gray-800">
        {required && <span className="text-red-500 mr-1">*</span>}
        {label}
      </label>
      {children}
      {error && <p className="text-xs text-red-500">{error}</p>}
    </div>
  );
}

/* ─── Main ──────────────────────────────────────────────────────────────────── */
export default function RegisterPage() {
  const navigate = useNavigate();
  const location = useLocation();

  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    password2: "",
  });
  const [fieldErrors, setFieldErrors] = useState({});
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPw, setShowPw] = useState(false);
  const [showPw2, setShowPw2] = useState(false);

  const handleChange = (key) => (e) => {
    setFormData((s) => ({ ...s, [key]: e.target.value }));
    setFieldErrors((s) => ({ ...s, [key]: undefined }));
    setError("");
  };

  const validate = () => {
    const errs = {};
    if (!formData.firstName.trim()) errs.firstName = "First name is required";
    if (!formData.lastName.trim())  errs.lastName  = "Last name is required";
    if (!formData.email.trim())     errs.email     = "Email is required";
    else if (!/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i.test(formData.email))
      errs.email = "Enter a valid email address";
    if (!formData.password)         errs.password  = "Password is required";
    else if (formData.password.length < 8)
      errs.password = "Must be at least 8 characters";
    if (!formData.password2)        errs.password2 = "Please confirm your password";
    else if (formData.password !== formData.password2)
      errs.password2 = "Passwords do not match";
    setFieldErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    if (!validate()) { showError("Please fix the highlighted fields."); return; }

    setLoading(true);
    try {
      // FIX: use the same endpoint as AppContext (/accounts/register/)
      // FIX: api.post() returns an Axios response — don't check response.user
      //      (that's always undefined). If no error is thrown, the request succeeded.
      await api.post("/accounts/register/", {
        email: formData.email,
        password: formData.password,
        password2: formData.password2,
        first_name: formData.firstName,
        last_name: formData.lastName,
      });

      // Reaching here means 2xx — success
      showSuccess("Account created! Redirecting to sign in…");
      setTimeout(
        () => navigate("/login", { state: { from: location.state?.from } }),
        2200
      );
    } catch (err) {
      if (err.response?.data) {
        const data = err.response.data;
        const fe = {};
        ["email", "password", "password2", "first_name", "last_name"].forEach((f) => {
          if (data[f]) {
            const key =
              f === "first_name" ? "firstName" : f === "last_name" ? "lastName" : f;
            fe[key] = Array.isArray(data[f]) ? data[f][0] : data[f];
          }
        });
        if (Object.keys(fe).length) {
          setFieldErrors(fe);
          showError("Please fix the highlighted fields.");
        } else {
          const msg = data.detail || data.error || "Registration failed.";
          setError(msg);
          showError(msg);
        }
      } else {
        const msg = "Registration failed. Please check your connection.";
        setError(msg);
        showError(msg);
      }
    } finally {
      setLoading(false);
    }
  };

  const inputCls = (field) =>
    `w-full px-3 py-2.5 rounded border text-sm text-gray-900 bg-gray-50 placeholder:text-gray-300 outline-none transition focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-100 ${
      fieldErrors[field]
        ? "border-red-400 bg-red-50 focus:border-red-400 focus:ring-red-100"
        : "border-gray-200"
    }`;

  return (
    <Layout>
      <div className="min-h-screen flex items-center justify-center bg-white px-4 py-12">
        <div className="w-full max-w-sm">

          {/* Title */}
          <h1 className="text-2xl font-bold text-gray-900 text-center mb-6">
            Register
          </h1>

          {/* Global error */}
          {error && (
            <div className="mb-4 px-3 py-2.5 rounded border border-red-200 bg-red-50 text-red-600 text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-4">

            {/* Name row */}
            <div className="flex gap-3">
              <Field label="First name" required error={fieldErrors.firstName}>
                <input
                  type="text"
                  value={formData.firstName}
                  onChange={handleChange("firstName")}
                  placeholder="Jane"
                  className={inputCls("firstName")}
                />
              </Field>
              <Field label="Last name" required error={fieldErrors.lastName}>
                <input
                  type="text"
                  value={formData.lastName}
                  onChange={handleChange("lastName")}
                  placeholder="Doe"
                  className={inputCls("lastName")}
                />
              </Field>
            </div>

            {/* Email */}
            <Field label="Email" required error={fieldErrors.email}>
              <input
                type="email"
                value={formData.email}
                onChange={handleChange("email")}
                placeholder="jane@example.com"
                className={inputCls("email")}
              />
            </Field>

            {/* Password */}
            <Field label="Password" required error={fieldErrors.password}>
              <div className="relative">
                <input
                  type={showPw ? "text" : "password"}
                  value={formData.password}
                  onChange={handleChange("password")}
                  placeholder="Min. 8 characters"
                  className={`${inputCls("password")} pr-14`}
                />
                <button
                  type="button"
                  onClick={() => setShowPw((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-gray-400 hover:text-gray-600 transition-colors"
                >
                  {showPw ? "Hide" : "Show"}
                </button>
              </div>
              <PasswordStrength password={formData.password} />
            </Field>

            {/* Confirm password */}
            <Field label="Confirm password" required error={fieldErrors.password2}>
              <div className="relative">
                <input
                  type={showPw2 ? "text" : "password"}
                  value={formData.password2}
                  onChange={handleChange("password2")}
                  placeholder="Re-enter password"
                  className={`${inputCls("password2")} pr-14`}
                />
                <button
                  type="button"
                  onClick={() => setShowPw2((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-gray-400 hover:text-gray-600 transition-colors"
                >
                  {showPw2 ? "Hide" : "Show"}
                </button>
              </div>
            </Field>

            {/* Divider */}
            <hr className="border-gray-100 my-1" />

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 rounded bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white text-sm font-semibold transition disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {loading ? "Creating account…" : "Register"}
            </button>

            {/* Sign in link */}
            <p className="text-center text-sm text-gray-500">
              Already have an account?{" "}
              <Link to="/login" className="text-blue-600 hover:underline font-medium">
                Sign in
              </Link>
            </p>

          </form>
        </div>
      </div>
    </Layout>
  );
}