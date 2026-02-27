import React, { useState } from "react";
import { useAppContext } from "../context/AppContext";
import { showError, showSuccess } from "../services/toast";

export default function ProfilePage() {
  const { user } = useAppContext();
  const [profile, setProfile] = useState({ first_name: user?.first_name || "", last_name: user?.last_name || "", email: user?.email || "" });
  const [password, setPassword] = useState({ old_password: "", new_password1: "", new_password2: "" });

  const saveProfile = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem("access_token");
    const res = await fetch("http://localhost:8000/api/accounts/profile/", { method: "PUT", headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` }, body: JSON.stringify(profile) });
    if (res.ok) showSuccess("Profile updated.");
    else showError("Could not update profile.");
  };

  const changePassword = async (e) => {
    e.preventDefault();
    if (password.new_password1 !== password.new_password2) return showError("Passwords do not match.");
    const token = localStorage.getItem("access_token");
    const res = await fetch("http://localhost:8000/api/accounts/auth/password/change/", { method: "POST", headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` }, body: JSON.stringify(password) });
    if (res.ok) showSuccess("Password changed successfully.");
    else showError("Failed to change password.");
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 grid md:grid-cols-2 gap-6">
      <form onSubmit={saveProfile} className="bg-white border rounded-xl p-6 space-y-3">
        <h2 className="text-xl font-semibold">Profile</h2>
        <input className="w-full border rounded-md px-3 py-2" value={profile.first_name} onChange={(e)=>setProfile({ ...profile, first_name: e.target.value })} placeholder="First Name" />
        <input className="w-full border rounded-md px-3 py-2" value={profile.last_name} onChange={(e)=>setProfile({ ...profile, last_name: e.target.value })} placeholder="Last Name" />
        <input className="w-full border rounded-md px-3 py-2" type="email" value={profile.email} onChange={(e)=>setProfile({ ...profile, email: e.target.value })} placeholder="Email" />
        <button className="bg-blue-600 text-white rounded-md px-4 py-2">Save Profile</button>
      </form>
      <form onSubmit={changePassword} className="bg-white border rounded-xl p-6 space-y-3">
        <h2 className="text-xl font-semibold">Change Password</h2>
        <input type="password" className="w-full border rounded-md px-3 py-2" placeholder="Current password" value={password.old_password} onChange={(e)=>setPassword({ ...password, old_password: e.target.value })} />
        <input type="password" className="w-full border rounded-md px-3 py-2" placeholder="New password" value={password.new_password1} onChange={(e)=>setPassword({ ...password, new_password1: e.target.value })} />
        <input type="password" className="w-full border rounded-md px-3 py-2" placeholder="Confirm new password" value={password.new_password2} onChange={(e)=>setPassword({ ...password, new_password2: e.target.value })} />
        <button className="bg-blue-600 text-white rounded-md px-4 py-2">Update Password</button>
      </form>
    </div>
  );
}
