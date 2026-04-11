import EcoProduct from "../models/EcoProduct.js";
import EcoOrder from "../models/EcoOrder.js";
import userModel from "../models/userModel.js";
import logger from "../utils/logger.js";
import config from "../config/index.js";
import { getRazorpay, getRazorpayErrorMessage, verifyRazorpayPaymentSignature } from "../utils/razorpayClient.js";

async function completeEcoOrderPurchase(orderId, paymentExtras = {}) {
  const order = await EcoOrder.findById(orderId);
  if (!order) return null;

  const updated = await EcoOrder.findOneAndUpdate(
    { _id: orderId, paymentStatus: "pending" },
    {
      paymentStatus: "completed",
      completedAt: new Date(),
      ...paymentExtras,
    },
    { new: true }
  );
  if (!updated) return null;

  const product = await EcoProduct.findById(order.product);
  if (product) {
    const newStock = product.stock - order.quantity;
    await EcoProduct.findByIdAndUpdate(order.product, {
      $inc: { stock: -order.quantity, totalSold: order.quantity },
      status: newStock <= 0 ? "OutOfStock" : "Active",
      updatedAt: Date.now(),
    });
  }

  logger.info(`Eco order completed: ${orderId}`);
  return updated;
}

// ==============================
// ADMIN: Create a new eco product
// ==============================
export const createEcoProduct = async (req, res) => {
  try {
    const productData = {
      ...req.body,
      addedBy: req.user.userId,
    };

    const product = new EcoProduct(productData);
    const savedProduct = await product.save();

    res.status(201).json({
      success: true,
      message: "Eco product created successfully",
      data: savedProduct,
    });
  } catch (error) {
    logger.error("Error creating eco product:", error);
    res.status(400).json({
      success: false,
      message: "Failed to create eco product",
      error: error.message,
    });
  }
};

// ==============================
// ADMIN: Update an eco product
// ==============================
export const updateEcoProduct = async (req, res) => {
  try {
    const updates = { ...req.body, updatedAt: Date.now() };

    // If admin is restocking (stock > 0), reset status to Active automatically
    if (updates.stock != null && Number(updates.stock) > 0 && !updates.status) {
      updates.status = "Active";
    }
    // If stock is being set to 0, mark OutOfStock
    if (updates.stock != null && Number(updates.stock) === 0 && !updates.status) {
      updates.status = "OutOfStock";
    }

    const updated = await EcoProduct.findByIdAndUpdate(
      req.params.id,
      updates,
      { new: true, runValidators: true },
    );

    if (!updated) {
      return res.status(404).json({ success: false, message: "Product not found" });
    }

    res.status(200).json({
      success: true,
      message: "Product updated successfully",
      data: updated,
    });
  } catch (error) {
    logger.error("Error updating eco product:", error);
    res.status(400).json({
      success: false,
      message: "Failed to update product",
      error: error.message,
    });
  }
};

// ==============================
// ADMIN: Delete an eco product
// ==============================
export const deleteEcoProduct = async (req, res) => {
  try {
    const deleted = await EcoProduct.findByIdAndDelete(req.params.id);
    if (!deleted) {
      return res
        .status(404)
        .json({ success: false, message: "Product not found" });
    }

    res.status(200).json({
      success: true,
      message: "Product deleted successfully",
    });
  } catch (error) {
    logger.error("Error deleting eco product:", error);
    res.status(500).json({
      success: false,
      message: "Failed to delete product",
      error: error.message,
    });
  }
};

// ==============================
// PUBLIC: Get all eco products (with pagination & search)
// ==============================
export const getEcoProducts = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 12,
      search = "",
      category,
      minPrice,
      maxPrice,
      ecoRating,
      status = "Active",
      sortBy = "createdAt",
      sortOrder = "desc",
    } = req.query;

    const pageNum = parseInt(page, 10);
    const limitNum = parseInt(limit, 10);
    const skip = (pageNum - 1) * limitNum;

    let query = {};

    if (search) {
      query.$text = { $search: search };
    }

    if (category && category !== "all") {
      query.category = category;
    }

    if (status && status !== "all") {
      query.status = status;
    }

    if (ecoRating) {
      query.ecoRating = { $gte: Number(ecoRating) };
    }

    if (minPrice || maxPrice) {
      query.price = {};
      if (minPrice) query.price.$gte = Number(minPrice);
      if (maxPrice) query.price.$lte = Number(maxPrice);
    }

    const total = await EcoProduct.countDocuments(query);

    const sort = {};
    sort[sortBy] = sortOrder === "asc" ? 1 : -1;

    const products = await EcoProduct.find(query)
      .populate("addedBy", "email name")
      .sort(sort)
      .skip(skip)
      .limit(limitNum);

    res.status(200).json({
      success: true,
      data: products,
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
    logger.error("Error fetching eco products:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch eco products",
      error: error.message,
    });
  }
};

