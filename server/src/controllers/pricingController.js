import {
  calculateDynamicPrice,
  getDynamicPrice,
  updateAllDynamicPrices,
  getMarketInsights,
} from "../services/dynamicPricingService.js";

/**
 * Calculate and get dynamic price for a listing or product
 * POST /api/pricing/calculate
 */
export const calculatePrice = async (req, res) => {
  try {
    const { itemId, isProduct = false } = req.body;

    if (!itemId) {
      return res.status(400).json({
        success: false,
        message: "Item ID is required",
      });
    }

    const result = await calculateDynamicPrice(itemId, isProduct);
    return res.status(result.success ? 200 : 400).json(result);
  } catch (error) {
    console.error("Error calculating price:", error);
    res.status(500).json({
      success: false,
      message: "Error calculating dynamic price",
      error: error.message,
    });
  }
};

/**
 * Get dynamic pricing info for a listing or product
 * GET /api/pricing/:itemId?isProduct=false
 */
export const getPrice = async (req, res) => {
  try {
    const { itemId } = req.params;
    const { isProduct = false } = req.query;

    if (!itemId) {
      return res.status(400).json({ success: false, message: "Item ID is required" });
    }

    // getDynamicPrice checks memory cache → DB (with staleness) → returns what it has.
    // calculateDynamicPrice (which hits Gemini) is only called explicitly via POST /calculate.
    const result = await getDynamicPrice(itemId, isProduct === "true");
    return res.status(result.success ? 200 : 404).json(result);
  } catch (error) {
    console.error("Error fetching price:", error);
    res.status(500).json({ success: false, message: "Error fetching dynamic price", error: error.message });
  }
};


/**
 * Update all dynamic prices (admin only)
 * POST /api/pricing/update-all
 */
export const updateAllPrices = async (req, res) => {
  try {
    // Check if user is admin (you can add admin middleware here)
    const result = await updateAllDynamicPrices();
    return res.status(result.success ? 200 : 500).json(result);
  } catch (error) {
    console.error("Error updating all prices:", error);
    res.status(500).json({
      success: false,
      message: "Error updating dynamic prices",
      error: error.message,
    });
  }
};

/**
 * Get market insights and trends
 * GET /api/pricing/market-insights
 */
export const getMarketInsightsData = async (req, res) => {
  try {
    const result = await getMarketInsights();
    return res.status(result.success ? 200 : 404).json(result);
  } catch (error) {
    console.error("Error fetching market insights:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching market insights",
      error: error.message,
    });
  }
};
