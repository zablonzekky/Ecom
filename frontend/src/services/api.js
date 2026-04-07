import axios from 'axios';

export const API_BASE_URL = (process.env.REACT_APP_API_URL || 'http://localhost:8000').replace(/\/+$/, '');

export const axiosInstance = axios.create({
  baseURL: `${API_BASE_URL}/api`,
});

// ─── Redirect guard (prevents looping on repeated 401s) ───────────────────────
let isRedirecting = false;

function handleLogout(isAdmin) {
  if (isRedirecting) return;
  isRedirecting = true;

  if (isAdmin) {
    localStorage.removeItem('admin_access_token');
    localStorage.removeItem('admin_refresh_token');
    localStorage.removeItem('admin_user');
    window.location.href = '/admin/login';
  } else {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('user_data');
    window.location.href = '/login';
  }
}

// ─── Request interceptor ──────────────────────────────────────────────────────
axiosInstance.interceptors.request.use(
  (config) => {
    if (!(config.data instanceof FormData)) {
      config.headers['Content-Type'] = 'application/json';
    }

    const isAdminRequest = config.url?.includes('/admin/');
    const token = isAdminRequest
      ? localStorage.getItem('admin_access_token')
      : localStorage.getItem('access_token');

    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
  },
  (error) => Promise.reject(error)
);

// ─── Response interceptor ─────────────────────────────────────────────────────
axiosInstance.interceptors.response.use(
  (response) => response,
  async (error) => {
    const original = error.config;
    const isAdminRequest = original.url?.includes('/admin/');

    if (error.response?.status === 401) {
      // Don't retry refresh calls or already-retried requests
      if (original.url?.includes('token/refresh') || original._retry) {
        handleLogout(isAdminRequest);
        return Promise.reject(error);
      }

      original._retry = true;

      try {
        const refreshKey = isAdminRequest ? 'admin_refresh_token' : 'refresh_token';
        const accessKey  = isAdminRequest ? 'admin_access_token'  : 'access_token';
        const refresh    = localStorage.getItem(refreshKey);

        // No refresh token available — logout immediately without throwing
        if (!refresh) {
          handleLogout(isAdminRequest);
          return Promise.reject(error);
        }

        // Use the correct refresh endpoint per role
        // If your backend shares one refresh endpoint, use the same URL for both
        const refreshUrl = isAdminRequest
          ? `${API_BASE_URL}/api/admin/auth/token/refresh/`
          : `${API_BASE_URL}/api/auth/token/refresh/`;

        const { data } = await axios.post(refreshUrl, { refresh });
        localStorage.setItem(accessKey, data.access);
        original.headers.Authorization = `Bearer ${data.access}`;

        // Reset redirect guard on successful refresh
        isRedirecting = false;

        return axiosInstance(original);
      } catch (err) {
        handleLogout(isAdminRequest);
        return Promise.reject(err);
      }
    }

    return Promise.reject(error);
  }
);

// ─── Token refresh utility (for non-admin use) ────────────────────────────────
export async function refreshAccessToken() {
  const refresh = localStorage.getItem('refresh_token');
  if (!refresh) throw new Error('No refresh token available');
  const { data } = await axios.post(`${API_BASE_URL}/api/auth/token/refresh/`, { refresh });
  localStorage.setItem('access_token', data.access);
  return data.access;
}

// ─── Social auth ──────────────────────────────────────────────────────────────
export async function socialAuth(provider, accessToken) {
  const { data } = await axiosInstance.post(`/accounts/auth/${provider}/`, {
    access_token: accessToken,
  });
  return data;
}

// ─── API shorthand ────────────────────────────────────────────────────────────
const api = {
  get:    (endpoint, config = {})       => axiosInstance.get(endpoint, config),
  post:   (endpoint, body, config = {}) => axiosInstance.post(endpoint, body, config),
  put:    (endpoint, body, config = {}) => axiosInstance.put(endpoint, body, config),
  patch:  (endpoint, body, config = {}) => axiosInstance.patch(endpoint, body, config),
  delete: (endpoint, config = {})       => axiosInstance.delete(endpoint, config),
};

export default api;