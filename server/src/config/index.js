import dotenv from "dotenv";

dotenv.config();

/** Dotenv does not trim values; accidental spaces after `KEY= ` break OAuth and MongoDB. */
const env = (key, fallback = "") => {
  const v = process.env[key];
  if (v == null || v === "") return fallback;
  return String(v).trim();
};

const config = {
  // Server Configuration
  port: Number(process.env.PORT) || 8000,
  nodeEnv: process.env.NODE_ENV || "development",

  // Database Configuration (MONGODB_URL supported as alias)
  mongodb: {
    uri: env("MONGODB_URI") || env("MONGODB_URL"),
  },

  // JWT Configuration
  jwt: {
    secret: process.env.JWT_SECRET || "your-secret-key-change-in-production",
    expiry: process.env.JWT_EXPIRY || "7d",
  },

  // Email Configuration (MAIL_USER / MAIL_PASS accepted as aliases)
  email: {
    service: "gmail",
    user: process.env.EMAIL_USER || process.env.MAIL_USER || "your-email@gmail.com",
    pass: process.env.EMAIL_PASS || process.env.MAIL_PASS || "your-app-password",
    from: process.env.EMAIL_FROM || process.env.MAIL_USER || "noreply@example.com",
  },

  // Rate Limiting
  rateLimit: {
    maxAttempts: 5,
    windowMs: 15 * 60 * 1000, // 15 minutes
  },

  // OTP Configuration
  otp: {
    expiryMinutes: 10,
    maxAttempts: 3,
  },

  // Pagination Defaults
  pagination: {
    defaultPage: 1,
    defaultLimit: 10,
    maxLimit: 100,
  },

  // Razorpay (test keys: rzp_test_… from Dashboard → API Keys)
  razorpay: {
    keyId: env("RAZORPAY_KEY_ID"),
    keySecret: env("RAZORPAY_KEY_SECRET"),
  },

  // Client URL
  clientUrl: env("CLIENT_URL", "http://localhost:5173"),

  // Google OAuth Configuration
  google: {
    clientId: env("GOOGLE_CLIENT_ID"),
    clientSecret: env("GOOGLE_CLIENT_SECRET"),
    callbackUrl:
      env("GOOGLE_CALLBACK_URL") ||
      "http://localhost:8000/api/auth/google/callback",
  },
};

export default config;
