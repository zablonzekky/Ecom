// src/pages/ProfilePage.jsx
import React, { useState } from "react";
import { useAppContext } from "../context/AppContext";
import { useNavigate } from "react-router-dom";

function ProfilePage() {
  const { user, updateUser } = useAppContext();
  const navigate = useNavigate();
  const [isEditing, setIsEditing] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [formData, setFormData] = useState({
    firstName: user?.firstName || "",
    lastName: user?.lastName || "",
    email: user?.email || "",
    username: user?.username || "",
    phone: user?.phone || "",
    bio: user?.bio || "",
  });
  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordData((prev) => ({ ...prev, [name]: value }));
  };

  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage({ type: "", text: "" });
    try {
      await new Promise((resolve) => setTimeout(resolve, 1000));
      updateUser(formData);
      setMessage({ type: "success", text: "Profile updated successfully!" });
      setIsEditing(false);
    } catch (err) {
      setMessage({ type: "error", text: "Failed to update profile." });
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordUpdate = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage({ type: "", text: "" });

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setMessage({ type: "error", text: "New passwords do not match." });
      setLoading(false);
      return;
    }
    if (passwordData.newPassword.length < 6) {
      setMessage({ type: "error", text: "Password must be at least 6 characters." });
      setLoading(false);
      return;
    }

    try {
      await new Promise((resolve) => setTimeout(resolve, 1000));
      setPasswordData({ currentPassword: "", newPassword: "", confirmPassword: "" });
      setMessage({ type: "success", text: "Password updated successfully!" });
      setIsChangingPassword(false);
    } catch (err) {
      setMessage({ type: "error", text: "Failed to update password." });
    } finally {
      setLoading(false);
    }
  };

  const cancelEdit = () => {
    setIsEditing(false);
    setFormData({
      firstName: user?.firstName || "",
      lastName: user?.lastName || "",
      email: user?.email || "",
      username: user?.username || "",
      phone: user?.phone || "",
      bio: user?.bio || "",
    });
  };

  const cancelPasswordChange = () => {
    setIsChangingPassword(false);
    setPasswordData({ currentPassword: "", newPassword: "", confirmPassword: "" });
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8 w-full">
      <div className="w-full px-4 sm:px-6 lg:px-8">

        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">My Account</h1>
            <p className="text-gray-600">Manage your profile and security settings</p>
          </div>
          <button
            onClick={() => navigate("/orders")}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            My Orders
          </button>
        </div>

        {message.text && (
          <div
            className={`mb-4 p-3 rounded-md ${
              message.type === "success"
                ? "bg-green-50 text-green-800 border border-green-200"
                : "bg-red-50 text-red-800 border border-red-200"
            }`}
          >
            {message.text}
          </div>
        )}

        {/* Profile Info Section */}
        <div className="bg-white shadow-sm rounded-lg p-4 mb-4 w-full">
          <div className="flex justify-between items-center cursor-pointer" onClick={() => setIsEditing(!isEditing)}>
            <h2 className="text-lg font-semibold text-gray-900">Profile Details</h2>
            <span className="text-blue-600">{isEditing ? "▲" : "▼"}</span>
          </div>

          {isEditing ? (
            <form onSubmit={handleProfileUpdate} className="mt-3 space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <input type="text" name="firstName" value={formData.firstName} onChange={handleInputChange} placeholder="First Name" className="w-full px-2 py-1 border rounded"/>
                <input type="text" name="lastName" value={formData.lastName} onChange={handleInputChange} placeholder="Last Name" className="w-full px-2 py-1 border rounded"/>
              </div>
              <input type="text" name="username" value={formData.username} onChange={handleInputChange} placeholder="Username" className="w-full px-2 py-1 border rounded"/>
              <input type="email" name="email" value={formData.email} onChange={handleInputChange} placeholder="Email" className="w-full px-2 py-1 border rounded"/>
              <input type="tel" name="phone" value={formData.phone} onChange={handleInputChange} placeholder="Phone" className="w-full px-2 py-1 border rounded"/>
              <textarea name="bio" value={formData.bio} onChange={handleInputChange} placeholder="Bio" rows={2} className="w-full px-2 py-1 border rounded"/>
              <div className="flex justify-end space-x-2">
                <button type="button" onClick={cancelEdit} className="px-3 py-1 border rounded text-gray-700 hover:bg-gray-50 text-sm">Cancel</button>
                <button type="submit" disabled={loading} className="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 text-sm disabled:opacity-50">
                  {loading ? "Saving..." : "Save"}
                </button>
              </div>
            </form>
          ) : (
            <div className="mt-3 text-sm text-gray-900 space-y-1">
              <p><strong>First Name:</strong> {user?.firstName || "Not provided"}</p>
              <p><strong>Last Name:</strong> {user?.lastName || "Not provided"}</p>
              <p><strong>Username:</strong> {user?.username}</p>
              <p><strong>Email:</strong> {user?.email}</p>
              <p><strong>Phone:</strong> {user?.phone || "Not provided"}</p>
              <p><strong>Bio:</strong> {user?.bio || "No bio provided"}</p>
            </div>
          )}
        </div>

        {/* Password Section */}
        <div className="bg-white shadow-sm rounded-lg p-4 w-full">
          <div className="flex justify-between items-center cursor-pointer" onClick={() => setIsChangingPassword(!isChangingPassword)}>
            <h2 className="text-lg font-semibold text-gray-900">Password</h2>
            <span className="text-blue-600">{isChangingPassword ? "▲" : "▼"}</span>
          </div>

          {isChangingPassword && (
            <form onSubmit={handlePasswordUpdate} className="mt-3 space-y-3">
              <input type="password" name="currentPassword" value={passwordData.currentPassword} onChange={handlePasswordChange} placeholder="Current Password" className="w-full px-2 py-1 border rounded" required/>
              <input type="password" name="newPassword" value={passwordData.newPassword} onChange={handlePasswordChange} placeholder="New Password" className="w-full px-2 py-1 border rounded" required/>
              <input type="password" name="confirmPassword" value={passwordData.confirmPassword} onChange={handlePasswordChange} placeholder="Confirm New Password" className="w-full px-2 py-1 border rounded" required/>
              <div className="flex justify-end space-x-2">
                <button type="button" onClick={cancelPasswordChange} className="px-3 py-1 border rounded text-gray-700 hover:bg-gray-50 text-sm">Cancel</button>
                <button type="submit" disabled={loading} className="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 text-sm disabled:opacity-50">
                  {loading ? "Updating..." : "Update"}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}

export default ProfilePage;
