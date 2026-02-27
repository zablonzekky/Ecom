import React, { useState } from "react";
import { API_BASE_URL } from "../services/api";
import { showError, showSuccess } from "../services/toast";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const submit = async (e) => {
    e.preventDefault();
    const res = await fetch(`${API_BASE_URL}/accounts/auth/password/reset/`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ email }) });
    if (res.ok) showSuccess("Password reset link sent to your email.");
    else showError("Unable to send reset link.");
  };
  return <div className="max-w-md mx-auto py-12 px-4"><h1 className="text-2xl font-bold mb-4">Forgot Password</h1><form onSubmit={submit} className="space-y-3"><input type="email" required value={email} onChange={(e)=>setEmail(e.target.value)} className="w-full border rounded-md px-3 py-2" /><button className="w-full bg-blue-600 text-white rounded-md py-2">Send Reset Link</button></form></div>;
}
