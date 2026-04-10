import Axios from "./axios";

export const authApi = {
  login: (payload) => Axios.post("/auth/login", payload),
  register: (payload) => Axios.post("/auth/register", payload),
  me: () => Axios.get("/auth/me"),
  updateMe: (payload) => Axios.patch("/auth/me/profile", payload),
  forgotPassword: (payload) => Axios.post("/auth/forgot-password", payload),
  verifyOtp: (payload) => Axios.post("/auth/verify-otp", payload),
  resendOtp: (payload) => Axios.post("/auth/resend-otp", payload),
  verifyResetOtp: (payload) => Axios.post("/auth/verify-reset-otp", payload),
  resetPassword: (payload) => Axios.post("/auth/reset-password", payload),
  changePassword: (payload) => Axios.post("/auth/change-password", payload),
};

export const ridersApi = {
  list: (params = {}) => Axios.get("/riders", { params }),
  create: (payload) => Axios.post("/riders", payload),
  get: (id) => Axios.get(`/riders/${id}`),
  update: (id, payload) => Axios.put(`/riders/${id}`, payload),
  remove: (id) => Axios.delete(`/riders/${id}`),
};

export const riderPurchaseItemsApi = {
  list: (params = {}) => Axios.get("/rider-purchase-items", { params }),
  create: (payload) => Axios.post("/rider-purchase-items", payload),
  get: (id) => Axios.get(`/rider-purchase-items/${id}`),
  update: (id, payload) => Axios.put(`/rider-purchase-items/${id}`, payload),
  remove: (id) => Axios.delete(`/rider-purchase-items/${id}`),
};

export const inventoryApi = {
  categories: {
    list: () => Axios.get("/inventory/categories"),
    create: (payload) => Axios.post("/inventory/categories", payload),
    update: (id, payload) => Axios.put(`/inventory/categories/${id}`, payload),
    remove: (id) => Axios.delete(`/inventory/categories/${id}`),
  },
  units: {
    list: () => Axios.get("/inventory/units"),
    create: (payload) => Axios.post("/inventory/units", payload),
    update: (id, payload) => Axios.put(`/inventory/units/${id}`, payload),
    remove: (id) => Axios.delete(`/inventory/units/${id}`),
  },
  products: {
    list: () => Axios.get("/inventory/products"),
    create: (payload) => Axios.post("/inventory/products", payload),
    update: (id, payload) => Axios.put(`/inventory/products/${id}`, payload),
    remove: (id) => Axios.delete(`/inventory/products/${id}`),
  },
};

export const salesApi = {
  customers: {
    list: () => Axios.get("/sales/customers"),
    create: (payload) => Axios.post("/sales/customers", payload),
    update: (id, payload) => Axios.put(`/sales/customers/${id}`, payload),
    get: (id) => Axios.get(`/sales/customers/${id}`),
    initWalkIn: () => Axios.post("/sales/customers/walk-in/init"),
  },
  sales: {
    list: (params = {}) => Axios.get("/sales/sales", { params }),
    create: (payload) => Axios.post("/sales/sales", payload),
    get: (id) => Axios.get(`/sales/sales/${id}`),
    invoice: (id) => Axios.get(`/sales/sales/${id}/invoice`),
    invoicePdf: (id) => Axios.get(`/sales/sales/${id}/invoice/pdf`, { responseType: "blob" }),
    payment: (id, payload) => Axios.post(`/sales/sales/${id}/payments`, payload),
    cancel: (id) => Axios.post(`/sales/sales/${id}/cancel`),
  },
};

export const dashboardApi = {
  summary: () => Axios.get("/dashboard/summary"),
};
