import api from "@/lib/api";

// Get all available listings (for buyers/marketplace)
export const getAllListings = async () => {
  const { data } = await api.get("/credits");
  return data;
};

// Get user's posted listings (for sellers)
export const getPostedListings = async () => {
  const { data } = await api.get("/credits/posted-data");
  return data;
};

// Get user's transaction data
export const getTransactionData = async () => {
  const { data } = await api.get("/credits/payment-data");
  return data;
};

// Get seller analytics
export const getSellerAnalytics = async () => {
  const { data } = await api.get("/analytics/seller");
  return data;
};

// Get buyer analytics
export const getBuyerAnalytics = async () => {
  const { data } = await api.get("/analytics/buyer");
  return data;
};

// Create new listing
export const createListing = async (listingData) => {
  const { data } = await api.post("/credits/post", listingData);
  return data;
};

// Admin: get pending listings awaiting approval
export const getPendingListings = async (params = {}) => {
  const { data } = await api.get("/admin/listings/pending", { params });
  return data;
};

// Admin: approve or reject a listing
export const reviewListing = async (listingId, payload) => {
  const { data } = await api.patch(`/admin/listings/${listingId}/review`, payload);
  return data;
};

// Make payment for listing
export const makePayment = async (paymentData) => {
  const { data } = await api.post("/credits/payment", paymentData);
  return data;
};
