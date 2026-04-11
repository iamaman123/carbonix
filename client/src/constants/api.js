// API Constants — VITE_API_URL must be a full URL (http:// or https://). Not a Google client id.
const DEFAULT_API_BASE = "carbonix-me-1.vercel.app/api";

function resolveApiBaseUrl() {
  const raw = (import.meta.env.VITE_API_URL || "").trim();
  if (!raw || !/^https?:\/\//i.test(raw)) {
    return DEFAULT_API_BASE;
  }
  return raw.replace(/\/$/, "");
}

export const API_BASE_URL = resolveApiBaseUrl();

export const SOCKET_BASE_URL =
  import.meta.env.VITE_SOCKET_URL || API_BASE_URL.replace(/\/api\/?$/, "");

// API Endpoints
export const API_ENDPOINTS = {
  // Auth
  AUTH: {
    REGISTER: "/auth/register",
    LOGIN: "/auth/login",
    VERIFY_OTP: "/auth/verify-otp",
    PROFILE: "/auth/profile",
  },

  // Listings/Credits
  CREDITS: {
    BASE: "/credits",
    POSTED: "/credits/posted-data",
    PAYMENT: "/credits/payment",
    TRANSACTIONS: "/credits/payment-data",
    RECEIPT: (id) => `/credits/receipt/${id}`,
    BY_ID: (id) => `/credits/${id}`,
    DELETE_ALL: "/credits/all/listings",
  },

  // Admin
  ADMIN: {
    USERS: "/admin/users",
    STATS: "/admin/stats",
    TRANSACTIONS: "/admin/transactions",
    USER_STATUS: (id) => `/admin/users/${id}/status`,
    USER_ROLE: (id) => `/admin/users/${id}/role`,
    DELETE_LISTING: (id) => `/admin/listings/${id}`,
  },

  // Analytics
  ANALYTICS: {
    SELLER: "/analytics/seller",
    BUYER: "/analytics/buyer",
    MARKET_TRENDS: "/analytics/market-trends",
  },
  ECO_PRODUCTS: {
    BASE: "/eco-products",
    BY_ID: (id) => `/eco-products/product/${id}`,
    PURCHASE: "/eco-products/purchase",
    CREATE_CHECKOUT_SESSION: "/eco-products/create-checkout-session",
    MY_ORDERS: "/eco-products/my-orders",
    ADMIN_ORDERS: "/eco-products/admin/orders",
    ADMIN_STATS: "/eco-products/admin/stats",
    DELETE: (id) => `/eco-products/${id}`,
    UPDATE: (id) => `/eco-products/${id}`,
  },

  // Blogs
  BLOGS: {
    BASE: "/blogs",
    BY_SLUG: (slug) => `/blogs/${slug}`,
    BY_ID: (id) => `/blogs/${id}`,
    STATS: "/blogs/admin/stats",
  },

  // Chat
  CHAT: {
    BASE: "/chat",
    USERS: "/chat/users",
    CREATE: "/chat/create",
    MESSAGES: (chatId) => `/chat/${chatId}/messages`,
    SEND: "/chat/message",
  },
};

// HTTP Status Codes
export const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  INTERNAL_SERVER_ERROR: 500,
};

// Pagination Constants
export const PAGINATION = {
  DEFAULT_PAGE: 1,
  ITEMS_PER_PAGE: {
    MARKETPLACE: 6,
    ADMIN_USERS: 20,
    TRANSACTIONS: 10,
  },
};

// Role Constants (API user.role)
export const ROLES = {
  CONSUMER: "CONSUMER",
  PRODUCER: "PRODUCER",
  ADMIN: "admin",
};

// Project Types
export const PROJECT_TYPES = [
  "Renewable Energy",
  "Reforestation",
  "Energy Efficiency",
  "Carbon Capture",
  "Waste Management",
  "Ocean Conservation",
];

// Listing Status
export const LISTING_STATUS = {
  AVAILABLE: "Available",
  SOLD: "Sold",
  PENDING: "Pending",
};

// Eco Product Categories
export const ECO_PRODUCT_CATEGORIES = [
  "Solar Equipment",
  "Energy Storage",
  "EV Accessories",
  "Eco Home",
  "Sustainable Fashion",
  "Organic & Natural",
  "Recycled Products",
  "Water Conservation",
  "Others",
];

// Payment Status
export const PAYMENT_STATUS = {
  PENDING: "pending",
  COMPLETED: "completed",
  FAILED: "failed",
};
