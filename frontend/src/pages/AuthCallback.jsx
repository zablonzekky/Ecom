import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAppContext } from "../context/AppContext";
import { showError, showSuccess } from "../services/toast";

const API_BASE = process.env.REACT_APP_API_URL || "http://localhost:8000";

export default function AuthCallback() {
  const navigate        = useNavigate();
  const { setUser }     = useAppContext();  // adjust to your context shape
  const [status, setStatus] = useState("Completing sign-in…");

  useEffect(() => {
    async function finishLogin() {
      try {
        setStatus("Verifying with server…");

        const res = await fetch(`${API_BASE}/api/auth/social/token/`, {
          method:      "GET",
          credentials: "include",  // send the allauth session cookie
          headers:     { "Content-Type": "application/json" },
        });

        if (!res.ok) {
          throw new Error("Session verification failed.");
        }

        const data = await res.json();
        // data = { token, email, first_name, last_name }

        // 1. Persist the DRF token for future API calls
        localStorage.setItem("authToken", data.token);

        // 2. Update app-wide context
        if (setUser) {
          setUser({
            email:     data.email,
            firstName: data.first_name,
            lastName:  data.last_name,
          });
        }

        showSuccess(`Welcome, ${data.first_name || data.email}!`);
        setStatus("Done! Redirecting…");

        // 3. Go to wherever the user was trying to reach (or home)
        const redirectTo = sessionStorage.getItem("loginRedirect") || "/";
        sessionStorage.removeItem("loginRedirect");
        navigate(redirectTo, { replace: true });

      } catch (err) {
        console.error("AuthCallback error:", err);
        setStatus("Sign-in failed. Redirecting…");
        showError("Social login failed. Please try again.");
        setTimeout(() => navigate("/login", { replace: true }), 2000);
      }
    }

    finishLogin();
  }, [navigate, setUser]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#F4EDE4]">
      <div className="text-center">
        <div className="w-12 h-12 border-4 border-[#DCC7AA] border-t-[#A6754D] rounded-full animate-spin mx-auto mb-4" />
        <p className="text-[#4E3B2C] font-medium">{status}</p>
      </div>
    </div>
  );
}