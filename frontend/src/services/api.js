// src/services/api.js

// const API_BASE_URL = "http://localhost:8000/api";

const API_BASE_URL = "https://ecom-426a.onrender.com/api";
// Function to refresh the access token
async function refreshAccessToken() {
  const refreshToken = localStorage.getItem('refresh_token');
  
  if (!refreshToken) {
    throw new Error('No refresh token available');
  }

  try {
    const response = await fetch(`${API_BASE_URL}/auth/token/refresh/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ refresh: refreshToken }),
    });

    if (response.ok) {
      const data = await response.json();
      localStorage.setItem('access_token', data.access);
      return data.access;
    } else {
      // Refresh token is also expired, need to login again
      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');
      localStorage.removeItem('user');
      throw new Error('Session expired. Please login again.');
    }
  } catch (error) {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('user');
    throw new Error('Session expired. Please login again.');
  }
}

// Enhanced fetch function with automatic token refresh
async function fetchWithAuth(url, options = {}) {
  let token = localStorage.getItem('access_token');

  // Add authorization header if token exists
  const headers = {
    'Content-Type': 'application/json',
    ...options.headers,
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  // Make the initial request
  let response = await fetch(url, {
    ...options,
    headers,
  });

  // If we get a 401, try to refresh the token
  if (response.status === 401) {
    try {
      // Try to refresh the token
      token = await refreshAccessToken();
      
      // Retry the request with the new token
      headers['Authorization'] = `Bearer ${token}`;
      response = await fetch(url, {
        ...options,
        headers,
      });
    } catch (error) {
      // Refresh failed, redirect to login
      window.location.href = '/login';
      throw error;
    }
  }

  return response;
}

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
    const response = await fetchWithAuth(`${API_BASE_URL}${endpoint}${queryString}`, { 
      headers,
      method: 'GET'
    });

    const data = await response.json().catch(() => ({}));
    if (!response.ok) throw data;
    return data;
  },

  // POST request
  post: async (endpoint, payload, token = null) => {
    const headers = { "Content-Type": "application/json" };
    if (token) headers["Authorization"] = `Bearer ${token}`;

    const response = await fetchWithAuth(`${API_BASE_URL}${endpoint}`, {
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

    const response = await fetchWithAuth(`${API_BASE_URL}${endpoint}`, {
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

    const response = await fetchWithAuth(`${API_BASE_URL}${endpoint}`, {
      method: "DELETE",
      headers,
    });

    const data = await response.json().catch(() => ({}));
    if (!response.ok) throw data;
    return data;
  },

  // Convenience method for authenticated requests (auto-uses token from localStorage)
  authenticated: {
    get: async (endpoint, params = null) => {
      const token = localStorage.getItem('access_token');
      return api.get(endpoint, params, token);
    },
    
    post: async (endpoint, payload) => {
      const token = localStorage.getItem('access_token');
      return api.post(endpoint, payload, token);
    },
    
    put: async (endpoint, payload) => {
      const token = localStorage.getItem('access_token');
      return api.put(endpoint, payload, token);
    },
    
    delete: async (endpoint) => {
      const token = localStorage.getItem('access_token');
      return api.delete(endpoint, token);
    },
  },
};

export default api;
export { API_BASE_URL, refreshAccessToken };
