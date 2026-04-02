import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Layout from "../components/Layout/Layout";
import api, { socialAuth } from "../services/api";
import { showError, showSuccess } from "../services/toast";
import { Eye, EyeOff, ChevronLeft } from "lucide-react";
import { GoogleOAuthProvider, useGoogleLogin } from "@react-oauth/google";

const GOOGLE_CLIENT_ID = process.env.REACT_APP_GOOGLE_CLIENT_ID || "";

function Field({ label, required, error, children }) {
  return (
    <div className="flex flex-col gap-1.5 w-full">
      <label className="text-sm font-medium text-[#4E3B2C]">
        {required && <span className="text-red-400 mr-1">*</span>}
        {label}
      </label>
      {children}
      {error && <p className="text-xs text-red-500 font-medium">{error}</p>}
    </div>
  );
}

function RegisterForm() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    password2: "",
  });

  const [fieldErrors, setFieldErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [showPw, setShowPw] = useState(false);

  const handleChange = (key) => (e) => {
    setFormData((s) => ({ ...s, [key]: e.target.value }));
    setFieldErrors((s) => ({ ...s, [key]: undefined }));
  };

  const validate = () => {
    const errs = {};
    if (!formData.firstName.trim()) errs.firstName = "Required";
    if (!formData.lastName.trim()) errs.lastName = "Required";
    if (!formData.email.trim()) errs.email = "Email is required";
    if (!formData.password) errs.password = "Password is required";
    if (formData.password !== formData.password2)
      errs.password2 = "Passwords do not match";
    setFieldErrors(errs);
    return Object.keys(errs).length === 0;
  };

  // --- MANUAL REGISTRATION ---
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);
    try {
      await api.post("/accounts/register/", {
        email: formData.email,
        password: formData.password,
        password2: formData.password2,
        first_name: formData.firstName,
        last_name: formData.lastName,
      });
      showSuccess("Account created successfully!");
      navigate("/login");
    } catch (err) {
      if (err.response && err.response.data) {
        setFieldErrors(err.response.data);
        showError("Registration failed. Please check the fields.");
      } else {
        showError("Backend unreachable. Check your connection.");
      }
    } finally {
      setLoading(false);
    }
  };

  // --- GOOGLE SIGNUP ---
  const handleGoogleSignup = useGoogleLogin({
    onSuccess: async (tokenResponse) => {
      setLoading(true);
      try {
        await socialAuth('google', tokenResponse.access_token);
        showSuccess("Google sign-up successful!");
        navigate("/");
      } catch (err) {
        showError(err.response?.data?.non_field_errors?.[0] || "Google sign-up failed.");
      } finally {
        setLoading(false);
      }
    },
    onError: () => showError("Google sign-in was cancelled or failed."),
  });

  // --- FACEBOOK SIGNUP ---
  const handleFacebookSignup = () => {
    if (!window.FB) {
      showError("Facebook SDK not loaded. Please refresh and try again.");
      return;
    }
    window.FB.login(
      (response) => {
        if (response.authResponse?.accessToken) {
          setLoading(true);
          socialAuth('facebook', response.authResponse.accessToken)
            .then(() => {
              showSuccess("Facebook sign-up successful!");
              navigate("/");
            })
            .catch((err) => {
              showError(err.response?.data?.non_field_errors?.[0] || "Facebook sign-up failed.");
            })
            .finally(() => setLoading(false));
        } else {
          showError("Facebook login was cancelled.");
        }
      },
      { scope: "email,public_profile" }
    );
  };

  const inputCls =
    "w-full px-4 py-2.5 rounded-lg border border-[#DCC7AA] text-sm text-[#4E3B2C] bg-white outline-none focus:ring-2 focus:ring-[#A6754D]/20 focus:border-[#A6754D] transition";

  return (
    <Layout>
      <div className="min-h-screen flex flex-col md:flex-row w-full">
        {/* Left Branding Panel */}
        <div className="hidden md:flex md:w-5/12 bg-[#A6754D] text-white p-12 flex-col justify-between items-center text-center">
          <Link to="/" className="self-start flex items-center gap-1 text-sm text-white no-underline hover:underline">
            <ChevronLeft size={16} /> Home Page
          </Link>
          <div className="max-w-xs">
            <h1 className="text-5xl font-bold mb-6">Get Started</h1>
            <p className="text-[#F4EDE4]/80 mb-10">Already have an account?</p>
            <Link
  to="/login"
  className="inline-block px-12 py-3 border-2 border-white text-white no-underline rounded-full font-bold hover:bg-white hover:text-black transition"
>
  Log in
            </Link>
          </div>
          <div className="text-xs opacity-60">© 2026 Ecom Inc.</div>
        </div>

        {/* Right Form Panel */}
        <div className="w-full md:w-7/12 bg-[#F4EDE4] flex items-center justify-center p-8 md:p-16">
          <div className="w-full max-w-md bg-white p-8 md:p-10 rounded-2xl border border-[#DCC7AA] shadow-sm">
            <h2 className="text-2xl font-bold text-[#4E3B2C] mb-6">Create account</h2>

            <div className="flex gap-3 mb-5">
              <button
                type="button"
                onClick={() => handleGoogleSignup()}
                disabled={loading}
                className="flex-1 flex items-center justify-center gap-2 py-2.5 border border-[#DCC7AA] rounded-lg bg-white hover:bg-[#F4EDE4] transition text-sm font-medium text-[#4E3B2C]"
              >
                Google
              </button>
              <button
                type="button"
                onClick={handleFacebookSignup}
                disabled={loading}
                className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-white text-sm font-medium transition hover:opacity-90 bg-[#1877F2]"
              >
                Facebook
              </button>
            </div>

            <div className="relative text-center mb-5">
              <hr className="border-[#DCC7AA]" />
              <span className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white px-3 text-xs text-[#B5A090]">
                OR
              </span>
            </div>

            <form onSubmit={handleSubmit} className="flex flex-col gap-5">
              <div className="flex gap-4">
                <Field label="First Name" required error={fieldErrors.first_name || fieldErrors.firstName}>
                  <input type="text" placeholder="First Name" className={inputCls} onChange={handleChange("firstName")} />
                </Field>
                <Field label="Last Name" required error={fieldErrors.last_name || fieldErrors.lastName}>
                  <input type="text" placeholder="Last Name" className={inputCls} onChange={handleChange("lastName")} />
                </Field>
              </div>

              <Field label="Email" required error={fieldErrors.email}>
                <input type="email" placeholder="Email Address" className={inputCls} onChange={handleChange("email")} />
              </Field>

              <Field label="Password" required error={fieldErrors.password}>
                <div className="relative">
                  <input
                    type={showPw ? "text" : "password"}
                    placeholder="••••••••"
                    className={`${inputCls} pr-11`}
                    onChange={handleChange("password")}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPw(!showPw)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-[#B5A090]"
                  >
                    {showPw ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </Field>

              <Field label="Confirm Password" required error={fieldErrors.password2}>
                <input type="password" placeholder="••••••••" className={inputCls} onChange={handleChange("password2")} />
              </Field>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 bg-[#A6754D] hover:bg-[#8D5F3B] text-white font-bold rounded-lg transition mt-2"
              >
                {loading ? "Processing..." : "Sign up"}
              </button>
            </form>
          </div>
        </div>
      </div>
    </Layout>
  );
}

export default function RegisterPage() {
  return (
    <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
      <RegisterForm />
    </GoogleOAuthProvider>
  );
}