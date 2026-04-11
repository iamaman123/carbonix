import CarbonCredit from "../models/Listing.js";
import transactionsModel from "../models/transactionsModel.js";
import userModel from "../models/userModel.js";
import logger from "../utils/logger.js";
import mongoose from "mongoose";
import { sendNotificationEmail, emailTemplates } from "../utils/emailNotifications.js";
import { generateReceiptData } from "../utils/receiptGenerator.js";
import { validateListingAuthenticity } from "../services/listingModerationService.js";
import config from "../config/index.js";
import {
  getRazorpay,
  getRazorpayErrorMessage,
  isRazorpayAuthFailure,
  isRazorpayCheckoutMocked,
  verifyRazorpayPaymentSignature,
} from "../utils/razorpayClient.js";

/** Atomically mark a credit transaction completed and apply listing + user balances. */
async function completeCreditPurchase(transactionId, paymentExtras = {}) {
  const tx = await transactionsModel.findById(transactionId);
  if (!tx) return null;

  const updated = await transactionsModel.findOneAndUpdate(
    { _id: transactionId, paymentStatus: "pending" },
    {
      paymentStatus: "completed",
      completedAt: new Date(),
      ...paymentExtras,
    },
    { new: true }
  );
  if (!updated) return null;

  const listingId = tx.listing;
  const qty = tx.quantity;

  const listing = await CarbonCredit.findById(listingId);
  if (listing) {
    const newQuantity = listing.quantity - qty;
    await CarbonCredit.findByIdAndUpdate(listingId, {
      $inc: { quantity: -qty },
      status: newQuantity <= 0 ? "Sold" : "Available",
      updatedAt: Date.now(),
    });
  }

  await userModel.findByIdAndUpdate(tx.buyer, {
    $push: { transactions: tx._id },
    $inc: { totalSpents: tx.totalAmount },
  });
  await userModel.findByIdAndUpdate(tx.seller, {
    $inc: { totalCredits: qty },
  });

  logger.info(`Credit payment completed: ${transactionId}`);
  return updated;
}

// ✅ Create a new listing
export const createListing = async (req, res) => {
  try {
    const userId = req.user.userId;

    const moderationResult = await validateListingAuthenticity(req.body);
    if (!moderationResult.isValid) {
      return res.status(400).json({
        success: false,
        message: "Listing failed AI validation. Please fix the flagged issues.",
        errors: moderationResult.reasons || ["Listing appears invalid or potentially fraudulent."],
        errorFields: moderationResult.errorFields || [],
        validation: moderationResult,
      });
    }

    const listingData = {
      ...req.body,
      seller: userId,
      status: "Pending",
      moderation: {
        aiValidation: moderationResult,
        adminApproval: {
          state: "pending",
        },
      },
    };
    
    const newListing = new CarbonCredit(listingData);
    const savedListing = await newListing.save();
    
    await userModel.findByIdAndUpdate(
      userId,
      { $push: { posted: savedListing._id } },
      { new: true, runValidators: true }
    );
    
    res.status(201).json({
      success: true,
      message: "Listing submitted for admin approval",
      data: savedListing,
    });
  } catch (error) {
    logger.error("Error creating listing:", error);
    if (error.name === "ValidationError" && error.errors) {
      const msgs = Object.values(error.errors).map((e) => e.message);
      return res.status(400).json({
        success: false,
        message: msgs.join(" "),
        errors: msgs,
      });
    }
    res.status(400).json({
      success: false,
      message: error.message || "Failed to create listing",
      errors: [error.message],
    });
  }
};

// ✅ Get all listings with pagination and search
export const getListings = async (req, res) => {
  try {
    const { 
      page = 1, 
      limit = 10, 
      search = ""
    } = req.query;

    const pageNum = parseInt(page, 10);
    const limitNum = parseInt(limit, 10);
    const skip = (pageNum - 1) * limitNum;

    let query = {};
    
    // Add search if provided
    if (search) {
      query.$text = { $search: search };
    }
    
    // Public listings should only show live/approved listings.
    query.status = "Available";

    // Get total count for pagination
    const total = await CarbonCredit.countDocuments(query);
    
    // Fetch listings with pagination
    const listings = await CarbonCredit.find(query)
      .populate("seller", "email")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limitNum);

    res.status(200).json({
      success: true,
      data: listings,
      pagination: {
        currentPage: pageNum,
        totalPages: Math.ceil(total / limitNum),
        totalItems: total,
        itemsPerPage: limitNum,
        hasNextPage: pageNum < Math.ceil(total / limitNum),
        hasPrevPage: pageNum > 1,
      },
    });
  } catch (error) {
    logger.error("Error fetching listings:", error);
    res.status(500).json({ 
      success: false,
      message: "Failed to fetch listings",
      error: error.message 
    });
  }
};

