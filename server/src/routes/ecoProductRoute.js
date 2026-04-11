import express from "express";
import {
  createEcoProduct,
  updateEcoProduct,
  deleteEcoProduct,
  getEcoProducts,
  getEcoProductById,
  purchaseEcoProduct,
  getMyEcoOrders,
  getAllEcoOrders,
  getEcoStats,
  createCheckoutSession,
  completeMockEcoCheckout,
  verifyRazorpayEcoPayment,
  getEcoOrderById,
} from "../controllers/ecoProductController.js";

import authMiddleware from "../middlewares/authMiddleware.js";
import { isAdmin } from "../middlewares/adminMiddleware.js";
import { validate } from "../middlewares/validateMiddleware.js";
import {
  createEcoProductSchema,
  updateEcoProductSchema,
  purchaseEcoProductSchema,
  verifyRazorpayEcoSchema,
  mockEcoCheckoutCompleteSchema,
} from "../validators/ecoProductValidator.js";

const router = express.Router();

// ─── Public routes ───────────────────────────────────────
router.get("/", getEcoProducts);
router.get("/product/:id", getEcoProductById);

// ─── Authenticated user routes ───────────────────────────
router.post(
  "/purchase",
  authMiddleware,
  validate(purchaseEcoProductSchema),
  purchaseEcoProduct,
);
router.post(
  "/create-checkout-session",
  authMiddleware,
  validate(purchaseEcoProductSchema),
  createCheckoutSession,
);
router.post(
  "/complete-mock-checkout",
  authMiddleware,
  validate(mockEcoCheckoutCompleteSchema),
  completeMockEcoCheckout,
);
router.post(
  "/verify-razorpay-payment",
  authMiddleware,
  validate(verifyRazorpayEcoSchema),
  verifyRazorpayEcoPayment,
);
router.get("/my-orders", authMiddleware, getMyEcoOrders);
router.get("/order/:orderId", authMiddleware, getEcoOrderById);

// ─── Admin routes ────────────────────────────────────────
router.post(
  "/",
  authMiddleware,
  isAdmin,
  validate(createEcoProductSchema),
  createEcoProduct,
);
router.put(
  "/:id",
  authMiddleware,
  isAdmin,
  validate(updateEcoProductSchema),
  updateEcoProduct,
);
router.delete("/:id", authMiddleware, isAdmin, deleteEcoProduct);
router.get("/admin/orders", authMiddleware, isAdmin, getAllEcoOrders);
router.get("/admin/stats", authMiddleware, isAdmin, getEcoStats);

export default router;
