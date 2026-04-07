import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAppContext } from "../context/AppContext";
import { showError, showSuccess } from "../services/toast";
import { socialAuth } from "../services/api";
import { GoogleOAuthProvider, useGoogleLogin } from "@react-oauth/google";

const GOOGLE_CLIENT_ID = process.env.REACT_APP_GOOGLE_CLIENT_ID || "";

const BG_IMAGES = [
  "https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=1920&q=80",
  "https://images.unsplash.com/photo-1483985988355-763728e1935b?w=1920&q=80",
  "https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?w=1920&q=80",
  "https://images.unsplash.com/photo-1472851294608-062f824d29cc?w=1920&q=80",
];

// Inner component — needs to be inside GoogleOAuthProvider to use useGoogleLogin
function LoginForm() {
  const { login, loginWithTokens } = useAppContext();
  const [email, setEmail]               = useState("");
  const [password, setPassword]         = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading]           = useState(false);
  const [formError, setFormError]       = useState("");
  const [currentBg, setCurrentBg]       = useState(0);
  const navigate  = useNavigate();
  const location  = useLocation();

  const from = location.state?.from?.pathname || "/";

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentBg((prev) => (prev + 1) % BG_IMAGES.length);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  const canSubmit = email.trim().length > 0 && password.length > 0 && !loading;

  // --- MANUAL LOGIN ---
  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError("");
    if (!email.trim() || !password) {
      const msg = "Please enter both email and password.";
      setFormError(msg);
      showError(msg);
      return;
    }
    setLoading(true);
    try {
      await login(email.trim(), password);
      showSuccess("Login successful.");
      setTimeout(() => navigate(from, { replace: true }), 2000);
    } catch (err) {
      const msg =
        err.response?.data?.non_field_errors?.[0] ||
        err.response?.data?.detail ||
        err.message ||
        "Login failed. Please try again.";
      setFormError(msg);
      showError(msg);
    } finally {
      setLoading(false);
    }
  };
  const handleGoogleLogin = useGoogleLogin({
    onSuccess: async (tokenResponse) => {
      setLoading(true);
      try {
        const data = await socialAuth('google', tokenResponse.access_token);
        // Save tokens and user — adjust based on your AppContext API
        loginWithTokens(data);
        showSuccess("Google login successful.");
        setTimeout(() => navigate(from, { replace: true }), 2000);
      } catch (err) {
        const msg = err.response?.data?.non_field_errors?.[0] || "Google login failed.";
        setFormError(msg);
        showError(msg);
      } finally {
        setLoading(false);
      }
    },
    onError: () => {
      showError("Google sign-in was cancelled or failed.");
    },
  });
  const handleFacebookLogin = () => {
    if (!window.FB) {
      showError("Facebook SDK not loaded. Please refresh and try again.");
      return;
    }
    window.FB.login(
      (response) => {
        if (response.authResponse?.accessToken) {
          setLoading(true);
          socialAuth('facebook', response.authResponse.accessToken)
            .then((data) => {
              loginWithTokens(data);
              showSuccess("Facebook login successful.");
              setTimeout(() => navigate(from, { replace: true }), 2000);
            })
            .catch((err) => {
              const msg = err.response?.data?.non_field_errors?.[0] || "Facebook login failed.";
              setFormError(msg);
              showError(msg);
            })
            .finally(() => setLoading(false));
        } else {
          showError("Facebook login was cancelled.");
        }
      },
      { scope: "email,public_profile" }
    );
  };

  return (
    <>
      <style>{`
        .login-bg-slide {
          position: absolute; inset: 0;
          background-size: cover; background-position: center;
          background-repeat: no-repeat;
          opacity: 0; transition: opacity 1s ease-in-out;
        }
        .login-bg-slide.active { opacity: 1; }
        .bg-dot-btn {
          width: 8px; height: 8px; border-radius: 50%;
          background: rgba(255,255,255,0.45); border: none;
          padding: 0; cursor: pointer;
          transition: background 0.3s, transform 0.3s;
        }
        .bg-dot-btn.active { background: #fff; transform: scale(1.3); }
      `}</style>

      <div className="min-vh-100 d-flex align-items-center justify-content-center p-3 position-relative overflow-hidden">

        {BG_IMAGES.map((img, i) => (
          <div
            key={img}
            className={`login-bg-slide${i === currentBg ? " active" : ""}`}
            style={{ backgroundImage: `linear-gradient(rgba(0,0,0,0.5),rgba(0,0,0,0.5)),url(${img})` }}
          />
        ))}

        <div className="position-absolute bottom-0 start-50 translate-middle-x d-flex gap-2 pb-3" style={{ zIndex: 2 }}>
          {BG_IMAGES.map((_, i) => (
            <button
              key={i}
              className={`bg-dot-btn${i === currentBg ? " active" : ""}`}
              onClick={() => setCurrentBg(i)}
              aria-label={`Background ${i + 1}`}
            />
          ))}
        </div>

        <div className="container-fluid position-relative" style={{ zIndex: 1 }}>
          <div className="row justify-content-center">
            <div className="col-12 col-sm-11 col-md-9 col-lg-7 col-xl-5 col-xxl-4">
              <div
                className="card border-0 rounded-3 shadow"
                style={{ backgroundColor: "rgba(255,255,255,0.95)", backdropFilter: "blur(10px)" }}
              >
                <div className="card-body p-4">

                  <div className="text-center mb-3">
                    <div className="mb-2">
                      <div
                        className="d-inline-flex align-items-center justify-content-center rounded-circle"
                        style={{ width: "56px", height: "56px", background: "linear-gradient(135deg,#FF6B6B 0%,#FFE66D 100%)" }}
                      >
                        <i className="fas fa-shopping-bag text-white" style={{ fontSize: "24px" }} />
                      </div>
                    </div>
                    <h2
                      className="fw-bold mb-1"
                      style={{
                        fontSize: "24px",
                        background: "linear-gradient(135deg,#FF6B6B 0%,#FF8E53 100%)",
                        WebkitBackgroundClip: "text",
                        WebkitTextFillColor: "transparent",
                        backgroundClip: "text",
                      }}
                    >
                      Welcome Back
                    </h2>
                    <p className="text-muted mb-0 small">Sign in to your account to continue</p>
                  </div>

                  <div className="row g-2 mb-3">
                    <div className="col-6">
                      <button
                        type="button"
                        onClick={() => handleGoogleLogin()}
                        disabled={loading}
                        className="btn btn-light border w-100 d-flex align-items-center justify-content-center py-2"
                      >
                        <svg className="me-2" width="16" height="16" viewBox="0 0 18 18" xmlns="http://www.w3.org/2000/svg">
                          <path d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.717v2.258h2.908c1.702-1.567 2.684-3.874 2.684-6.615z" fill="#4285F4"/>
                          <path d="M9.003 18c2.43 0 4.467-.806 5.956-2.184l-2.908-2.258c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.96v2.332C2.44 15.983 5.485 18 9.003 18z" fill="#34A853"/>
                          <path d="M3.964 10.712c-.18-.54-.282-1.117-.282-1.71 0-.593.102-1.17.282-1.71V4.96H.957C.347 6.175 0 7.55 0 9.002c0 1.452.348 2.827.957 4.042l3.007-2.332z" fill="#FBBC05"/>
                          <path d="M9.003 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.464.891 11.426 0 9.003 0 5.485 0 2.44 2.017.96 4.958L3.967 7.29c.708-2.127 2.692-3.71 5.036-3.71z" fill="#EA4335"/>
                        </svg>
                        <span className="small fw-medium">Google</span>
                      </button>
                    </div>
                    <div className="col-6">
                      <button
                        type="button"
                        onClick={handleFacebookLogin}
                        disabled={loading}
                        className="btn w-100 d-flex align-items-center justify-content-center py-2 text-white"
                        style={{ backgroundColor: "#1877F2", borderColor: "#1877F2" }}
                      >
                        <svg className="me-2" width="16" height="16" viewBox="0 0 24 24" fill="white" xmlns="http://www.w3.org/2000/svg">
                          <path d="M24 12.073C24 5.405 18.627 0 12 0S0 5.405 0 12.073C0 18.1 4.388 23.094 10.125 24v-8.437H7.078v-3.49h3.047V9.41c0-3.025 1.792-4.697 4.533-4.697 1.312 0 2.686.236 2.686.236v2.97h-1.513c-1.491 0-1.956.93-1.956 1.886v2.267h3.328l-.532 3.49h-2.796V24C19.612 23.094 24 18.1 24 12.073z"/>
                        </svg>
                        <span className="small fw-medium">Facebook</span>
                      </button>
                    </div>
                  </div>

                  <div className="position-relative text-center mb-3">
                    <hr className="my-2" />
                    <span className="position-absolute top-50 start-50 translate-middle bg-white px-2 text-muted small">OR</span>
                  </div>

                  {formError && (
                    <div className="alert alert-danger d-flex align-items-center py-2 mb-3 small" role="alert">
                      <i className="fas fa-exclamation-circle me-2" />
                      <span>{formError}</span>
                    </div>
                  )}

                  <form onSubmit={handleSubmit} noValidate>
                    <div className="mb-3">
                      <label htmlFor="email" className="form-label fw-semibold text-dark mb-1 small">
                        Email Address
                      </label>
                      <input
                        id="email" type="email" required autoComplete="email"
                        value={email} onChange={(e) => setEmail(e.target.value)}
                        className="form-control py-2"
                        placeholder="Enter your email address"
                        disabled={loading}
                      />
                    </div>

                    <div className="mb-3">
                      <div className="d-flex justify-content-between align-items-center mb-1">
                        <label htmlFor="password" className="form-label fw-semibold text-dark mb-0 small">
                          Password
                        </label>
                        <button
                          type="button"
                          className="btn btn-link text-primary text-decoration-none p-0 small"
                          disabled={loading}
                          onClick={() => navigate("/forgot-password")}
                        >
                          Forgot password?
                        </button>
                      </div>
                      <div className="position-relative">
                        <input
                          id="password"
                          type={showPassword ? "text" : "password"}
                          required autoComplete="current-password"
                          value={password} onChange={(e) => setPassword(e.target.value)}
                          className="form-control py-2 pe-5"
                          placeholder="Enter your password"
                          disabled={loading}
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword((p) => !p)}
                          className="btn btn-link position-absolute top-50 end-0 translate-middle-y me-2 p-0 text-muted"
                          style={{ zIndex: 5 }}
                          aria-label={showPassword ? "Hide password" : "Show password"}
                        >
                          <i className={`fas ${showPassword ? "fa-eye-slash" : "fa-eye"}`} />
                        </button>
                      </div>
                    </div>

                    <div className="d-grid mb-3">
                      <button
                        type="submit" disabled={!canSubmit}
                        className="btn py-2 fw-semibold text-white"
                        style={{
                          background: "linear-gradient(135deg,#FF6B6B 0%,#FF8E53 100%)",
                          border: "none",
                          opacity: !canSubmit ? 0.65 : 1,
                        }}
                      >
                        {loading ? (
                          <><span className="spinner-border spinner-border-sm me-2" role="status" />Signing In…</>
                        ) : "Sign In"}
                      </button>
                    </div>
                  </form>

                  <div className="text-center">
                    <p className="mb-0 text-muted small">
                      Don&apos;t have an account?{" "}
                      <button
                        type="button"
                        onClick={() => navigate("/register")}
                        className="btn btn-link text-primary text-decoration-none p-0 fw-semibold small"
                        disabled={loading}
                      >
                        Create account
                      </button>
                    </p>
                  </div>

                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

// Wrap with GoogleOAuthProvider so useGoogleLogin hook works
export default function LoginPage() {
  return (
    <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
      <LoginForm />
    </GoogleOAuthProvider>
  );
}