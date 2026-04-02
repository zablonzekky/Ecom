import axios from 'axios';

export const API_BASE_URL = (process.env.REACT_APP_API_URL || 'http://localhost:8000').replace(/\/+$/, '');

export const axiosInstance = axios.create({
  baseURL: `${API_BASE_URL}/api`,
  headers: { 'Content-Type': 'application/json' },
});

axiosInstance.interceptors.request.use(
  (config) => {
    // FIX: admin routes use admin_access_token, everything else uses access_token
    const isAdminRequest = config.url?.includes('/admin/');
    const token = isAdminRequest
      ? localStorage.getItem('admin_access_token')
      : localStorage.getItem('access_token');

    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
  },
  (error) => Promise.reject(error)
);

axiosInstance.interceptors.response.use(
  (response) => response,
  async (error) => {
    const original = error.config;
    const isAdminRequest = original.url?.includes('/admin/');

    if (error.response?.status === 401 && !original._retry && !original.url.includes('token/refresh')) {
      original._retry = true;
      try {
        const refreshKey = isAdminRequest ? 'admin_refresh_token' : 'refresh_token';
        const accessKey  = isAdminRequest ? 'admin_access_token'  : 'access_token';
        const refresh = localStorage.getItem(refreshKey);
        if (!refresh) throw new Error('No refresh token');

        const { data } = await axios.post(`${API_BASE_URL}/api/auth/token/refresh/`, { refresh });
        localStorage.setItem(accessKey, data.access);
        original.headers.Authorization = `Bearer ${data.access}`;
        return axiosInstance(original);
      } catch (err) {
        if (isAdminRequest) {
          // Admin session expired → admin login
          localStorage.removeItem('admin_access_token');
          localStorage.removeItem('admin_refresh_token');
          localStorage.removeItem('admin_user');
          window.location.href = '/admin/login';
        } else {
          // Storefront session expired → storefront login
          localStorage.removeItem('access_token');
          localStorage.removeItem('refresh_token');
          localStorage.removeItem('user_data');
          window.location.href = '/login';
        }
      }
    }
    return Promise.reject(error);
  }
);

export async function refreshAccessToken() {
  const refresh = localStorage.getItem('refresh_token');
  if (!refresh) throw new Error('No refresh token available');
  const { data } = await axios.post(`${API_BASE_URL}/api/auth/token/refresh/`, { refresh });
  localStorage.setItem('access_token', data.access);
  return data.access;
}

export async function socialAuth(provider, accessToken) {
  const { data } = await axiosInstance.post(`/accounts/auth/${provider}/`, {
    access_token: accessToken,
  });
  return data;
}

const api = {
  get:    (endpoint, config = {})       => axiosInstance.get(endpoint, config),
  post:   (endpoint, body, config = {}) => axiosInstance.post(endpoint, body, config),
  put:    (endpoint, body, config = {}) => axiosInstance.put(endpoint, body, config),
  patch:  (endpoint, body, config = {}) => axiosInstance.patch(endpoint, body, config),
  delete: (endpoint, config = {})       => axiosInstance.delete(endpoint, config),
};

export default api;