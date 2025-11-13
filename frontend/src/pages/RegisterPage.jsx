import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAppContext } from "../context/AppContext";
import Layout from "../components/Layout";
import api from "../services/api";
import toast from "react-hot-toast";

function RegisterPage() {
  const { setCurrentPage } = useAppContext();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    password2: "",
    firstName: "",
    lastName: "",
  });

  const [loading, setLoading] = useState(false);
  const [fieldErrors, setFieldErrors] = useState({});
  const [error, setError] = useState("");

  // Input change handler
  const handleChange = (key) => (e) => {
    setFormData((s) => ({ ...s, [key]: e.target.value }));
    setFieldErrors((s) => ({ ...s, [key]: undefined }));
    setError("");
  };

  // Frontend validation
  const validate = () => {
    const errs = {};
    if (!formData.username.trim()) errs.username = "Username is required";
    if (!formData.email.trim()) errs.email = "Email is required";
    else if (!/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i.test(formData.email))
      errs.email = "Enter a valid email";
    if (!formData.firstName.trim()) errs.firstName = "First name is required";
    if (!formData.lastName.trim()) errs.lastName = "Last name is required";
    if (!formData.password) errs.password = "Password is required";
    if (!formData.password2) errs.password2 = "Please confirm your password";
    if (formData.password && formData.password2 && formData.password !== formData.password2)
      errs.password2 = "Passwords do not match";
    if (formData.password && formData.password.length < 8)
      errs.password = "Password must be at least 8 characters";

    setFieldErrors(errs);
    return Object.keys(errs).length === 0;
  };

  // Submit handler
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!validate()) {
      toast.error("Please fix the errors in the form", {
        duration: 3000,
        position: "top-center",
      });
      return;
    }

    setLoading(true);
    try {
      const response = await api.post("/accounts/register/", {
        username: formData.username,
        email: formData.email,
        password: formData.password,
        password2: formData.password2,
        first_name: formData.firstName,
        last_name: formData.lastName,
      });

      if (response.user) {
        // Show success toast with longer duration
        toast.success("🎉 Account created successfully! Redirecting to login...", {
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

        // Redirect to login after toast is visible
        setTimeout(() => {
          navigate("/login");
        }, 2000);
      } else {
        setError(response.error || "Registration failed");
        toast.error(response.error || "Registration failed", {
          duration: 4000,
          position: "top-center",
        });
      }
    } catch (err) {
      if (err.response && err.response.data) {
        const data = err.response.data;
        const fieldErrs = {};

        ["username", "email", "password", "password2", "first_name", "last_name"].forEach(
          (field) => {
            if (data[field]) {
              fieldErrs[
                field === "first_name"
                  ? "firstName"
                  : field === "last_name"
                  ? "lastName"
                  : field
              ] = data[field][0];
            }
          }
        );

        if (Object.keys(fieldErrs).length > 0) {
          setFieldErrors(fieldErrs);
          toast.error("Please fix the errors in the form", {
            duration: 3000,
            position: "top-center",
          });
        } else if (data.detail) {
          setError(data.detail);
          toast.error(data.detail, {
            duration: 4000,
            position: "top-center",
          });
        } else if (data.error) {
          setError(data.error);
          toast.error(data.error, {
            duration: 4000,
            position: "top-center",
          });
        } else {
          const errorMsg = "Registration failed. Please check your input.";
          setError(errorMsg);
          toast.error(errorMsg, {
            duration: 4000,
            position: "top-center",
          });
        }
      } else {
        const errorMsg = "Registration failed. Please check your input.";
        setError(errorMsg);
        toast.error(errorMsg, {
          duration: 4000,
          position: "top-center",
        });
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout>
      <div className="bg-white py-8 px-4">
        <div className="w-full max-w-2xl mx-auto">
          <main className="w-full bg-gray-50 border border-gray-100 rounded-lg shadow-sm p-8 md:p-12">
            <header className="mb-6 text-center">
              <h1 className="text-2xl md:text-3xl font-semibold text-gray-900">
                Create your account
              </h1>
            </header>

            {error && (
              <div
                role="alert"
                className="mb-4 text-sm text-red-700 bg-red-50 border border-red-100 rounded px-4 py-2"
              >
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="flex flex-col gap-4" noValidate>
              {/* Username & Email */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <label className="flex flex-col">
                  <span className="text-xs text-gray-700 mb-2">Username</span>
                  <input
                    type="text"
                    value={formData.username}
                    onChange={handleChange("username")}
                    aria-invalid={!!fieldErrors.username}
                    className="min-h-[56px] px-4 py-3 rounded-lg border border-gray-200 text-base focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-gray-300"
                    placeholder="Enter username"
                  />
                  {fieldErrors.username && (
                    <span className="mt-1 text-xs text-red-600">{fieldErrors.username}</span>
                  )}
                </label>

                <label className="flex flex-col">
                  <span className="text-xs text-gray-700 mb-2">Email</span>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={handleChange("email")}
                    aria-invalid={!!fieldErrors.email}
                    className="min-h-[56px] px-4 py-3 rounded-lg border border-gray-200 text-base focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-gray-300"
                    placeholder="Enter email"
                  />
                  {fieldErrors.email && (
                    <span className="mt-1 text-xs text-red-600">{fieldErrors.email}</span>
                  )}
                </label>
              </div>

              {/* First & Last Name */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <label className="flex flex-col">
                  <span className="text-xs text-gray-700 mb-2">First Name</span>
                  <input
                    type="text"
                    value={formData.firstName}
                    onChange={handleChange("firstName")}
                    className="min-h-[56px] px-4 py-3 rounded-lg border border-gray-200 text-base focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-gray-300"
                    placeholder="Enter first name"
                  />
                  {fieldErrors.firstName && (
                    <span className="mt-1 text-xs text-red-600">{fieldErrors.firstName}</span>
                  )}
                </label>

                <label className="flex flex-col">
                  <span className="text-xs text-gray-700 mb-2">Last Name</span>
                  <input
                    type="text"
                    value={formData.lastName}
                    onChange={handleChange("lastName")}
                    className="min-h-[56px] px-4 py-3 rounded-lg border border-gray-200 text-base focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-gray-300"
                    placeholder="Enter last name"
                  />
                  {fieldErrors.lastName && (
                    <span className="mt-1 text-xs text-red-600">{fieldErrors.lastName}</span>
                  )}
                </label>
              </div>

              {/* Password & Confirm Password */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <label className="flex flex-col">
                  <span className="text-xs text-gray-700 mb-2">Password</span>
                  <input
                    type="password"
                    value={formData.password}
                    onChange={handleChange("password")}
                    className="min-h-[56px] px-4 py-3 rounded-lg border border-gray-200 text-base focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-gray-300"
                    placeholder="At least 8 characters"
                  />
                  {fieldErrors.password && (
                    <span className="mt-1 text-xs text-red-600">{fieldErrors.password}</span>
                  )}
                </label>

                <label className="flex flex-col">
                  <span className="text-xs text-gray-700 mb-2">Confirm Password</span>
                  <input
                    type="password"
                    value={formData.password2}
                    onChange={handleChange("password2")}
                    className="min-h-[56px] px-4 py-3 rounded-lg border border-gray-200 text-base focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-gray-300"
                    placeholder="Re-enter password"
                  />
                  {fieldErrors.password2 && (
                    <span className="mt-1 text-xs text-red-600">{fieldErrors.password2}</span>
                  )}
                </label>
              </div>

              {/* Submit button */}
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mt-6">
                <button
                  type="submit"
                  disabled={loading}
                  className="inline-flex items-center justify-center w-full sm:w-auto px-6 py-3 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 hover:scale-[1.01] transition disabled:opacity-60 focus:ring-4 focus:ring-blue-300"
                >
                  {loading ? "Creating..." : "Create account"}
                </button>

                <div className="text-sm text-gray-600 text-center">
                  Already have an account?{" "}
                  <button
                    type="button"
                    onClick={() => navigate("/login")}
                    className="text-blue-600 hover:text-blue-800 font-semibold"
                  >
                    Sign in
                  </button>
                </div>
              </div>
            </form>
          </main>
        </div>
      </div>
    </Layout>
  );
}

export default RegisterPage;