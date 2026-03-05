import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAppContext } from "../context/AppContext";
import { showError, showSuccess } from "../services/toast";

const BG_IMAGES = [
  "https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=1920&q=80",
  "https://images.unsplash.com/photo-1483985988355-763728e1935b?w=1920&q=80",
  "https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?w=1920&q=80",
  "https://images.unsplash.com/photo-1472851294608-062f824d29cc?w=1920&q=80",
];

function LoginPage() {
  const { login } = useAppContext();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formError, setFormError] = useState("");
  const [currentBg, setCurrentBg] = useState(0);
  const navigate = useNavigate();
  const location = useLocation();

  const from = location.state?.from?.pathname || "/";

  // Auto-advance background every 5 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentBg((prev) => (prev + 1) % BG_IMAGES.length);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  const canSubmit = username.trim().length > 0 && password.length > 0 && !loading;

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
      const response = await fetch("http://localhost:8000/api/auth/token/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username: username.trim(), password }),
      });

      const data = await response.json();

      if (response.ok) {
        localStorage.setItem("access_token", data.access);
        localStorage.setItem("refresh_token", data.refresh);
        sessionStorage.setItem("access_token", data.access);

        await login(username.trim(), password);
        showSuccess("Login successful.");
        setTimeout(() => navigate(from, { replace: true }), 2000);
      } else {
        const msg = data.detail || "Invalid credentials.";
        setFormError(msg);
        showError(msg);
      }
    } catch (err) {
      const msg = err.message || "Login failed. Please try again.";
      setFormError(msg);
      showError(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = () => {
    window.location.href = "http://localhost:8000/api/accounts/auth/google/";
  };

  const handleFacebookLogin = () => {
    window.location.href = "http://localhost:8000/api/accounts/auth/facebook/";
  };

  return (
    <>
      <style>{`
        .login-bg-slide {
          position: absolute;
          inset: 0;
          background-size: cover;
          background-position: center;
          background-repeat: no-repeat;
          opacity: 0;
          transition: opacity 1s ease-in-out;
        }
        .login-bg-slide.active {
          opacity: 1;
        }
        .bg-dot-btn {
          width: 8px;
          height: 8px;
          border-radius: 50%;
          background: rgba(255,255,255,0.45);
          border: none;
          padding: 0;
          cursor: pointer;
          transition: background 0.3s, transform 0.3s;
        }
        .bg-dot-btn.active {
          background: #fff;
          transform: scale(1.3);
        }
      `}</style>

      <div className="min-vh-100 d-flex align-items-center justify-content-center p-3 position-relative overflow-hidden">

        {/* Background slider layers */}
        {BG_IMAGES.map((img, i) => (
          <div
            key={img}
            className={`login-bg-slide${i === currentBg ? " active" : ""}`}
            style={{
              backgroundImage: `linear-gradient(rgba(0,0,0,0.5), rgba(0,0,0,0.5)), url(${img})`,
            }}
          />
        ))}

        {/* Dot indicators */}
        <div
          className="position-absolute bottom-0 start-50 translate-middle-x d-flex gap-2 pb-3"
          style={{ zIndex: 2 }}
        >
          {BG_IMAGES.map((_, i) => (
            <button
              key={i}
              className={`bg-dot-btn${i === currentBg ? " active" : ""}`}
              onClick={() => setCurrentBg(i)}
              aria-label={`Background ${i + 1}`}
            />
          ))}
        </div>

        {/* Login card */}
        <div className="container-fluid position-relative" style={{ zIndex: 1 }}>
          <div className="row justify-content-center">
            <div className="col-12 col-sm-11 col-md-9 col-lg-7 col-xl-5 col-xxl-4">
              <div
                className="card border-0 rounded-3 shadow"
                style={{
                  backgroundColor: "rgba(255, 255, 255, 0.95)",
                  backdropFilter: "blur(10px)",
                }}
              >
                <div className="card-body p-4">

                  {/* Header */}
                  <div className="text-center mb-3">
                    <div className="mb-2">
                      <div
                        className="d-inline-flex align-items-center justify-content-center rounded-circle"
                        style={{
                          width: "56px",
                          height: "56px",
                          background: "linear-gradient(135deg, #FF6B6B 0%, #FFE66D 100%)",
                        }}
                      >
                        <i className="fas fa-shopping-bag text-white" style={{ fontSize: "24px" }}></i>
                      </div>
                    </div>
                    <h2
                      className="fw-bold mb-1"
                      style={{
                        fontSize: "24px",
                        background: "linear-gradient(135deg, #FF6B6B 0%, #FF8E53 100%)",
                        WebkitBackgroundClip: "text",
                        WebkitTextFillColor: "transparent",
                        backgroundClip: "text",
                      }}
                    >
                      Welcome Back
                    </h2>
                    <p className="text-muted mb-0 small">
                      Sign in to your account to continue
                    </p>
                  </div>

                  {/* Social Login */}
                  <div className="row g-2 mb-3">
                    <div className="col-6">
                      <button
                        type="button"
                        onClick={handleGoogleLogin}
                        className="btn btn-light border w-100 d-flex align-items-center justify-content-center py-2"
                        disabled={loading}
                      >
                        <svg className="me-2" width="16" height="16" viewBox="0 0 18 18" xmlns="http://www.w3.org/2000/svg">
                          <path d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.717v2.258h2.908c1.702-1.567 2.684-3.874 2.684-6.615z" fill="#4285F4" />
                          <path d="M9.003 18c2.43 0 4.467-.806 5.956-2.184l-2.908-2.258c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.96v2.332C2.44 15.983 5.485 18 9.003 18z" fill="#34A853" />
                          <path d="M3.964 10.712c-.18-.54-.282-1.117-.282-1.71 0-.593.102-1.17.282-1.71V4.96H.957C.347 6.175 0 7.55 0 9.002c0 1.452.348 2.827.957 4.042l3.007-2.332z" fill="#FBBC05" />
                          <path d="M9.003 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.464.891 11.426 0 9.003 0 5.485 0 2.44 2.017.96 4.958L3.967 7.29c.708-2.127 2.692-3.71 5.036-3.71z" fill="#EA4335" />
                        </svg>
                        <span className="small fw-medium">Google</span>
                      </button>
                    </div>
                    <div className="col-6">
                      <button
                        type="button"
                        onClick={handleFacebookLogin}
                        className="btn w-100 d-flex align-items-center justify-content-center py-2 text-white"
                        style={{ backgroundColor: "#1877F2", borderColor: "#1877F2" }}
                        disabled={loading}
                      >
                        <i className="fab fa-facebook-f me-2"></i>
                        <span className="small fw-medium">Facebook</span>
                      </button>
                    </div>
                  </div>

                  {/* Divider */}
                  <div className="position-relative text-center mb-3">
                    <hr className="my-2" />
                    <span className="position-absolute top-50 start-50 translate-middle bg-white px-2 text-muted small">
                      OR
                    </span>
                  </div>

                  {/* Error Alert */}
                  {formError && (
                    <div className="alert alert-danger d-flex align-items-center py-2 mb-3 small" role="alert">
                      <i className="fas fa-exclamation-circle me-2"></i>
                      <span>{formError}</span>
                    </div>
                  )}

                  {/* Form */}
                  <form onSubmit={handleSubmit} noValidate>
                    <div className="mb-3">
                      <label htmlFor="username" className="form-label fw-semibold text-dark mb-1 small">
                        Username
                      </label>
                      <input
                        id="username"
                        type="text"
                        required
                        autoComplete="username"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        className="form-control py-2"
                        placeholder="Enter your username"
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
                          required
                          autoComplete="current-password"
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          className="form-control py-2 pe-5"
                          placeholder="Enter your password"
                          disabled={loading}
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword((p) => !p)}
                          className="btn btn-link position-absolute top-50 end-0 translate-middle-y me-2 p-0 text-muted"
                          aria-label={showPassword ? "Hide password" : "Show password"}
                          style={{ zIndex: 5 }}
                        >
                          <i className={`fas ${showPassword ? "fa-eye-slash" : "fa-eye"}`} />
                        </button>
                      </div>
                    </div>

                    <div className="d-grid mb-3">
                      <button
                        type="submit"
                        disabled={!canSubmit}
                        className="btn py-2 fw-semibold text-white"
                        style={{
                          background: "linear-gradient(135deg, #FF6B6B 0%, #FF8E53 100%)",
                          border: "none",
                          opacity: !canSubmit ? 0.65 : 1,
                        }}
                      >
                        {loading ? (
                          <>
                            <span className="spinner-border spinner-border-sm me-2" role="status" />
                            Signing In...
                          </>
                        ) : (
                          "Sign In"
                        )}
                      </button>
                    </div>
                  </form>

                  {/* Register Link */}
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

export default LoginPage;