// ==============================
// PUBLIC: Get a single eco product by ID
// ==============================
export const getEcoProductById = async (req, res) => {
  try {
    const product = await EcoProduct.findById(req.params.id).populate(
      "addedBy",
      "email name",
    );

    if (!product) {
      return res
        .status(404)
        .json({ success: false, message: "Product not found" });
    }

    res.status(200).json({ success: true, data: product });
  } catch (error) {
    logger.error("Error fetching eco product:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch product",
      error: error.message,
    });
  }
};

// ==============================
// AUTHENTICATED: Purchase an eco product
// ==============================
export const purchaseEcoProduct = async (req, res) => {
  try {
    const buyerId = req.user.userId;
    const { productId, quantity, shippingAddress } = req.body;

    const buyer = await userModel.findById(buyerId);
    if (!buyer) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }

    const product = await EcoProduct.findById(productId);
    if (!product) {
      return res
        .status(404)
        .json({ success: false, message: "Product not found" });
    }

    if (product.status !== "Active") {
      return res.status(400).json({
        success: false,
        message: "Product is not available for purchase",
      });
    }

    if (product.stock < quantity) {
      return res.status(400).json({
        success: false,
        message: `Insufficient stock. Only ${product.stock} items remaining.`,
      });
    }

    const totalAmount = product.price * quantity;

    // Reduce stock
    const newStock = product.stock - quantity;
    await EcoProduct.findByIdAndUpdate(productId, {
      $inc: { stock: -quantity, totalSold: quantity },
      status: newStock === 0 ? "OutOfStock" : "Active",
      updatedAt: Date.now(),
    });

    // Create order
    const order = new EcoOrder({
      product: productId,
      buyer: buyerId,
      quantity,
      pricePerUnit: product.price,
      totalAmount,
      shippingAddress: shippingAddress || "",
      paymentStatus: "completed",
      orderStatus: "placed",
      orderHash: `ECO-${Date.now()}-${Math.random().toString(36).substring(2, 11)}`,
      completedAt: Date.now(),
    });

    await order.save();

    const populatedOrder = await EcoOrder.findById(order._id)
      .populate("product", "name category price imageUrl")
      .populate("buyer", "email name");

    logger.info(`Eco product purchased: ${order._id}`, {
      buyer: buyerId,
      product: productId,
      amount: totalAmount,
    });

    res.status(200).json({
      success: true,
      message: "Purchase completed successfully",
      data: {
        orderId: order._id,
        orderHash: order.orderHash,
        productName: product.name,
        quantity,
        totalAmount,
        stockRemaining: newStock,
      },
    });
  } catch (error) {
    logger.error("Eco product purchase failed:", error);
    res.status(400).json({
      success: false,
      message: error.message || "Purchase failed",
    });
  }
};

// ==============================
// AUTHENTICATED: Get user's eco orders
// ==============================
export const getMyEcoOrders = async (req, res) => {
  try {
    const userId = req.user.userId;

    const orders = await EcoOrder.find({ buyer: userId })
      .populate("product", "name category price imageUrl")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      data: orders,
    });
  } catch (error) {
    logger.error("Error fetching eco orders:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch orders",
      error: error.message,
    });
  }
};

// ==============================
// ADMIN: Get all eco orders
// ==============================
export const getAllEcoOrders = async (req, res) => {
  try {
    const { page = 1, limit = 20 } = req.query;
    const pageNum = parseInt(page, 10);
    const limitNum = parseInt(limit, 10);
    const skip = (pageNum - 1) * limitNum;

    const total = await EcoOrder.countDocuments();

    const orders = await EcoOrder.find()
      .populate("product", "name category price imageUrl")
      .populate("buyer", "email name")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limitNum);

    res.status(200).json({
      success: true,
      data: orders,
      pagination: {
        currentPage: pageNum,
        totalPages: Math.ceil(total / limitNum),
        totalItems: total,
        itemsPerPage: limitNum,
      },
    });
  } catch (error) {
    logger.error("Error fetching all eco orders:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch orders",
      error: error.message,
    });
  }
};

