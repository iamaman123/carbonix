import mongoose from "mongoose";

const producerRequestSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    company: { type: String, default: "", trim: true },
    phone: { type: String, default: "", trim: true },
    message: { type: String, default: "", trim: true },
    status: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "pending",
      index: true,
    },
    adminNote: { type: String, default: "" },
    reviewedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    reviewedAt: { type: Date },
  },
  { timestamps: true },
);

producerRequestSchema.index({ userId: 1, status: 1 });

export default mongoose.model("ProducerRequest", producerRequestSchema);
