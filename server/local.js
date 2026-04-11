/**
 * Long-running API server (local dev or any host that uses Node listen + Socket.IO).
 * Vercel uses index.js (default export handler) instead.
 */
import http from "http";
import app from "./src/app.js";
import connect from "./src/db/index.js";
import logger from "./src/utils/logger.js";
import config from "./src/config/index.js";
import initSocket from "./src/socket/index.js";

const PORT = config.port;

try {
  await connect();
  const httpServer = http.createServer(app);
  initSocket(httpServer);

  httpServer.listen(PORT, () => {
    logger.info(`🚀 Server is running on port ${PORT}`);

    import("./src/controllers/chatbotController.js").then(({ getChatbotContext }) => {
      const fakeReq = {};
      const fakeRes = {
        status: () => fakeRes,
        json: () => {},
      };
      getChatbotContext(fakeReq, fakeRes)
        .then(() => logger.info("🤖 Chatbot context cache warmed"))
        .catch((e) => logger.warn("Chatbot cache warm-up failed:", e));

      setInterval(() => {
        getChatbotContext(fakeReq, fakeRes).catch(() => {});
      }, 5 * 60 * 1000);
    });
  });
} catch (err) {
  logger.error("❌ MongoDB connection error:", err);
  process.exit(1);
}
