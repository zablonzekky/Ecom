// src/services/api.js

const API_BASE_URL = "http://localhost:8000/api";

const api = {
  // GET request
  get: async (endpoint, token = null) => {
    const headers = { "Content-Type": "application/json" };
    if (token) headers["Authorization"] = `Bearer ${token}`;

    const response = await fetch(`${API_BASE_URL}${endpoint}`, { headers });

    // Parse JSON safely
    const data = await response.json().catch(() => ({}));

    // Throw parsed JSON for error handling if response not OK
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

    // Parse JSON safely
    const data = await response.json().catch(() => ({}));

    // Throw parsed JSON for error handling if response not OK
    if (!response.ok) throw data;

    return data;
  },

  // Optional: PUT request
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

  // Optional: DELETE request
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
