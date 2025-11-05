// src/services/api.js

const API_BASE_URL = "http://localhost:8000/api";

const api = {
  get: async (endpoint, token = null) => {
    const headers = { "Content-Type": "application/json" };
    if (token) headers["Authorization"] = `Bearer ${token}`;

    const response = await fetch(`${API_BASE_URL}${endpoint}`, { headers });
    if (!response.ok) throw new Error("Network response was not ok");
    return response.json();
  },

  post: async (endpoint, data, token = null) => {
    const headers = { "Content-Type": "application/json" };
    if (token) headers["Authorization"] = `Bearer ${token}`;

    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      method: "POST",
      headers,
      body: JSON.stringify(data),
    });
    if (!response.ok) throw new Error("Failed to post data");
    return response.json();
  },
};

export default api;
