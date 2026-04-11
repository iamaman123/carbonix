import express from "express";
import cors from "cors";
import http from "http";
import passport from "./src/config/passport.js";
import connect from "./src/db/index.js";
import logger from "./src/utils/logger.js";
import config from "./src/config/index.js";
import initSocket from "./src/socket/index.js";

// Initialize Express app
const app = express();

import ecoProductRoutes from "./src/routes/ecoProductRoute.js";
import carbonCreditRoutes from "./src/routes/listingRoute.js";

// Middleware
app.use(cors());
app.use(express.json());
app.use(passport.initialize());

// import routes
import userRoutes from "./src/routes/authRoute.js";
import adminRoutes from "./src/routes/adminRoute.js";
import analyticsRoutes from "./src/routes/analyticsRoute.js";
import chatbotRoutes from "./src/routes/chatbotRoute.js";
import pricingRoutes from "./src/routes/pricingRoute.js";
import blogRoutes from "./src/routes/blogRoute.js";
import chatRoutes from "./src/routes/chatRoute.js";

app.use((req, res, next) => {
  logger.info(`Received ${req.method} request to ${req.url}`);
  next();
});

app.use("/api/auth", userRoutes);
app.use("/api/credits", carbonCreditRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/analytics", analyticsRoutes);
app.use("/api/chatbot", chatbotRoutes);
app.use("/api/eco-products", ecoProductRoutes);
app.use("/api/pricing", pricingRoutes);
app.use("/api/blogs", blogRoutes);
app.use("/api/chat", chatRoutes);

// Start Server
const PORT = config.port;

try {
  await connect();
  const httpServer = http.createServer(app);
  initSocket(httpServer);

  httpServer.listen(PORT, () => {
    logger.info(`🚀 Server is running on port ${PORT}`);

    // Warm up the chatbot context cache in the background
    // so the first user request is already cached.
    import("./src/controllers/chatbotController.js").then(({ getChatbotContext }) => {
      const fakeReq = {};
      const fakeRes = {
        status: () => fakeRes,
        json: () => {},
      };
      getChatbotContext(fakeReq, fakeRes)
        .then(() => logger.info("🤖 Chatbot context cache warmed"))
        .catch((e) => logger.warn("Chatbot cache warm-up failed:", e));

      // Auto-refresh cache every 5 minutes
      setInterval(() => {
        getChatbotContext(fakeReq, fakeRes).catch(() => {});
      }, 5 * 60 * 1000);
    });
  });
} catch (err) {
  logger.error("❌ MongoDB connection error:", err);
  process.exit(1);
}
