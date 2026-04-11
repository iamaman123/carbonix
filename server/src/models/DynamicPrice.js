import mongoose from "mongoose";

const DynamicPriceSchema = new mongoose.Schema({
  listing: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "CarbonCredit",
    required: true,
    unique: true,
    index: true,
  },
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "EcoProduct",
    sparse: true,
    unique: true,
  },
  basePrice: { type: Number, required: true, min: 0 },
  recommendedPrice: { type: Number, required: true, min: 0 },
  priceMultiplier: { type: Number, default: 1, min: 0.5, max: 2 },
  demandScore: { type: Number, min: 0, max: 100 },
  supplyScore: { type: Number, min: 0, max: 100 },
  marketTemperature: {
    type: String,
    enum: ["cold", "cool", "moderate", "warm", "hot"],
    default: "moderate",
  },
  factors: {
    demandFactor: { type: Number },
    supplyFactor: { type: Number },
    rateFactor: { type: Number },
    verificationFactor: { type: Number },
    trendFactor: { type: Number },
    timeDecayFactor: { type: Number },
  },
  priceHistory: [
    {
      price: Number,
      timestamp: { type: Date, default: Date.now },
      reason: String,
    },
  ],
  lastUpdatedAt: { type: Date, default: Date.now },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

// Index for finding pricing by timestamp
DynamicPriceSchema.index({ lastUpdatedAt: -1 });
DynamicPriceSchema.index({ marketTemperature: 1 });

export default mongoose.model("DynamicPrice", DynamicPriceSchema);
