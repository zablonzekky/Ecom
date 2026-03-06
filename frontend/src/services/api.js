import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000/api';

// ─── Axios Instance ───────────────────────────────────────────────────────────
const axiosInstance = axios.create({
  baseURL: API_BASE_URL,
  headers: { 'Content-Type': 'application/json' },
});

// Request interceptor — attach access token
axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('access_token');
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor — refresh token on 401
axiosInstance.interceptors.response.use(
  (response) => response,
  async (error) => {
    const original = error.config;

    if (error.response?.status === 401 && !original._retry) {
      original._retry = true;
      try {
        const refresh = localStorage.getItem('refresh_token');
        if (!refresh) throw new Error('No refresh token available');

        const { data } = await axios.post(`${API_BASE_URL}/auth/token/refresh/`, { refresh });
        localStorage.setItem('access_token', data.access);
        original.headers.Authorization = `Bearer ${data.access}`;
        return axiosInstance(original);
      } catch {
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        localStorage.removeItem('user');
        window.location.href = '/login';
      }
    }

    return Promise.reject(error);
  }
);

// ─── Helpers ──────────────────────────────────────────────────────────────────
const buildQueryString = (params) => {
  if (!params) return '';
  return (
    '?' +
    Object.entries(params)
      .map(([key, value]) => `${encodeURIComponent(key)}=${encodeURIComponent(value)}`)
      .join('&')
  );
};

// Standalone refresh export (used in places that call it directly)
async function refreshAccessToken() {
  const refresh = localStorage.getItem('refresh_token');
  if (!refresh) throw new Error('No refresh token available');

  try {
    const { data } = await axios.post(`${API_BASE_URL}/auth/token/refresh/`, { refresh });
    localStorage.setItem('access_token', data.access);
    return data.access;
  } catch {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('user');
    throw new Error('Session expired. Please login again.');
  }
}

// ─── API Methods ──────────────────────────────────────────────────────────────
const api = {
  // GET with optional query params
  get: async (endpoint, params = null, token = null) => {
    const queryString = buildQueryString(params);
    const config = token ? { headers: { Authorization: `Bearer ${token}` } } : {};
    const { data } = await axiosInstance.get(`${endpoint}${queryString}`, config);
    return data;
  },

  // POST
  post: async (endpoint, payload, token = null) => {
    const config = token ? { headers: { Authorization: `Bearer ${token}` } } : {};
    const { data } = await axiosInstance.post(endpoint, payload, config);
    return data;
  },

  // PUT
  put: async (endpoint, payload, token = null) => {
    const config = token ? { headers: { Authorization: `Bearer ${token}` } } : {};
    const { data } = await axiosInstance.put(endpoint, payload, config);
    return data;
  },

  // PATCH
  patch: async (endpoint, payload, token = null) => {
    const config = token ? { headers: { Authorization: `Bearer ${token}` } } : {};
    const { data } = await axiosInstance.patch(endpoint, payload, config);
    return data;
  },

  // DELETE
  delete: async (endpoint, token = null) => {
    const config = token ? { headers: { Authorization: `Bearer ${token}` } } : {};
    const { data } = await axiosInstance.delete(endpoint, config);
    return data;
  },

  // Authenticated convenience methods (auto-reads token from localStorage)
  authenticated: {
    get: (endpoint, params = null) => {
      const token = localStorage.getItem('access_token');
      return api.get(endpoint, params, token);
    },
    post: (endpoint, payload) => {
      const token = localStorage.getItem('access_token');
      return api.post(endpoint, payload, token);
    },
    put: (endpoint, payload) => {
      const token = localStorage.getItem('access_token');
      return api.put(endpoint, payload, token);
    },
    patch: (endpoint, payload) => {
      const token = localStorage.getItem('access_token');
      return api.patch(endpoint, payload, token);
    },
    delete: (endpoint) => {
      const token = localStorage.getItem('access_token');
      return api.delete(endpoint, token);
    },
  },
};

export default api;
export { API_BASE_URL, refreshAccessToken, axiosInstance };