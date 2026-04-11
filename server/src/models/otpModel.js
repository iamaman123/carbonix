import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const otpSchema = new mongoose.Schema({
  email: { type: String, required: true, index: true },
  otp: { type: String, required: true },
  attempts: { type: Number, default: 0, max: 3 },
  expiresAt: { type: Date, required: true },
  createdAt: { type: Date, default: Date.now },
});

// TTL index - automatically delete expired OTPs
otpSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

// Hash OTP before saving
otpSchema.pre("save", async function (next) {
  if (!this.isModified("otp")) return next();
  try {
    this.otp = await bcrypt.hash(this.otp, 10);
    next();
  } catch (error) {
    next(error);
  }
});

// Method to verify OTP
otpSchema.methods.verifyOTP = async function (candidateOTP) {
  return await bcrypt.compare(candidateOTP, this.otp);
};

export default mongoose.model("OTP", otpSchema);
