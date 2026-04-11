/**
 * Price Update Admin Utility
 * This utility helps admins manage and update dynamic pricing
 */

import axios from "axios";

const API_BASE_URL = `${import.meta.env.VITE_API_URL || "http://localhost:8000/api"}/pricing`;

export const PricingAdminUtils = {
  /**
   * Trigger batch update of all dynamic prices
   */
  updateAllPrices: async () => {
    try {
      const response = await axios.post(`${API_BASE_URL}/update-all`);
      return response.data;
    } catch (error) {
      console.error("Error updating all prices:", error);
      throw error.response?.data || error;
    }
  },

  /**
   * Calculate dynamic price for a specific item
   */
  calculateItemPrice: async (itemId, isProduct = false) => {
    try {
      const response = await axios.post(`${API_BASE_URL}/calculate`, {
        itemId,
        isProduct,
      });
      return response.data;
    } catch (error) {
      console.error("Error calculating price:", error);
      throw error.response?.data || error;
    }
  },

  /**
   * Get market insights
   */
  getMarketInsights: async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/market/insights`);
      return response.data;
    } catch (error) {
      console.error("Error fetching market insights:", error);
      throw error.response?.data || error;
    }
  },

  /**
   * Get dynamic pricing for an item
   */
  getItemPricing: async (itemId, isProduct = false) => {
    try {
      const response = await axios.get(
        `${API_BASE_URL}/${itemId}?isProduct=${isProduct}`
      );
      return response.data;
    } catch (error) {
      console.error("Error fetching item pricing:", error);
      throw error.response?.data || error;
    }
  },

  /**
   * Batch update specific items
   */
  batchUpdatePrices: async (itemIds, isProduct = false) => {
    const results = {
      success: [],
      failed: [],
    };

    for (const itemId of itemIds) {
      try {
        const result = await this.calculateItemPrice(itemId, isProduct);
        if (result.success) {
          results.success.push({ itemId, data: result.data });
        } else {
          results.failed.push({ itemId, error: result.message });
        }
      } catch (error) {
        results.failed.push({
          itemId,
          error: error.message || "Unknown error",
        });
      }
    }

    return results;
  },

  /**
   * Export pricing data as CSV
   */
  exportPricingData: async (pricingData) => {
    const headers = [
      "Item ID",
      "Base Price",
      "Recommended Price",
      "Price Multiplier",
      "Market Temperature",
      "Demand Score",
      "Supply Score",
      "Updated At",
    ];

    const rows = pricingData.map((item) => [
      item.itemId,
      item.basePrice,
      item.recommendedPrice,
      item.priceMultiplier,
      item.marketTemperature,
      item.demandScore,
      item.supplyScore,
      new Date(item.lastUpdatedAt).toLocaleString(),
    ]);

    const csv = [headers, ...rows].map((row) => row.join(",")).join("\n");

    const blob = new Blob([csv], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `pricing-export-${new Date().toISOString()}.csv`;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
  },
};

export default PricingAdminUtils;
