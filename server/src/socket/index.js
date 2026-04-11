import jwt from "jsonwebtoken";
import { Server } from "socket.io";
import config from "../config/index.js";
import Chat from "../models/Chat.js";
import logger from "../utils/logger.js";

const extractToken = (socket) => {
  const authToken = socket.handshake?.auth?.token;
  const headerAuth = socket.handshake?.headers?.authorization;

  if (authToken) return authToken;
  if (headerAuth && headerAuth.startsWith("Bearer ")) {
    return headerAuth.slice("Bearer ".length);
  }

  return null;
};

const buildMessagePayload = (chatId, message) => ({
  chatId,
  message
});

const initSocket = (httpServer) => {
  const io = new Server(httpServer, {
    cors: {
      origin: config.clientUrl,
      credentials: true
    }
  });

  io.use((socket, next) => {
    const token = extractToken(socket);

    if (!token) {
      return next(new Error("Authentication required"));
    }

    jwt.verify(token, config.jwt.secret, (err, user) => {
      if (err) {
        return next(new Error("Invalid or expired token"));
      }

      socket.user = user;
      next();
    });
  });

  io.on("connection", (socket) => {
    const userId = socket.user?.userId;

    if (!userId) {
      socket.disconnect();
      return;
    }

    socket.join(`user:${userId}`);
    logger.info(`Socket connected for user ${userId}`);

    socket.on("chat:join", async ({ chatId }) => {
      if (!chatId) return;

      const chat = await Chat.findOne({
        _id: chatId,
        participants: userId
      }).select("_id");

      if (!chat) return;

      socket.join(`chat:${chatId}`);
      socket.emit("chat:joined", { chatId });
    });

    socket.on("chat:leave", ({ chatId }) => {
      if (!chatId) return;
      socket.leave(`chat:${chatId}`);
    });

    socket.on("chat:message", async ({ chatId, content }, callback) => {
      try {
        if (!chatId || !content?.trim()) return;

        const chat = await Chat.findOne({
          _id: chatId,
          participants: userId
        });

        if (!chat) return;

        const message = {
          sender: userId,
          content: content.trim(),
          timestamp: new Date(),
          read: false
        };

        chat.messages.push(message);
        chat.lastMessage = message.content;
        chat.lastMessageTime = message.timestamp;

        const otherParticipant = chat.participants.find(
          (participantId) => participantId.toString() !== userId.toString()
        );

        if (otherParticipant) {
          const currentUnread = chat.unreadCount.get(otherParticipant.toString()) || 0;
          chat.unreadCount.set(otherParticipant.toString(), currentUnread + 1);
        }

        await chat.save();

        const populatedChat = await Chat.findById(chatId)
          .populate("messages.sender", "name email role")
          .select("messages participants");

        const newMessage = populatedChat.messages[populatedChat.messages.length - 1];
        const payload = buildMessagePayload(chatId, newMessage);

        io.to(`chat:${chatId}`).emit("chat:message", payload);
        if (otherParticipant) {
          io.to(`user:${otherParticipant.toString()}`).emit("chat:message", payload);
        }

        if (callback) callback({ success: true, payload });
      } catch (error) {
        logger.error("Socket message error:", error);
        if (callback) callback({ success: false, message: "Failed to send message" });
      }
    });

    socket.on("disconnect", () => {
      logger.info(`Socket disconnected for user ${userId}`);
    });
  });

  return io;
};

export default initSocket;
