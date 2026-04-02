import React, { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { API_BASE_URL } from "../services/api";
import { showError, showSuccess } from "../services/toast";
import { Lock, ShieldCheck, CheckCircle } from "lucide-react";

export default function ResetPasswordPage() {
  const { uid, token } = useParams();
  const navigate = useNavigate();
  const [password, setPassword] = useState({ new_password1: "", new_password2: "" });
  const [isLoading, setIsLoading] = useState(false);
  const [done, setDone] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    if (password.new_password1 !== password.new_password2)
      return showError("Passwords do not match.");
    if (password.new_password1.length < 8)
      return showError("Password must be at least 8 characters.");

    setIsLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/api/accounts/auth/password/reset/confirm/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          uid,
          token,
          new_password1: password.new_password1,
          new_password2: password.new_password2,
        }),
      });

      if (res.ok) {
        setDone(true);
        showSuccess("Password reset successfully!");
      } else {
        const data = await res.json().catch(() => ({}));
        const message = data?.detail || "Failed to reset password. The link may have expired.";
        showError(message);
      }
    } catch {
      showError("Something went wrong. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  if (done) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center px-4 bg-[#FDFBF9]">
        <div className="max-w-md w-full bg-white border border-stone-200 rounded-2xl p-10 shadow-xl text-center">
          <div className="w-20 h-20 bg-green-50 text-green-600 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle size={48} />
          </div>
          <h1 className="text-2xl font-bold mb-2 text-[#5C4033]">All Set!</h1>
          <p className="text-stone-500 mb-8 leading-relaxed">
            Your password has been securely updated. You can now log back into your account.
          </p>
          <button
            onClick={() => navigate("/login")}
            className="w-full bg-[#8B4513] text-white rounded-xl py-4 font-bold hover:bg-[#703610] transition-all shadow-lg"
          >
            Continue to Login
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 bg-[#FDFBF9]">
      <div className="max-w-md w-full bg-white border border-stone-100 rounded-2xl p-8 shadow-2xl">
        <div className="mb-8 text-center">
          <div className="inline-flex p-3 bg-orange-50 text-[#8B4513] rounded-xl mb-4">
            <ShieldCheck size={32} />
          </div>
          <h1 className="text-3xl font-bold text-[#5C4033] mb-2">New Password</h1>
          <p className="text-stone-500">
            Please enter your new secure password below.
          </p>
        </div>

        <form onSubmit={submit} className="space-y-5">
          <div>
            <label className="block text-sm font-bold text-[#5C4033] mb-2 ml-1 uppercase tracking-wider">
              New Password
            </label>
            <div className="relative">
              <input
                type="password"
                required
                value={password.new_password1}
                onChange={(e) => setPassword({ ...password, new_password1: e.target.value })}
                className="w-full bg-stone-50 border border-stone-200 rounded-xl px-4 py-3 pl-11 focus:outline-none focus:ring-2 focus:ring-[#8B4513]/20 focus:border-[#8B4513] transition-all"
                placeholder="At least 8 characters"
              />
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-400" size={18} />
            </div>
          </div>

          <div>
            <label className="block text-sm font-bold text-[#5C4033] mb-2 ml-1 uppercase tracking-wider">
              Confirm Password
            </label>
            <div className="relative">
              <input
                type="password"
                required
                value={password.new_password2}
                onChange={(e) => setPassword({ ...password, new_password2: e.target.value })}
                className="w-full bg-stone-50 border border-stone-200 rounded-xl px-4 py-3 pl-11 focus:outline-none focus:ring-2 focus:ring-[#8B4513]/20 focus:border-[#8B4513] transition-all"
                placeholder="Repeat new password"
              />
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-400" size={18} />
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-[#8B4513] text-white rounded-xl py-4 font-bold hover:bg-[#703610] disabled:opacity-70 transition-all shadow-lg"
          >
            {isLoading ? "Updating Security..." : "Reset Password"}
          </button>
        </form>
      </div>
    </div>
  );
}