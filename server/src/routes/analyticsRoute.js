import express from "express";
import {
  getSellerAnalytics,
  getBuyerAnalytics,
  getMarketTrends,
} from "../controllers/analyticsController.js";
import { authMiddleware } from "../middlewares/authMiddleware.js";

const router = express.Router();

// Seller analytics (protected)
router.get("/seller", authMiddleware, getSellerAnalytics);

// Buyer analytics (protected)
router.get("/buyer", authMiddleware, getBuyerAnalytics);

// Market trends (public)
router.get("/market-trends", getMarketTrends);

export default router;
