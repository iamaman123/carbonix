import express from "express";
import {
  getOrCreateChat,
  getUserChats,
  getChatMessages,
  sendMessage,
  getChatableUsers
} from "../controllers/chatController.js";
import { authMiddleware } from "../middlewares/authMiddleware.js";

const router = express.Router();

// All chat routes require authentication
router.use(authMiddleware);

// Get all chats for logged in user
router.get("/", getUserChats);

// Get users available for chat (producers for buyers, consumers for sellers)
router.get("/users", getChatableUsers);

// Get or create a chat with a specific user
router.post("/create", getOrCreateChat);

// Get messages for a specific chat
router.get("/:chatId/messages", getChatMessages);

// Send a message (REST fallback, socket.io is primary)
router.post("/message", sendMessage);

export default router;
