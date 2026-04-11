import mongoose from "mongoose";

const ecoOrderSchema = new mongoose.Schema({
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "EcoProduct",
    required: true,
    index: true,
  },
  buyer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
    index: true,
  },
  quantity: { type: Number, required: true, min: 1 },
  pricePerUnit: { type: Number, required: true, min: 0 },
  totalAmount: { type: Number, required: true, min: 0 },
  shippingAddress: { type: String, default: "" },
  paymentStatus: {
    type: String,
    enum: ["pending", "completed", "failed", "refunded"],
    default: "pending",
    index: true,
  },
  orderStatus: {
    type: String,
    enum: ["placed", "processing", "shipped", "delivered", "cancelled"],
    default: "placed",
    index: true,
  },
  orderHash: { type: String },
  /** Legacy Stripe */
  stripeSessionId: { type: String },
  stripePaymentIntentId: { type: String },
  stripePaymentMethod: { type: String },
  razorpayOrderId: { type: String, index: true },
  razorpayPaymentId: { type: String },
  createdAt: { type: Date, default: Date.now, index: true },
  completedAt: { type: Date },
});

export default mongoose.model("EcoOrder", ecoOrderSchema);
