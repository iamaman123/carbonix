import api from "@/lib/api";
import { API_ENDPOINTS } from "@/constants/api";

// ─── Public ──────────────────────────────────────────────
export const getEcoProducts = async (params = {}) => {
  const { data } = await api.get(API_ENDPOINTS.ECO_PRODUCTS.BASE, { params });
  return data;
};

export const getEcoProductById = async (id) => {
  const { data } = await api.get(API_ENDPOINTS.ECO_PRODUCTS.BY_ID(id));
  return data;
};

// ─── Authenticated ───────────────────────────────────────
export const purchaseEcoProduct = async (purchaseData) => {
  const { data } = await api.post(
    API_ENDPOINTS.ECO_PRODUCTS.PURCHASE,
    purchaseData,
  );
  return data;
};

export const createCheckoutSession = async (purchaseData) => {
  const { data } = await api.post(
    API_ENDPOINTS.ECO_PRODUCTS.CREATE_CHECKOUT_SESSION,
    purchaseData,
  );
  return data;
};

export const getMyEcoOrders = async () => {
  const { data } = await api.get(API_ENDPOINTS.ECO_PRODUCTS.MY_ORDERS);
  return data;
};

// ─── Admin ───────────────────────────────────────────────
export const createEcoProduct = async (productData) => {
  const { data } = await api.post(API_ENDPOINTS.ECO_PRODUCTS.BASE, productData);
  return data;
};

export const updateEcoProduct = async (id, productData) => {
  const { data } = await api.put(
    API_ENDPOINTS.ECO_PRODUCTS.UPDATE(id),
    productData,
  );
  return data;
};

export const deleteEcoProduct = async (id) => {
  const { data } = await api.delete(API_ENDPOINTS.ECO_PRODUCTS.DELETE(id));
  return data;
};

export const getEcoAdminOrders = async (params = {}) => {
  const { data } = await api.get(API_ENDPOINTS.ECO_PRODUCTS.ADMIN_ORDERS, {
    params,
  });
  return data;
};

export const getEcoStats = async () => {
  const { data } = await api.get(API_ENDPOINTS.ECO_PRODUCTS.ADMIN_STATS);
  return data;
};
