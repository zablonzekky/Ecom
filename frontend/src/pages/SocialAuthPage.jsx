import React, { useEffect } from "react";
import { useParams } from "react-router-dom";
import { API_BASE_URL } from "../services/api";

export default function SocialAuthPage() {
  const { provider } = useParams();
  useEffect(() => {
    window.location.href = `${API_BASE_URL}/accounts/auth/${provider}/`;
  }, [provider]);
  return <div className="py-16 text-center">Redirecting to {provider} authentication...</div>;
}
