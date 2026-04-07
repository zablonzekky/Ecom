import api from './api';

// ─── Auth ─────────────────────────────────────────────────────────────────────
export const authService = {
  login:         (credentials) => api.post('/admin/auth/login/', credentials),
  logout:        (refresh)     => api.post('/admin/auth/logout/', { refresh }),
  me:            ()            => api.get('/admin/auth/me/'),
  updateProfile: (data)        => api.patch('/admin/auth/me/', data),
};

// ─── Users ────────────────────────────────────────────────────────────────────
export const userService = {
  list:           (params) => api.get('/admin/users/', { params }),
  get:            (id)     => api.get(`/admin/users/${id}/`),
  create:         (data)   => api.post('/admin/users/', data),
  update:         (id, data) => api.patch(`/admin/users/${id}/`, data),
  delete:         (id)     => api.delete(`/admin/users/${id}/`),
  stats:          ()       => api.get('/admin/users/stats/'),
  toggleStaff:    (id)     => api.post(`/admin/users/${id}/toggle-staff/`),
  toggleActive:   (id)     => api.post(`/admin/users/${id}/toggle-active/`),

  // Moved here from notificationService — this is user activity, not a notification
  recentActivity: (params) => api.get('/admin/notifications/activity-logs/', { params }),
};

// ─── Products ─────────────────────────────────────────────────────────────────
export const productService = {
  list:           (params)     => api.get('/admin/products/', { params }),
  get:            (id)         => api.get(`/admin/products/${id}/`),
  create:         (data)       => api.post('/admin/products/', data),
  update:         (id, data)   => api.patch(`/admin/products/${id}/`, data),
  delete:         (id)         => api.delete(`/admin/products/${id}/`),
  stats:          ()           => api.get('/admin/products/stats/'),

  categories:     ()           => api.get('/admin/products/categories/'),
  createCategory: (data)       => api.post('/admin/products/categories/', data),
  updateCategory: (id, data)   => api.patch(`/admin/products/categories/${id}/`, data),
  deleteCategory: (id)         => api.delete(`/admin/products/categories/${id}/`),
};

// ─── Orders ───────────────────────────────────────────────────────────────────
export const orderService = {
  list:         (params)     => api.get('/admin/orders/', { params }),
  get:          (id)         => api.get(`/admin/orders/${id}/`),
  stats:        ()           => api.get('/admin/orders/stats/'),
  updateStatus: (id, data)   => api.post(`/admin/orders/${id}/update-status/`, data),
};

// ─── Analytics ────────────────────────────────────────────────────────────────
export const analyticsService = {
  dashboard:         ()                                 => api.get('/admin/analytics/dashboard/'),
  salesChart:        (period = 30, granularity = 'day') => api.get('/admin/analytics/sales/chart/',          { params: { period, granularity } }),
  salesBreakdown:    (period = 30)                      => api.get('/admin/analytics/sales/breakdown/',      { params: { period } }),
  hourlySales:       (period = 30)                      => api.get('/admin/analytics/sales/hourly/',         { params: { period } }),
  productCategories: ()                                 => api.get('/admin/analytics/products/categories/'),
  topProducts:       (period = 30, limit = 10)          => api.get('/admin/analytics/products/top/',         { params: { period, limit } }),
  productStock:      ()                                 => api.get('/admin/analytics/products/stock/'),
  topCustomers:      (period = 30, limit = 10)          => api.get('/admin/analytics/customers/top/',        { params: { period, limit } }),
  customerGrowth:    (period = 30)                      => api.get('/admin/analytics/customers/growth/',     { params: { period } }),
  customerRetention: (period = 30)                      => api.get('/admin/analytics/customers/retention/',  { params: { period } }),
  customersByRole:   ()                                 => api.get('/admin/analytics/customers/by-role/'),
};

// ─── Discounts ────────────────────────────────────────────────────────────────
export const discountService = {
  list:   (params)     => api.get('/admin/discounts/', { params }),
  get:    (id)         => api.get(`/admin/discounts/${id}/`),
  create: (data)       => api.post('/admin/discounts/', data),
  update: (id, data)   => api.patch(`/admin/discounts/${id}/`, data),
  delete: (id)         => api.delete(`/admin/discounts/${id}/`),
};

// ─── Reviews ──────────────────────────────────────────────────────────────────
export const reviewService = {
  list:    (params) => api.get('/admin/reviews/', { params }),
  approve: (id)     => api.post(`/admin/reviews/${id}/approve/`),
  reject:  (id)     => api.post(`/admin/reviews/${id}/reject/`),
  delete:  (id)     => api.delete(`/admin/reviews/${id}/`),
};

// ─── Notifications ────────────────────────────────────────────────────────────
export const notificationService = {
  list:         ()         => api.get('/admin/notifications/'),
  markRead:     (id)       => api.post(`/admin/notifications/${id}/mark-read/`),
  markAllRead:  ()         => api.post('/admin/notifications/mark-all-read/'),
  activityLogs: (params)   => api.get('/admin/notifications/activity-logs/', { params }),
};