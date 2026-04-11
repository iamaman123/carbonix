import express from "express";
import cors from "cors";
import passport from "./config/passport.js";
import logger from "./utils/logger.js";
import connect from "./db/index.js";

import ecoProductRoutes from "./routes/ecoProductRoute.js";
import carbonCreditRoutes from "./routes/listingRoute.js";
import userRoutes from "./routes/authRoute.js";
import adminRoutes from "./routes/adminRoute.js";
import analyticsRoutes from "./routes/analyticsRoute.js";
import chatbotRoutes from "./routes/chatbotRoute.js";
import pricingRoutes from "./routes/pricingRoute.js";
import blogRoutes from "./routes/blogRoute.js";
import chatRoutes from "./routes/chatRoute.js";

const app = express();

/** Vercel sets VERCEL=1; local dev uses local.js which connects before listen. */
let vercelConnectPromise;
const ensureMongoOnVercel = async (req, res, next) => {
  if (!process.env.VERCEL) return next();
  try {
    if (!vercelConnectPromise) vercelConnectPromise = connect();
    await vercelConnectPromise;
    next();
  } catch (err) {
    logger.error("MongoDB unavailable (Vercel)", err);
    return res.status(503).json({
      ok: false,
      error: "database_unavailable",
      message: err?.message || String(err),
      hint:
        "Set MONGODB_URI (or MONGODB_URI_DIRECT) in Vercel → Settings → Environment Variables for Production and Preview, then redeploy.",
    });
  }
};

app.use(ensureMongoOnVercel);
app.use(cors());
app.use(express.json());
app.use(passport.initialize());

app.use((req, res, next) => {
  logger.info(`Received ${req.method} request to ${req.url}`);
  next();
});

app.get("/", (_req, res) => {
  res.status(200).json({
    ok: true,
    service: "carbonix-api",
    docs: "REST API under /api (e.g. GET /api/auth/oauth-config).",
  });
});

app.get("/favicon.ico", (_req, res) => res.status(204).end());
app.get("/favicon.png", (_req, res) => res.status(204).end());

app.use("/api/auth", userRoutes);
app.use("/api/credits", carbonCreditRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/analytics", analyticsRoutes);
app.use("/api/chatbot", chatbotRoutes);
app.use("/api/eco-products", ecoProductRoutes);
app.use("/api/pricing", pricingRoutes);
app.use("/api/blogs", blogRoutes);
app.use("/api/chat", chatRoutes);

export default app;
