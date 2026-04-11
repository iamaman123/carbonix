import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

const userSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  password: { type: String, default: null },
  googleId: { type: String, default: null },
  avatar: { type: String, default: "" },
  authProvider: { type: String, enum: ["local", "google"], default: "local" },
  name: { type: String, default: "" },
  company: { type: String, default: "" },
  phone: { type: String, default: "" },
  role: { 
    type: String, 
    enum: ["PRODUCER", "CONSUMER", "BOTH", "admin"], 
    required: true 
  },
  totalCredits: { type: Number, default: 0 },
  totalSpents: { type: Number, default: 0 },
  posted: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "CarbonCredit",
    },
  ],
  seen: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "CarbonCredit",
    },
  ],
  transactions: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Transaction",
    },
  ],
  isVerified: { type: Boolean, default: false },
  isActive: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now },
  lastLogin: { type: Date },
});

userSchema.pre("save", async function (next) {
  if (!this.isModified("password") || !this.password) return next();
  try {
    this.password = await bcrypt.hash(this.password, 10);
    next();
  } catch (error) {
    next(error);
  }
});

userSchema.methods.comparePassword = async function (candidatePassword) {
  if (!this.password) return false;
  return await bcrypt.compare(candidatePassword, this.password);
};

userSchema.methods.generateAuthToken = function () {
  const expiry = process.env.TOKEN_EXPIRY || "7d";
  return jwt.sign(
    { 
      userId: this._id, 
      role: this.role 
    }, 
    process.env.JWT_SECRET, 
    { expiresIn: expiry }
  );
};

export default mongoose.model("User", userSchema);