// ==============================
// ADMIN: Get eco marketplace stats
// ==============================
export const getEcoStats = async (req, res) => {
  try {
    const totalProducts = await EcoProduct.countDocuments();
    const activeProducts = await EcoProduct.countDocuments({
      status: "Active",
    });
    const totalOrders = await EcoOrder.countDocuments();

    const revenueResult = await EcoOrder.aggregate([
      { $match: { paymentStatus: "completed" } },
      { $group: { _id: null, total: { $sum: "$totalAmount" } } },
    ]);
    const totalRevenue = revenueResult[0]?.total || 0;

    const topProducts = await EcoProduct.find()
      .sort({ totalSold: -1 })
      .limit(5)
      .select("name category price totalSold imageUrl");

    res.status(200).json({
      success: true,
      data: {
        totalProducts,
        activeProducts,
        totalOrders,
        totalRevenue,
        topProducts,
      },
    });
  } catch (error) {
    logger.error("Error fetching eco stats:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch stats",
      error: error.message,
    });
  }
};

// ==============================
// AUTHENTICATED: Create Razorpay order (client opens Razorpay Checkout)
// ==============================
export const createCheckoutSession = async (req, res) => {
  let pendingOrderId = null;
  try {
    const buyerId = req.user.userId;
    const { productId, quantity, shippingAddress } = req.body;

    const buyer = await userModel.findById(buyerId);
    if (!buyer) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }

    const product = await EcoProduct.findById(productId);
    if (!product) {
      return res
        .status(404)
        .json({ success: false, message: "Product not found" });
    }

    if (product.status !== "Active") {
      return res.status(400).json({
        success: false,
        message: "Product is not available for purchase",
      });
    }

    if (product.stock < quantity) {
      return res.status(400).json({
        success: false,
        message: `Insufficient stock. Only ${product.stock} items remaining.`,
      });
    }

    const totalAmount = product.price * quantity;
    const orderHash = `ECO-${Date.now()}-${Math.random().toString(36).substring(2, 11)}`;

    const order = new EcoOrder({
      product: productId,
      buyer: buyerId,
      quantity,
      pricePerUnit: product.price,
      totalAmount,
      shippingAddress: shippingAddress || "",
      paymentStatus: "pending",
      orderStatus: "placed",
      orderHash,
    });

    await order.save();
    pendingOrderId = order._id;

    const rz = getRazorpay();
    if (!rz) {
      await EcoOrder.findByIdAndDelete(order._id);
      pendingOrderId = null;
      return res.status(503).json({
        success: false,
        message: "Payments are not configured. Set RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET in server/.env.",
      });
    }

    const amountPaise = Math.round(totalAmount * 100);
    if (amountPaise < 100) {
      await EcoOrder.findByIdAndDelete(order._id);
      pendingOrderId = null;
      return res.status(400).json({
        success: false,
        message: "Minimum order total is ₹1.00 for online payment. Increase quantity or choose another product.",
      });
    }
    const receipt = String(order._id).replace(/[^a-zA-Z0-9]/g, "").slice(-40) || `eco${Date.now()}`;

    const rpOrder = await rz.orders.create({
      amount: amountPaise,
      currency: "INR",
      receipt,
      notes: {
        orderId: String(order._id),
        productId: String(productId),
        buyerId: String(buyerId),
        quantity: String(quantity),
      },
    });

    order.razorpayOrderId = rpOrder.id;
    await order.save();

    logger.info(`Razorpay order created for eco checkout: ${rpOrder.id}`, {
      orderId: order._id,
      buyer: buyerId,
      product: productId,
    });

    res.status(200).json({
      success: true,
      message: "Checkout order created successfully",
      data: {
        keyId: config.razorpay.keyId,
        orderId: rpOrder.id,
        amount: rpOrder.amount,
        currency: rpOrder.currency,
        mongoOrderId: order._id,
        orderHash: order.orderHash,
        productName: product.name,
      },
    });
  } catch (error) {
    const detail = getRazorpayErrorMessage(error) || error?.message || "Unknown error";
    logger.error("Error creating checkout session:", error);
    if (pendingOrderId) {
      await EcoOrder.findByIdAndDelete(pendingOrderId).catch(() => {});
    }
    res.status(500).json({
      success: false,
      message: `Checkout failed: ${detail}`,
      error: detail,
    });
  }
};

