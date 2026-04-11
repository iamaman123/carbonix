import express from "express";
import {
  getAllUsers,
  getPlatformStats,
  updateUserStatus,
  updateUserRole,
  getRecentTransactions,
  adminDeleteListing,
  getPendingListings,
  reviewListing,
} from "../controllers/adminController.js";
import { isAdmin } from "../middlewares/adminMiddleware.js";
import { authMiddleware } from "../middlewares/authMiddleware.js";

const router = express.Router();

// All admin routes require authentication and admin role
router.use(authMiddleware, isAdmin);

// Get all users with search and filters
router.get("/users", getAllUsers);

// Get platform statistics
router.get("/stats", getPlatformStats);

// Update user status (activate/deactivate)
router.patch("/users/:userId/status", updateUserStatus);

// Update user role
router.patch("/users/:userId/role", updateUserRole);

// Get recent transactions
router.get("/transactions", getRecentTransactions);

// Delete listing
router.delete("/listings/:listingId", adminDeleteListing);

// Listing moderation
router.get("/listings/pending", getPendingListings);
router.patch("/listings/:listingId/review", reviewListing);

export default router;
