import React, { useState } from "react";
import { API_BASE_URL } from "../services/api";
import { showError, showSuccess } from "../services/toast";
import { Mail, ArrowLeft, Send } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const submit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/api/accounts/auth/password/reset/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      if (res.ok) {
        setSubmitted(true);
        showSuccess("Password reset link sent to your email.");
      } else {
        showError("Unable to send reset link. Please check the email address.");
      }
    } catch {
      showError("Something went wrong. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  if (submitted) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center px-4 bg-[#FDFBF9]">
        <div className="max-w-md w-full bg-white border border-stone-200 rounded-2xl p-10 shadow-xl text-center">
          <div className="w-20 h-20 bg-orange-50 text-[#8B4513] rounded-full flex items-center justify-center mx-auto mb-6 text-3xl">
            <Mail size={40} />
          </div>
          <h1 className="text-2xl font-bold mb-3 text-[#5C4033]">Check your email</h1>
          <p className="text-stone-500 mb-8 leading-relaxed">
            We sent a password reset link to <br />
            <span className="font-semibold text-[#8B4513]">{email}</span>.
          </p>
          <div className="space-y-4">
            <button
              onClick={() => setSubmitted(false)}
              className="w-full bg-[#8B4513] text-white py-3 rounded-xl font-semibold hover:bg-[#703610] transition-all shadow-md"
            >
          Resend the link
            </button>
            <button
              onClick={() => navigate("/login")}
              className="flex items-center justify-center w-full text-stone-500 hover:text-[#5C4033] font-medium transition-colors"
            >
              <ArrowLeft size={18} className="mr-2" /> Back to Login
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 bg-[#FDFBF9]">
      <div className="max-w-md w-full bg-white border border-stone-100 rounded-2xl p-8 shadow-2xl shadow-stone-200/50">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold text-[#5C4033] mb-2">Forgot Password?</h1>
          <p className="text-stone-500">
         Password reset link will be sent to your Email Address if you are already registered.
          </p>
        </div>

        <form onSubmit={submit} className="space-y-6">
          <div>
            <label className="block text-sm font-bold text-[#5C4033] mb-2 ml-1 uppercase tracking-wider">
              Email Address
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-stone-50 border border-stone-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#8B4513]/20 focus:border-[#8B4513] transition-all"
              placeholder="Enter your registered email"
            />
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-[#8B4513] text-white rounded-xl py-4 font-bold hover:bg-[#703610] disabled:opacity-70 transition-all flex items-center justify-center shadow-lg shadow-stone-200"
          >
            {isLoading ? (
              <span className="flex items-center">
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-3"></div>
                Sending Link...
              </span>
            ) : (
              <span className="flex items-center">
                Send Reset Link <Send size={18} className="ml-2" />
              </span>
            )}
          </button>

          <button
            type="button"
            onClick={() => navigate("/login")}
            className="w-full text-center text-stone-500 hover:text-[#8B4513] font-medium transition-colors text-sm"
          >
            Sign in
          </button>
        </form>
      </div>
    </div>
  );
}