// ✅ Verify Razorpay payment and fulfill eco order
export const verifyRazorpayEcoPayment = async (req, res) => {
  try {
    const buyerId = req.user.userId;
    const { orderId, razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;

    if (!verifyRazorpayPaymentSignature(razorpay_order_id, razorpay_payment_id, razorpay_signature)) {
      return res.status(400).json({ success: false, message: "Invalid payment signature" });
    }

    const rz = getRazorpay();
    if (!rz) {
      return res.status(503).json({ success: false, message: "Payments are not configured on the server." });
    }

    const order = await EcoOrder.findById(orderId);
    if (!order) {
      return res.status(404).json({ success: false, message: "Order not found" });
    }
    if (order.buyer.toString() !== buyerId) {
      return res.status(403).json({ success: false, message: "Access denied" });
    }
    if (order.razorpayOrderId !== razorpay_order_id) {
      return res.status(400).json({ success: false, message: "Order mismatch" });
    }

    const payment = await rz.payments.fetch(razorpay_payment_id);
    if (payment.order_id !== razorpay_order_id) {
      return res.status(400).json({ success: false, message: "Payment does not belong to this order" });
    }

    const expectedPaise = Math.round(order.totalAmount * 100);
    if (Number(payment.amount) !== expectedPaise) {
      return res.status(400).json({ success: false, message: "Amount mismatch" });
    }

    if (payment.status !== "captured" && payment.status !== "authorized") {
      return res.status(400).json({ success: false, message: "Payment not successful" });
    }

    const updated = await completeEcoOrderPurchase(orderId, {
      razorpayPaymentId: razorpay_payment_id,
    });

    if (!updated) {
      const existing = await EcoOrder.findById(orderId);
      if (existing?.paymentStatus === "completed") {
        const fresh = await EcoOrder.findById(orderId).populate("product", "name category price imageUrl");
        return res.json({ success: true, data: fresh, message: "Already completed" });
      }
      return res.status(409).json({ success: false, message: "Could not complete order" });
    }

    const fresh = await EcoOrder.findById(orderId).populate("product", "name category price imageUrl");
    res.json({ success: true, data: fresh });
  } catch (error) {
    logger.error("Error verifying Razorpay eco payment:", error);
    res.status(500).json({ success: false, message: "Verification failed", error: error.message });
  }
};

// ✅ Get a single eco order by ID — completes it if Razorpay shows paid (polling fallback)
export const getEcoOrderById = async (req, res) => {
  try {
    const { orderId } = req.params;
    const userId = req.user.userId;

    const order = await EcoOrder.findById(orderId).populate("product", "name category price imageUrl");

    if (!order) return res.status(404).json({ success: false, message: "Order not found" });
    if (order.buyer.toString() !== userId) return res.status(403).json({ success: false, message: "Access denied" });

    if (order.paymentStatus === "pending" && order.razorpayOrderId) {
      const rz = getRazorpay();
      if (rz) {
        try {
          const ord = await rz.orders.fetch(order.razorpayOrderId);
          const paid =
            ord.status === "paid" ||
            (Number(ord.amount_paid) > 0 && Number(ord.amount_paid) >= Number(ord.amount));
          if (paid) {
            let payId = order.razorpayPaymentId;
            if (!payId) {
              const plist = await rz.orders.fetchPayments(order.razorpayOrderId);
              const items = plist?.items || [];
              const cap = items.find((p) => p.status === "captured");
              if (cap) payId = cap.id;
            }
            await completeEcoOrderPurchase(orderId, payId ? { razorpayPaymentId: payId } : {});
          }
        } catch (rzErr) {
          logger.warn("Could not verify Razorpay order for eco order:", rzErr.message);
        }
      }
    }

    const fresh = await EcoOrder.findById(orderId).populate("product", "name category price imageUrl");
    res.json({ success: true, data: fresh });
  } catch (error) {
    logger.error("Error fetching eco order:", error);
    res.status(500).json({ success: false, message: "Failed to fetch order" });
  }
};