// ✅ Get a specific listing by ID
export const getListingById = async (req, res) => {
  try {
    const listing = await CarbonCredit.findById(req.params.id);
    if (!listing || listing.status !== "Available") {
      return res.status(404).json({ success: false, message: "Listing not found" });
    }
    res.status(200).json(listing);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const filterListings = async (req, res) => {
  try {
    const {
      projectType,
      status,
      location,
      minPrice,
      maxPrice,
      minQuantity,
      maxQuantity,
      verifiedBy,
      page = 1,
      limit = 10,
      sortBy = "createdAt",
      sortOrder = "desc"
    } = req.query;

    const pageNum = parseInt(page, 10);
    const limitNum = parseInt(limit, 10);
    const skip = (pageNum - 1) * limitNum;

    let filter = {};

    if (projectType) filter.projectType = projectType;
    filter.status = "Available";
    if (location) filter.location = { $regex: location, $options: "i" };
    if (verifiedBy) filter["verification.verifiedBy"] = verifiedBy;
    
    if (minPrice || maxPrice) {
      filter.pricePerCredit = {};
      if (minPrice) filter.pricePerCredit.$gte = Number(minPrice);
      if (maxPrice) filter.pricePerCredit.$lte = Number(maxPrice);
    }
    
    if (minQuantity || maxQuantity) {
      filter.quantity = {};
      if (minQuantity) filter.quantity.$gte = Number(minQuantity);
      if (maxQuantity) filter.quantity.$lte = Number(maxQuantity);
    }

    // Get total count
    const total = await CarbonCredit.countDocuments(filter);

    // Build sort object
    const sort = {};
    sort[sortBy] = sortOrder === "asc" ? 1 : -1;

    const listings = await CarbonCredit.find(filter)
      .populate("seller", "email")
      .sort(sort)
      .skip(skip)
      .limit(limitNum);

    res.status(200).json({
      success: true,
      data: listings,
      pagination: {
        currentPage: pageNum,
        totalPages: Math.ceil(total / limitNum),
        totalItems: total,
        itemsPerPage: limitNum,
        hasNextPage: pageNum < Math.ceil(total / limitNum),
        hasPrevPage: pageNum > 1,
      },
      filters: filter,
    });
  } catch (error) {
    logger.error("Error filtering listings:", error);
    res.status(500).json({ 
      success: false,
      message: "Failed to filter listings",
      error: error.message 
    });
  }
};

// ✅ Update a listing
export const updateListing = async (req, res) => {
  try {
    const existingListing = await CarbonCredit.findById(req.params.id);
    if (!existingListing) {
      return res.status(404).json({ message: "Listing not found" });
    }

    // Seller can only update their own listing; admin can update any.
    const isAdmin = req.user.role === "admin";
    if (!isAdmin && existingListing.seller.toString() !== req.user.userId) {
      return res.status(403).json({
        success: false,
        message: "You can only update your own listings",
      });
    }

    // Prevent bypassing moderation workflow through direct updates.
    const updates = { ...req.body };
    delete updates.status;
    delete updates.moderation;
    delete updates.seller;

    const updatedListing = await CarbonCredit.findByIdAndUpdate(req.params.id, updates, {
      new: true,
      runValidators: true,
    });

    res.status(200).json(updatedListing);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// ✅ Delete a listing
export const deleteListing = async (req, res) => {
  try {
    const deletedListing = await CarbonCredit.findByIdAndDelete(req.params.id);
    if (!deletedListing)
      return res.status(404).json({ message: "Listing not found" });
    res.status(200).json({ message: "Listing deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const deleteAllListings = async (req, res) => {
  try {
    await CarbonCredit.deleteMany({});
    res.status(200).json({ 
      success: true,
      message: "All listings deleted successfully" 
    });
  } catch (error) {
    logger.error("Error deleting all listings:", error);
    res.status(500).json({ 
      success: false,
      message: "Failed to delete listings",
      error: error.message 
    });
  }
};

export const getPostedListingForUser = async (req, res) => {
  try {
    const userId = req.user.userId;
    const userData = await userModel
      .findById(userId)
      .populate("posted")
      .select("posted");

    if (!userData) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    return res.status(200).json({
      success: true,
      posted: userData.posted || [],
    });
  } catch (error) {
    logger.error("Error fetching posted listings:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch posted listings",
    });
  }
};

export const getTransactionData = async (req, res) => {
  try {
    const userId = req.user.userId;
    const user = await userModel.findById(userId).select("role");
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // Get both buyer and seller transactions for regular users
    // Admin only sees admin-specific data
    let buyerTransactions = [];
    let sellerTransactions = [];
    
    if (user.role !== "admin") {
      // Get seller transactions
      sellerTransactions = await transactionsModel
        .find({ seller: userId })
        .populate("listing", "title description projectType")
        .populate("buyer", "email name")
        .sort({ createdAt: -1 });
      
      // Get buyer transactions
      const userData = await userModel
        .findById(userId)
        .populate({
          path: "transactions",
          populate: [
            { path: "listing", select: "title description projectType" },
            { path: "seller", select: "email name" },
          ],
        })
        .select("transactions");
      
      buyerTransactions = userData?.transactions || [];
    }

    return res.status(200).json({
      success: true,
      data: {
        transactions: buyerTransactions,
        sellerTransactions: sellerTransactions,
      },
    });
  } catch (error) {
    logger.error("Error fetching transaction data:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch transaction data",
    });
  }
};

export const makePayment = async (req, res) => {
  try {
    const buyerId = req.user.userId;
    const { listingId, quantity, paymentMethod } = req.body;

    // 1. Validate buyer exists
    const buyer = await userModel.findById(buyerId);
    if (!buyer) {
      throw new Error("Buyer not found");
    }

    // 2. Find and validate listing
    const listing = await CarbonCredit.findById(listingId);
    if (!listing) {
      throw new Error("Listing not found");
    }

    if (listing.status !== "Available") {
      throw new Error("Listing is not available for purchase");
    }

    if (listing.quantity < quantity) {
      throw new Error(`Insufficient credits available. Only ${listing.quantity} credits remaining.`);
    }

    // 3. Prevent buying own credits
    if (listing.seller.toString() === buyerId) {
      throw new Error("You cannot purchase your own credits");
    }

    // 4. Calculate amounts
    const pricePerCredit = listing.pricePerCredit;
    const totalAmount = pricePerCredit * quantity;

    // 5. Update listing quantity atomically
    const newQuantity = listing.quantity - quantity;
    const newStatus = newQuantity === 0 ? "Sold" : "Available";

    await CarbonCredit.findByIdAndUpdate(
      listingId,
      {
        $inc: { quantity: -quantity },
        status: newStatus,
        updatedAt: Date.now(),
      },
      { new: true }
    );

    // 6. Create transaction record
    const transaction = new transactionsModel({
      listing: listingId,
      buyer: buyerId,
      seller: listing.seller,
      quantity,
      pricePerCredit,
      totalAmount,
      paymentStatus: "completed",
      paymentMethod: paymentMethod || "other",
      transactionHash: `TXN-${Date.now()}-${Math.random().toString(36).substring(2, 11)}`,
      completedAt: Date.now(),
    });

    await transaction.save();

    // 7. Update buyer's transaction history and spending
    await userModel.findByIdAndUpdate(
      buyerId,
      {
        $push: { transactions: transaction._id },
        $inc: { totalSpents: totalAmount },
      }
    );

    // 8. Update seller's credits sold
    await userModel.findByIdAndUpdate(
      listing.seller,
      {
        $inc: { totalCredits: quantity },
      }
    );

    // Send email notifications (non-blocking)
    const populatedTransaction = await transactionsModel
      .findById(transaction._id)
      .populate("listing", "title")
      .populate("buyer", "email")
      .populate("seller", "email");

    // Send purchase confirmation to buyer
    sendNotificationEmail(
      buyer.email,
      emailTemplates.purchaseConfirmation,
      populatedTransaction
    ).catch(err => logger.error("Failed to send purchase email:", err));

    // Send sale notification to seller
    const seller = await userModel.findById(listing.seller);
    if (seller) {
      sendNotificationEmail(
        seller.email,
        emailTemplates.listingSold,
        populatedTransaction
      ).catch(err => logger.error("Failed to send seller email:", err));
    }

    logger.info(`Payment successful: ${transaction._id}`, {
      buyer: buyerId,
      seller: listing.seller,
      amount: totalAmount,
    });

    return res.status(200).json({
      success: true,
      message: "Payment completed successfully",
      data: {
        transactionId: transaction._id,
        transactionHash: transaction.transactionHash,
        quantity,
        totalAmount,
        creditsRemaining: newQuantity,
      },
    });
  } catch (error) {
    logger.error("Payment failed:", error);
    
    return res.status(400).json({
      success: false,
      message: error.message || "Payment failed",
    });
  }
};

// ✅ Get transaction receipt
export const getReceipt = async (req, res) => {
  try {
    const { transactionId } = req.params;
    const userId = req.user.userId;

    const transaction = await transactionsModel
      .findById(transactionId)
      .populate("buyer", "email name")
      .populate("seller", "email name")
      .populate("listing", "title description projectType location");

    if (!transaction) {
      return res.status(404).json({
        success: false,
        message: "Transaction not found",
      });
    }

    // Verify user has access to this receipt
    if (
      transaction.buyer._id.toString() !== userId &&
      transaction.seller._id.toString() !== userId
    ) {
      return res.status(403).json({
        success: false,
        message: "Access denied",
      });
    }

    const receipt = generateReceiptData(transaction);

    res.json(receipt);
  } catch (error) {
    logger.error("Error generating receipt:", error);
    res.status(500).json({
      success: false,
      message: "Failed to generate receipt",
    });
  }
};

// ✅ Create Razorpay order for carbon credit purchase (client opens Razorpay Checkout)
export const createCreditCheckoutSession = async (req, res) => {
  let pendingTransactionId = null;
  try {
    const buyerId = req.user.userId;
    const { listingId, quantity } = req.body;

    const buyer = await userModel.findById(buyerId);
    if (!buyer) return res.status(404).json({ success: false, message: "User not found" });

    const listing = await CarbonCredit.findById(listingId);
    if (!listing) return res.status(404).json({ success: false, message: "Listing not found" });
    if (listing.status !== "Available") return res.status(400).json({ success: false, message: "Listing is not available" });
    if (listing.quantity < quantity) return res.status(400).json({ success: false, message: `Only ${listing.quantity} credits available` });
    if (listing.seller.toString() === buyerId) return res.status(400).json({ success: false, message: "You cannot purchase your own credits" });

    const pricePerCredit = listing.pricePerCredit;
    const totalAmount = pricePerCredit * quantity;

    if (totalAmount < 50) {
      return res.status(400).json({
        success: false,
        message: `Minimum order amount is ₹50. Current total is ₹${totalAmount}. Please increase the quantity.`,
      });
    }

    const transactionHash = `TXN-${Date.now()}-${Math.random().toString(36).substring(2, 11)}`;

    const transaction = new transactionsModel({
      listing: listingId,
      buyer: buyerId,
      seller: listing.seller,
      quantity,
      pricePerCredit,
      totalAmount,
      paymentStatus: "pending",
      paymentMethod: "other",
      transactionHash,
    });
    await transaction.save();
    pendingTransactionId = transaction._id;

    const useMockCheckout = isRazorpayCheckoutMocked();
    const rz = getRazorpay();

    if (!useMockCheckout && !rz) {
      await transactionsModel.findByIdAndDelete(transaction._id);
      pendingTransactionId = null;
      return res.status(503).json({
        success: false,
        message:
          "Payments are not configured. Set RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET in server/.env, or leave them unset to use demo checkout.",
      });
    }

    const amountPaise = Math.round(totalAmount * 100);

    if (useMockCheckout) {
      const mockOrderId = `mock_${transaction._id}`;
      transaction.razorpayOrderId = mockOrderId;
      await transaction.save();
      if ((process.env.NODE_ENV || "").toLowerCase() === "production") {
        logger.warn("Mock credit checkout session (no real Razorpay payment).");
      }
      return res.status(200).json({
        success: true,
        data: {
          checkoutMode: "mock",
          keyId: "rzp_demo",
          orderId: mockOrderId,
          amount: amountPaise,
          currency: "INR",
          transactionId: transaction._id,
          listingTitle: listing.title,
        },
      });
    }

    const receipt = String(transaction._id).replace(/[^a-zA-Z0-9]/g, "").slice(-40) || `rcpt${Date.now()}`;

    const rpOrder = await rz.orders.create({
      amount: amountPaise,
      currency: "INR",
      receipt,
      notes: {
        transactionId: String(transaction._id),
        listingId: String(listingId),
        buyerId: String(buyerId),
        quantity: String(quantity),
      },
    });

    transaction.razorpayOrderId = rpOrder.id;
    await transaction.save();

    res.status(200).json({
      success: true,
      data: {
        keyId: config.razorpay.keyId,
        orderId: rpOrder.id,
        amount: rpOrder.amount,
        currency: rpOrder.currency,
        transactionId: transaction._id,
        listingTitle: listing.title,
      },
    });
  } catch (error) {
    const detail = getRazorpayErrorMessage(error) || error?.message || "Unknown error";
    const authFail = isRazorpayAuthFailure(error);
    logger.error("Error creating credit checkout session:", error);
    if (pendingTransactionId) {
      await transactionsModel.findByIdAndDelete(pendingTransactionId).catch(() => {});
    }
    const msg = authFail
      ? "Razorpay rejected the API keys (authentication failed). Use Key Id and Key Secret from the same Razorpay dashboard mode (both Test or both Live). On Vercel: Project → Settings → Environment Variables → set RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET, then redeploy."
      : `Checkout failed: ${detail}`;
    res.status(authFail ? 503 : 500).json({
      success: false,
      message: msg,
      error: detail,
      code: authFail ? "RAZORPAY_AUTH" : undefined,
    });
  }
};

// ✅ Demo checkout: complete purchase without Razorpay (only when mock mode is allowed)
export const completeMockCreditCheckout = async (req, res) => {
  try {
    if (!isRazorpayCheckoutMocked()) {
      return res.status(403).json({
        success: false,
        message: "Demo checkout is disabled. Configure Razorpay keys or remove RAZORPAY_MOCK=false.",
      });
    }
    const buyerId = req.user.userId;
    const { transactionId } = req.body;

    const transaction = await transactionsModel.findById(transactionId);
    if (!transaction) {
      return res.status(404).json({ success: false, message: "Transaction not found" });
    }
    if (transaction.buyer.toString() !== buyerId) {
      return res.status(403).json({ success: false, message: "Access denied" });
    }
    if (!transaction.razorpayOrderId?.startsWith("mock_")) {
      return res.status(400).json({ success: false, message: "Not a demo checkout transaction" });
    }
    if (transaction.paymentStatus !== "pending") {
      const existing = await transactionsModel
        .findById(transactionId)
        .populate("listing", "title projectType");
      return res.json({
        success: true,
        data: existing,
        message: existing?.paymentStatus === "completed" ? "Already completed" : "Transaction not pending",
      });
    }

    const updated = await completeCreditPurchase(transactionId, {
      razorpayPaymentId: `mock_pay_${transactionId}`,
      paymentMethod: "other",
    });

    if (!updated) {
      return res.status(409).json({ success: false, message: "Could not complete transaction" });
    }

    const fresh = await transactionsModel
      .findById(transactionId)
      .populate("listing", "title projectType");

    res.json({ success: true, data: fresh, message: "Demo purchase completed" });
  } catch (error) {
    logger.error("Error completing mock credit checkout:", error);
    res.status(500).json({ success: false, message: "Demo checkout failed", error: error.message });
  }
};

// ✅ Verify Razorpay payment signature and fulfill carbon credit purchase
export const verifyRazorpayCreditPayment = async (req, res) => {
  try {
    const buyerId = req.user.userId;
    const { transactionId, razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;

    if (!verifyRazorpayPaymentSignature(razorpay_order_id, razorpay_payment_id, razorpay_signature)) {
      return res.status(400).json({ success: false, message: "Invalid payment signature" });
    }

    const rz = getRazorpay();
    if (!rz) {
      return res.status(503).json({ success: false, message: "Payments are not configured on the server." });
    }

    const transaction = await transactionsModel.findById(transactionId);
    if (!transaction) {
      return res.status(404).json({ success: false, message: "Transaction not found" });
    }
    if (transaction.buyer.toString() !== buyerId) {
      return res.status(403).json({ success: false, message: "Access denied" });
    }
    if (transaction.razorpayOrderId !== razorpay_order_id) {
      return res.status(400).json({ success: false, message: "Order mismatch" });
    }

    const payment = await rz.payments.fetch(razorpay_payment_id);
    if (payment.order_id !== razorpay_order_id) {
      return res.status(400).json({ success: false, message: "Payment does not belong to this order" });
    }

    const expectedPaise = Math.round(transaction.totalAmount * 100);
    if (Number(payment.amount) !== expectedPaise) {
      return res.status(400).json({ success: false, message: "Amount mismatch" });
    }

    if (payment.status !== "captured" && payment.status !== "authorized") {
      return res.status(400).json({ success: false, message: "Payment not successful" });
    }

    const pm =
      payment.method === "upi"
        ? "upi"
        : payment.method === "card"
          ? "card"
          : "other";

    const updated = await completeCreditPurchase(transactionId, {
      razorpayPaymentId: razorpay_payment_id,
      paymentMethod: pm,
    });

    if (!updated) {
      const existing = await transactionsModel.findById(transactionId);
      if (existing?.paymentStatus === "completed") {
        return res.json({ success: true, data: existing, message: "Already completed" });
      }
      return res.status(409).json({ success: false, message: "Could not complete transaction" });
    }

    const fresh = await transactionsModel
      .findById(transactionId)
      .populate("listing", "title projectType");

    res.json({ success: true, data: fresh });
  } catch (error) {
    logger.error("Error verifying Razorpay credit payment:", error);
    res.status(500).json({ success: false, message: "Verification failed", error: error.message });
  }
};

// ✅ Get a single transaction by ID (for post-payment success polling)
// Completes the transaction if Razorpay shows the order as paid but verify was skipped
export const getTransactionById = async (req, res) => {
  try {
    const { transactionId } = req.params;
    const userId = req.user.userId;

    const transaction = await transactionsModel
      .findById(transactionId)
      .populate("listing", "title projectType")
      .populate("seller", "email");

    if (!transaction) {
      return res.status(404).json({ success: false, message: "Transaction not found" });
    }

    if (transaction.buyer.toString() !== userId) {
      return res.status(403).json({ success: false, message: "Access denied" });
    }

    if (transaction.paymentStatus === "pending" && transaction.razorpayOrderId) {
      const rz = getRazorpay();
      if (rz) {
        try {
          const ord = await rz.orders.fetch(transaction.razorpayOrderId);
          const paid =
            ord.status === "paid" ||
            (Number(ord.amount_paid) > 0 && Number(ord.amount_paid) >= Number(ord.amount));
          if (paid) {
            let payId = transaction.razorpayPaymentId;
            if (!payId) {
              const plist = await rz.orders.fetchPayments(transaction.razorpayOrderId);
              const items = plist?.items || [];
              const cap = items.find((p) => p.status === "captured");
              if (cap) payId = cap.id;
            }
            await completeCreditPurchase(transactionId, payId ? { razorpayPaymentId: payId } : {});
          }
        } catch (rzErr) {
          logger.warn("Could not verify Razorpay order during poll:", rzErr.message);
        }
      }
    }

    const updated = await transactionsModel
      .findById(transactionId)
      .populate("listing", "title projectType");

    res.json({ success: true, data: updated });
  } catch (error) {
    logger.error("Error fetching transaction:", error);
    res.status(500).json({ success: false, message: "Failed to fetch transaction" });
  }
};
