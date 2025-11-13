import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAppContext } from "../context/AppContext";
import api from "../services/api";
import toast from "react-hot-toast";

function LoginPage() {
  const { setUser } = useAppContext();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const response = await api.post("/auth/token/", { username, password });

      if (response.access) {
        const user = { username, token: response.access };
        setUser(user);
        localStorage.setItem("user", JSON.stringify(user));
        localStorage.setItem("token", response.access);
        
        // Show success toast with longer duration
        toast.success(`Welcome back, ${username}! `, {
          duration: 2500,
          position: "top-center",
          style: {
            background: "#169001ff",
            color: "#fff",
            padding: "16px",
            fontSize: "15px",
            fontWeight: "500",
          },
          iconTheme: {
            primary: "#fff",
            secondary: "#10b981",
          },
        });

        // Navigate after toast is visible
        setTimeout(() => {
          navigate("/");
        }, 2000);
      } else {
        const errorMsg = "Invalid credentials";
        setError(errorMsg);
        toast.error(errorMsg, {
          duration: 4000,
          position: "top-center",
          style: {
            background: "#ef4444",
            color: "#fff",
            padding: "16px",
            fontSize: "15px",
            fontWeight: "500",
          },
        });
      }
    } catch (err) {
      const errorMsg = err.response?.data?.detail || "Login failed. Please try again.";
      setError(errorMsg);
      toast.error(errorMsg, {
        duration: 4000,
        position: "top-center",
        style: {
          background: "#ef4444",
          color: "#fff",
          padding: "16px",
          fontSize: "15px",
          fontWeight: "500",
        },
      });
    } finally {
      setLoading(false);
    }
  };

  // Social login handlers
  const handleGoogleLogin = () => {
    window.location.href = "http://localhost:8000/api/accounts/auth/google/";
  };

  const handleFacebookLogin = () => {
    window.location.href = "http://localhost:8000/api/accounts/auth/facebook/";
  };

  return (
    <div
      className="min-vh-100 d-flex align-items-center justify-content-center p-3"
      style={{
        backgroundImage:
          "linear-gradient(rgba(0, 0, 0, 0.5), rgba(0, 0, 0, 0.5)), url(https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=1920&q=80)",
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
        backgroundAttachment: "fixed",
      }}
    >
      <div className="container-fluid">
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
                        background:
                          "linear-gradient(135deg, #FF6B6B 0%, #FFE66D 100%)",
                      }}
                    >
                      <i
                        className="fas fa-shopping-bag text-white"
                        style={{ fontSize: "24px" }}
                      ></i>
                    </div>
                  </div>
                  <h2
                    className="fw-bold mb-1"
                    style={{
                      fontSize: "24px",
                      background:
                        "linear-gradient(135deg, #FF6B6B 0%, #FF8E53 100%)",
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

                {/* Social Login Buttons */}
                <div className="row g-2 mb-3">
                  <div className="col-6">
                    <button
                      type="button"
                      onClick={handleGoogleLogin}
                      className="btn btn-light border w-100 d-flex align-items-center justify-content-center py-2"
                      disabled={loading}
                    >
                      <svg
                        className="me-2"
                        width="16"
                        height="16"
                        viewBox="0 0 18 18"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.717v2.258h2.908c1.702-1.567 2.684-3.874 2.684-6.615z"
                          fill="#4285F4"
                        />
                        <path
                          d="M9.003 18c2.43 0 4.467-.806 5.956-2.184l-2.908-2.258c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.96v2.332C2.44 15.983 5.485 18 9.003 18z"
                          fill="#34A853"
                        />
                        <path
                          d="M3.964 10.712c-.18-.54-.282-1.117-.282-1.71 0-.593.102-1.17.282-1.71V4.96H.957C.347 6.175 0 7.55 0 9.002c0 1.452.348 2.827.957 4.042l3.007-2.332z"
                          fill="#FBBC05"
                        />
                        <path
                          d="M9.003 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.464.891 11.426 0 9.003 0 5.485 0 2.44 2.017.96 4.958L3.967 7.29c.708-2.127 2.692-3.71 5.036-3.71z"
                          fill="#EA4335"
                        />
                      </svg>
                      <span className="small fw-medium">Google</span>
                    </button>
                  </div>

                  <div className="col-6">
                    <button
                      type="button"
                      onClick={handleFacebookLogin}
                      className="btn w-100 d-flex align-items-center justify-content-center py-2 text-white"
                      style={{
                        backgroundColor: "#1877F2",
                        borderColor: "#1877F2",
                      }}
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
                {error && (
                  <div
                    className="alert alert-danger d-flex align-items-center py-2 mb-3 small"
                    role="alert"
                  >
                    <i className="fas fa-exclamation-circle me-2"></i>
                    <span>{error}</span>
                  </div>
                )}

                {/* Login Form */}
                <form onSubmit={handleSubmit}>
                  <div className="mb-3">
                    <label
                      htmlFor="username"
                      className="form-label fw-semibold text-dark mb-1 small"
                    >
                      Username
                    </label>
                    <input
                      id="username"
                      type="text"
                      required
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      className="form-control py-2"
                      placeholder="Enter your username"
                      disabled={loading}
                    />
                  </div>

                  <div className="mb-3">
                    <div className="d-flex justify-content-between align-items-center mb-1">
                      <label
                        htmlFor="password"
                        className="form-label fw-semibold text-dark mb-0 small"
                      >
                        Password
                      </label>
                      <button
                        type="button"
                        className="btn btn-link text-primary text-decoration-none p-0 small"
                        disabled={loading}
                      >
                        Forgot password?
                      </button>
                    </div>
                    <input
                      id="password"
                      type="password"
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="form-control py-2"
                      placeholder="Enter your password"
                      disabled={loading}
                    />
                  </div>

                  <div className="d-grid mb-3">
                    <button
                      type="submit"
                      disabled={loading}
                      className="btn btn-primary py-2 fw-semibold"
                      style={{
                        background:
                          "linear-gradient(135deg, #FF6B6B 0%, #FF8E53 100%)",
                        border: "none",
                      }}
                    >
                      {loading ? (
                        <>
                          <span
                            className="spinner-border spinner-border-sm me-2"
                            role="status"
                          ></span>
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
  );
}

export default LoginPage;