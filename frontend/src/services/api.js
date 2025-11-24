// src/services/api.js

const API_BASE_URL = "http://localhost:8000/api";

// Helper to build query string from params object
const buildQueryString = (params) => {
  if (!params) return "";
  return (
    "?" +
    Object.entries(params)
      .map(([key, value]) => `${encodeURIComponent(key)}=${encodeURIComponent(value)}`)
      .join("&")
  );
};

const api = {
  // GET request with optional query params
  get: async (endpoint, params = null, token = null) => {
    const headers = { "Content-Type": "application/json" };
    if (token) headers["Authorization"] = `Bearer ${token}`;

    const queryString = buildQueryString(params);
    const response = await fetch(`${API_BASE_URL}${endpoint}${queryString}`, { headers });

    const data = await response.json().catch(() => ({}));
    if (!response.ok) throw data;
    return data;
  },

  // POST request
  post: async (endpoint, payload, token = null) => {
    const headers = { "Content-Type": "application/json" };
    if (token) headers["Authorization"] = `Bearer ${token}`;

    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      method: "POST",
      headers,
      body: JSON.stringify(payload),
    });

    const data = await response.json().catch(() => ({}));
    if (!response.ok) throw data;
    return data;
  },

  // PUT request
  put: async (endpoint, payload, token = null) => {
    const headers = { "Content-Type": "application/json" };
    if (token) headers["Authorization"] = `Bearer ${token}`;

    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      method: "PUT",
      headers,
      body: JSON.stringify(payload),
    });

    const data = await response.json().catch(() => ({}));
    if (!response.ok) throw data;
    return data;
  },

  // DELETE request
  delete: async (endpoint, token = null) => {
    const headers = { "Content-Type": "application/json" };
    if (token) headers["Authorization"] = `Bearer ${token}`;

    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      method: "DELETE",
      headers,
    });

    const data = await response.json().catch(() => ({}));
    if (!response.ok) throw data;
    return data;
  },
};

export default api;
