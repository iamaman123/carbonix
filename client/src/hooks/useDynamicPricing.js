import { useState, useCallback, useEffect } from "react";
import axios from "axios";

const API_BASE_URL = `${import.meta.env.VITE_API_URL || "http://localhost:8000/api"}/pricing`;

/**
 * Hook to fetch and manage dynamic pricing data
 */
export const useDynamicPricing = (itemId, isProduct = false, autoFetch = true) => {
  const [pricing, setPricing] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  /**
   * Fetch pricing data from API
   */
  const fetchPricing = useCallback(async () => {
    if (!itemId) {
      setError("Item ID is required");
      return;
    }

    setLoading(true);
    setError(null);

    let shouldFallbackCalculate = false;

    try {
      const response = await axios.get(
        `${API_BASE_URL}/${itemId}?isProduct=${isProduct}`
      );

      if (response.data.success) {
        setPricing(response.data.data);
      } else {
        setError(response.data.message);
        setPricing(null);
      }
    } catch (err) {
      if (err.response?.status === 404) {
        // Backward-compatible fallback if server still returns 404.
        console.log(`[Pricing] No price found for ${itemId}, calculating now...`);
        shouldFallbackCalculate = true;
      } else {
        console.error("Error fetching pricing:", err);
        setError(err.response?.data?.message || "Failed to fetch pricing data");
        setPricing(null);
      }
    } finally {
      if (!shouldFallbackCalculate) {
        setLoading(false);
      }
    }

    if (shouldFallbackCalculate) {
      try {
        const response = await axios.post(`${API_BASE_URL}/calculate`, {
          itemId,
          isProduct,
        });

        if (response.data.success) {
          setPricing(response.data.data);
        } else {
          setError(response.data.message || "Failed to calculate price");
          setPricing(null);
        }
      } catch (calcErr) {
        console.error("Error calculating price:", calcErr);
        setError(calcErr.response?.data?.message || "Failed to calculate price");
        setPricing(null);
      } finally {
        setLoading(false);
      }
    }
  }, [itemId, isProduct]);

  /**
   * Calculate dynamic price
   */
  const calculatePrice = useCallback(async () => {
    if (!itemId) {
      setError("Item ID is required");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await axios.post(`${API_BASE_URL}/calculate`, {
        itemId,
        isProduct,
      });

      if (response.data.success) {
        setPricing(response.data.data);
      } else {
        setError(response.data.message);
      }
    } catch (err) {
      console.error("Error calculating price:", err);
      setError(err.response?.data?.message || "Failed to calculate price");
    } finally {
      setLoading(false);
    }
  }, [itemId, isProduct]);

  /**
   * Refresh pricing data
   */
  const refreshPricing = useCallback(() => {
    fetchPricing();
  }, [fetchPricing]);

  /**
   * Get price discount percentage
   */
  const getDiscountPercentage = useCallback(() => {
    if (!pricing) return 0;
    const discount =
      ((pricing.basePrice - pricing.recommendedPrice) /
        pricing.basePrice) *
      100;
    return Math.round(discount);
  }, [pricing]);

  /**
   * Get price increase percentage
   */
  const getPriceIncreasePercentage = useCallback(() => {
    if (!pricing) return 0;
    const increase =
      ((pricing.recommendedPrice - pricing.basePrice) /
        pricing.basePrice) *
      100;
    return Math.round(increase);
  }, [pricing]);

  /**
   * Check if price is discounted
   */
  const isDiscounted = useCallback(() => {
    if (!pricing) return false;
    return pricing.recommendedPrice < pricing.basePrice;
  }, [pricing]);

  // Auto-fetch pricing on mount or when itemId changes
  useEffect(() => {
    if (autoFetch && itemId) {
      fetchPricing();
    }
  }, [itemId, autoFetch, fetchPricing]);

  return {
    pricing,
    loading,
    error,
    fetchPricing,
    calculatePrice,
    refreshPricing,
    getDiscountPercentage,
    getPriceIncreasePercentage,
    isDiscounted,
  };
};

/**
 * Hook to fetch market insights
 */
export const useMarketInsights = (autoFetch = true) => {
  const [insights, setInsights] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchInsights = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await axios.get(`${API_BASE_URL}/market/insights`);

      if (response.data.success) {
        setInsights(response.data.data);
      } else {
        setError(response.data.message);
      }
    } catch (err) {
      console.error("Error fetching market insights:", err);
      setError(
        err.response?.data?.message || "Failed to fetch market insights"
      );
    } finally {
      setLoading(false);
    }
  }, []);

  const refreshInsights = useCallback(() => {
    fetchInsights();
  }, [fetchInsights]);

  useEffect(() => {
    if (autoFetch) {
      fetchInsights();
      // Refresh every 5 minutes
      const interval = setInterval(fetchInsights, 5 * 60 * 1000);
      return () => clearInterval(interval);
    }
  }, [autoFetch, fetchInsights]);

  return {
    insights,
    loading,
    error,
    refreshInsights,
  };
};
