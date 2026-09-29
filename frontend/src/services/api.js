/**
 * API service layer.
 * Communicates with the Spring Boot backend (/api) with graceful offline fallback.
 */

const API_BASE_URL = '/api';

export async function fetchWithFallback(endpoint, options = {}, fallbackData = null) {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 6000);

    const token = localStorage.getItem('nexretail_auth_token');
    const authHeaders = token ? { 'Authorization': `Bearer ${token}` } : {};

    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...authHeaders,
        ...(options.headers || {})
      },
      signal: controller.signal
    });
    clearTimeout(timeoutId);

    if (!response.ok) {
      const errBody = await response.json().catch(() => ({}));
      const errMsg = errBody.error || errBody.message || `HTTP error! status: ${response.status}`;
      const err = new Error(errMsg);
      err.status = response.status;
      err.body = errBody;
      throw err;
    }
    return await response.json();
  } catch (error) {
    // If it is a server error response (has status), don't mask it with fallback
    if (error.status && error.status >= 400) {
      throw error;
    }
    if (fallbackData !== null) {
      return fallbackData;
    }
    throw error;
  }
}

export const api = {
  // --- Stores ---
  getStores: (type = '', fallback = []) =>
    fetchWithFallback(type ? `/stores?type=${type}` : '/stores', {}, fallback),

  getTopRatedStores: (minReviews = 1, limit = 6, fallback = []) =>
    fetchWithFallback(`/stores/top-rated?minReviews=${minReviews}&limit=${limit}`, {}, fallback),

  getStoresWithRatings: (params = {}, fallback = []) => {
    const searchParams = new URLSearchParams();
    if (params.type && params.type !== 'ALL') searchParams.append('type', params.type);
    if (params.sort) searchParams.append('sort', params.sort);
    if (params.q) searchParams.append('q', params.q);
    const queryString = searchParams.toString();
    return fetchWithFallback(`/stores/rated${queryString ? `?${queryString}` : ''}`, {}, fallback);
  },

  getStoreById: (storeId, fallback = null) =>
    fetchWithFallback(`/stores/${storeId}`, {}, fallback),

  searchStores: (query, fallback = []) =>
    fetchWithFallback(`/stores/search?q=${encodeURIComponent(query)}`, {}, fallback),

  createStore: (storeData, ownerId = null) =>
    fetchWithFallback(ownerId ? `/stores?ownerId=${ownerId}` : '/stores', {
      method: 'POST',
      body: JSON.stringify(storeData)
    }),

  updateStore: (storeId, storeData) =>
    fetchWithFallback(`/stores/${storeId}`, {
      method: 'PUT',
      body: JSON.stringify(storeData)
    }),

  // --- Per-Store Products ---
  getStoreProducts: (storeId, categoryId = null, fallback = []) => {
    const url = categoryId 
      ? `/stores/${storeId}/products?categoryId=${categoryId}` 
      : `/stores/${storeId}/products`;
    return fetchWithFallback(url, {}, fallback);
  },

  searchStoreProducts: (storeId, query, fallback = []) =>
    fetchWithFallback(`/stores/${storeId}/products/search?q=${encodeURIComponent(query)}`, {}, fallback),

  getStoreProductById: (storeId, id, fallback = null) =>
    fetchWithFallback(`/stores/${storeId}/products/${id}`, {}, fallback),

  uploadProductImage: async (storeId, file) => {
    const formData = new FormData();
    formData.append('file', file);
    const token = localStorage.getItem('nexretail_auth_token');
    const authHeaders = token ? { 'Authorization': `Bearer ${token}` } : {};

    const response = await fetch(`${API_BASE_URL}/stores/${storeId}/products/upload-image`, {
      method: 'POST',
      headers: {
        ...authHeaders
      },
      body: formData
    });

    if (!response.ok) {
      const errBody = await response.json().catch(() => ({}));
      const errMsg = errBody.error || errBody.message || `Upload failed (status: ${response.status})`;
      const err = new Error(errMsg);
      err.status = response.status;
      err.body = errBody;
      throw err;
    }
    return await response.json();
  },

  addStoreProduct: (storeId, productPayload) =>
    fetchWithFallback(`/stores/${storeId}/products`, {
      method: 'POST',
      body: JSON.stringify(productPayload)
    }),

  updateStoreProduct: (storeId, productId, updates) =>
    fetchWithFallback(`/stores/${storeId}/products/${productId}`, {
      method: 'PUT',
      body: JSON.stringify(updates)
    }),

  adjustStock: (storeId, productId, delta) =>
    fetchWithFallback(`/stores/${storeId}/products/${productId}/stock`, {
      method: 'PATCH',
      body: JSON.stringify({ delta })
    }),

  getLowStockProducts: (storeId, fallback = []) =>
    fetchWithFallback(`/stores/${storeId}/products/low-stock`, {}, fallback),

  getOutOfStockProducts: (storeId, fallback = []) =>
    fetchWithFallback(`/stores/${storeId}/products/out-of-stock`, {}, fallback),

  deleteStoreProduct: (storeId, productId) =>
    fetchWithFallback(`/stores/${storeId}/products/${productId}`, {
      method: 'DELETE'
    }),

  // --- Sales ---
  getSales: (storeId, todayOnly = false, fallback = []) =>
    fetchWithFallback(`/stores/${storeId}/sales?todayOnly=${todayOnly}`, {}, fallback),

  getSalesSummary: (storeId, fallback = { todaysRevenue: 0, totalSalesCount: 0 }) =>
    fetchWithFallback(`/stores/${storeId}/sales/summary`, {}, fallback),

  recordSale: (storeId, salePayload) =>
    fetchWithFallback(`/stores/${storeId}/sales`, {
      method: 'POST',
      body: JSON.stringify(salePayload)
    }),

  // --- Store Offers ---
  getStoreOffers: (storeId, fallback = []) =>
    fetchWithFallback(`/stores/${storeId}/offers`, {}, fallback),

  createStoreOffer: (storeId, offerPayload) =>
    fetchWithFallback(`/stores/${storeId}/offers`, {
      method: 'POST',
      body: JSON.stringify(offerPayload)
    }, { ...offerPayload, id: Date.now() }),

  deactivateStoreOffer: (storeId, offerId) =>
    fetchWithFallback(`/stores/${storeId}/offers/${offerId}`, {
      method: 'DELETE'
    }, { success: true }),

  // --- Global Products Catalog & Categories ---
  getGlobalProducts: (search = '', fallback = []) =>
    fetchWithFallback(search ? `/products?search=${encodeURIComponent(search)}` : '/products', {}, fallback),

  searchStoresForProduct: (query) =>
    fetchWithFallback(`/products/search-stores?q=${encodeURIComponent(query)}`, {}, []),

  getCategories: (fallback = []) =>
    fetchWithFallback('/products/categories', {}, fallback),

  // --- Authentication & Users ---
  login: (email, password, selectedRole = null) =>
    fetchWithFallback('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password, selectedRole })
    }),

  register: (userData) =>
    fetchWithFallback('/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData)
    }),

  getCurrentUser: () =>
    fetchWithFallback('/auth/me', {
      method: 'GET'
    }),

  // --- Administration ---
  getAdminUsers: (fallback = []) =>
    fetchWithFallback('/admin/users', {}, fallback),

  updateUserRole: (userId, role) =>
    fetchWithFallback(`/admin/users/${userId}/role`, {
      method: 'PATCH',
      body: JSON.stringify({ role })
    }),

  getAdminStats: (fallback = { totalUsers: 0, totalStores: 0, totalProducts: 0, totalSalesAmount: 0 }) =>
    fetchWithFallback('/admin/stats', {}, fallback),

  getAdminStores: (fallback = []) =>
    fetchWithFallback('/admin/stores', {}, fallback),

  // --- Layout ---
  getSections: (fallback = []) => fetchWithFallback('/layout/sections', {}, fallback),
  getAisles: (fallback = []) => fetchWithFallback('/layout/aisles', {}, fallback),

  // --- Analytics & Demand Insights ---
  getDemandInsights: (fallback = []) => fetchWithFallback('/analytics/demand-insights', {}, fallback),
  logDemandEvent: (keyword, productId, eventType) =>
    fetchWithFallback('/analytics/log', {
      method: 'POST',
      body: JSON.stringify({ keyword, productId, eventType, timestamp: new Date().toISOString() })
    }, { logged: true }),

  // --- Express Pickup Orders ---
  getOrders: (fallback = []) => fetchWithFallback('/orders', {}, fallback),
  createOrder: (orderPayload) =>
    fetchWithFallback('/orders', {
      method: 'POST',
      body: JSON.stringify(orderPayload)
    }),
  updateOrderStatus: (orderId, status, estimatedPickupTime = null) =>
    fetchWithFallback(`/orders/${orderId}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status, estimatedPickupTime })
    }),

  // --- Facility / Operational Issues ---
  getIssues: (fallback = []) => fetchWithFallback('/issues', {}, fallback),
  createIssue: (issue) =>
    fetchWithFallback('/issues', {
      method: 'POST',
      body: JSON.stringify(issue)
    }),

  // --- Store Reviews & Ratings ---
  getStoreRating: (storeId, fallback = null) =>
    fetchWithFallback(`/stores/${storeId}/rating`, {}, fallback),

  getStoreReviews: (storeId, fallback = []) =>
    fetchWithFallback(`/stores/${storeId}/reviews`, {}, fallback),

  submitStoreReview: (storeId, reviewPayload) =>
    fetchWithFallback(`/stores/${storeId}/reviews`, {
      method: 'POST',
      body: JSON.stringify(reviewPayload)
    }),

  // --- AI Inventory Assistant ---
  sendAiCommand: (command) =>
    fetchWithFallback('/shopkeeper/ai-assistant/command', {
      method: 'POST',
      body: JSON.stringify({ command })
    }),

  confirmAiAction: (pendingAction, confirmed = true) =>
    fetchWithFallback('/shopkeeper/ai-assistant/confirm', {
      method: 'POST',
      body: JSON.stringify({ pendingAction, confirmed })
    }),

  getAiAuditLogs: (fallback = []) =>
    fetchWithFallback('/shopkeeper/ai-assistant/audit-logs', {}, fallback),

  searchProductImages: (query, brand = '', packageSize = '', category = '') => {
    let url = `/shopkeeper/ai-assistant/product-images?query=${encodeURIComponent(query)}`;
    if (brand) url += `&brand=${encodeURIComponent(brand)}`;
    if (packageSize) url += `&packageSize=${encodeURIComponent(packageSize)}`;
    if (category) url += `&category=${encodeURIComponent(category)}`;
    return fetchWithFallback(url, {}, { query, images: [], candidateImageResults: [], results: [], reliableImagesFound: false });
  },

  // --- Store-Specific Cart ---
  getCart: (storeId) =>
    fetchWithFallback(`/cart?storeId=${storeId}`, {}, null),

  addToCartItem: (storeId, storeProductId, quantity = 1) =>
    fetchWithFallback('/cart/items', {
      method: 'POST',
      body: JSON.stringify({ storeId, storeProductId, quantity })
    }),

  updateCartItemQuantity: (itemId, quantity) =>
    fetchWithFallback(`/cart/items/${itemId}`, {
      method: 'PUT',
      body: JSON.stringify({ quantity })
    }),

  removeCartItem: (itemId) =>
    fetchWithFallback(`/cart/items/${itemId}`, {
      method: 'DELETE'
    }),

  clearCart: (storeId) =>
    fetchWithFallback(`/cart?storeId=${storeId}`, {
      method: 'DELETE'
    }),

  // --- Canonical Product Images Sync ---
  syncCanonicalImages: () =>
    fetchWithFallback('/products/sync-canonical-images', {
      method: 'POST'
    }),

  // --- Customer Notifications ---
  getCustomerNotifications: () =>
    fetchWithFallback('/customer/notifications', {}, []),

  getUnreadNotificationCount: () =>
    fetchWithFallback('/customer/notifications/unread-count', {}, { unreadCount: 0 }),

  markNotificationAsRead: (id) =>
    fetchWithFallback(`/customer/notifications/${id}/read`, {
      method: 'PUT'
    }),

  markAllNotificationsAsRead: () =>
    fetchWithFallback('/customer/notifications/read-all', {
      method: 'PUT'
    })
};
