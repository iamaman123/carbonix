import express from "express";
import { getChatbotContext, chatWithGemini } from "../controllers/chatbotController.js";

const router = express.Router();

router.get("/context", getChatbotContext);
router.post("/chat", chatWithGemini);

export default router;
