import express from "express";
import {
  calculatePrice,
  getPrice,
  updateAllPrices,
  getMarketInsightsData,
} from "../controllers/pricingController.js";

const router = express.Router();

/**
 * @route   POST /api/pricing/calculate
 * @desc    Calculate dynamic price for a listing or product
 * @access  Public
 */
router.post("/calculate", calculatePrice);

/**
 * @route   POST /api/pricing/update-all
 * @desc    Update all dynamic prices (batch operation - admin only)
 * @access  Admin
 */
router.post("/update-all", updateAllPrices);

/**
 * @route   GET /api/pricing/market/insights
 * @desc    Get market insights and trends
 * @access  Public
 */
router.get("/market/insights", getMarketInsightsData);

/**
 * @route   GET /api/pricing/:itemId
 * @desc    Get dynamic pricing info
 * @query   isProduct - boolean (default: false)
 * @access  Public
 */
router.get("/:itemId", getPrice);

export default router;
