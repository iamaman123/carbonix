import mongoose from "mongoose";

const EcoProductSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String, required: true },
  category: {
    type: String,
    enum: [
      "Solar Equipment",
      "Energy Storage",
      "EV Accessories",
      "Eco Home",
      "Sustainable Fashion",
      "Organic & Natural",
      "Recycled Products",
      "Water Conservation",
      "Others",
    ],
    required: true,
    index: true,
  },
  price: { type: Number, min: 0, required: true, index: true },
  stock: { type: Number, min: 0, required: true },
  imageUrl: { type: String, default: "" },
  ecoRating: {
    type: Number,
    min: 1,
    max: 5,
    default: 3,
  },
  tags: [{ type: String }],
  specifications: { type: String, default: "" },
  carbonEmissionSaved: { type: Number, min: 0, default: null },
  addedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  status: {
    type: String,
    enum: ["Active", "OutOfStock", "Discontinued"],
    default: "Active",
    index: true,
  },
  totalSold: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now, index: true },
  updatedAt: { type: Date, default: Date.now },
});

// Text index for search
EcoProductSchema.index({
  name: "text",
  description: "text",
  tags: "text",
});

// Update stock status automatically
EcoProductSchema.pre("save", function (next) {
  if (this.stock === 0 && this.status === "Active") {
    this.status = "OutOfStock";
  }
  this.updatedAt = Date.now();
  next();
});

const EcoProduct = mongoose.model("EcoProduct", EcoProductSchema);
export default EcoProduct;
