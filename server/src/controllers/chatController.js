import Chat from "../models/Chat.js";
import User from "../models/userModel.js";
import logger from "../utils/logger.js";

// Get or create a chat between two users
export const getOrCreateChat = async (req, res) => {
  try {
    const { participantId } = req.body;
    const userId = req.user.userId;

    // Validate participant exists
    const participant = await User.findById(participantId);
    if (!participant) {
      return res.status(404).json({ message: "User not found" });
    }

    // Check if chat already exists between these users
    let chat = await Chat.findOne({
      participants: { $all: [userId, participantId] }
    }).populate("participants", "name email role");

    // If no chat exists, create a new one
    if (!chat) {
      chat = await Chat.create({
        participants: [userId, participantId],
        messages: [],
        unreadCount: {
          [userId]: 0,
          [participantId]: 0
        }
      });
      
      // Populate the participants
      chat = await Chat.findById(chat._id).populate("participants", "name email role");
    }

    res.status(200).json({ success: true, data: chat });
  } catch (error) {
    logger.error("Error in getOrCreateChat:", error);
    res.status(500).json({ message: "Error creating/fetching chat", error: error.message });
  }
};

// Get all chats for a user
export const getUserChats = async (req, res) => {
  try {
    const userId = req.user.userId;

    const chats = await Chat.find({
      participants: userId
    })
      .populate("participants", "name email role")
      .sort({ lastMessageTime: -1 });

    res.status(200).json({ success: true, data: chats });
  } catch (error) {
    logger.error("Error in getUserChats:", error);
    res.status(500).json({ message: "Error fetching chats", error: error.message });
  }
};

// Get messages for a specific chat
export const getChatMessages = async (req, res) => {
  try {
    const { chatId } = req.params;
    const userId = req.user.userId;

    const chat = await Chat.findOne({
      _id: chatId,
      participants: userId
    }).populate("messages.sender", "name email role");

    if (!chat) {
      return res.status(404).json({ message: "Chat not found" });
    }

    // Mark messages as read for this user
    chat.messages.forEach(message => {
      if (message.sender._id.toString() !== userId.toString() && !message.read) {
        message.read = true;
      }
    });

    // Reset unread count for this user
    if (chat.unreadCount) {
      chat.unreadCount.set(userId.toString(), 0);
    }

    await chat.save();

    res.status(200).json({ success: true, data: chat.messages });
  } catch (error) {
    logger.error("Error in getChatMessages:", error);
    res.status(500).json({ message: "Error fetching messages", error: error.message });
  }
};

// Send a message (mainly for REST fallback, socket.io will be primary)
export const sendMessage = async (req, res) => {
  try {
    const { chatId, content } = req.body;
    const userId = req.user.userId;

    const chat = await Chat.findOne({
      _id: chatId,
      participants: userId
    });

    if (!chat) {
      return res.status(404).json({ message: "Chat not found" });
    }

    const message = {
      sender: userId,
      content,
      timestamp: new Date(),
      read: false
    };

    chat.messages.push(message);
    chat.lastMessage = content;
    chat.lastMessageTime = new Date();

    // Increment unread count for other participant
    const otherParticipant = chat.participants.find(
      p => p.toString() !== userId.toString()
    );
    
    const currentUnread = chat.unreadCount.get(otherParticipant.toString()) || 0;
    chat.unreadCount.set(otherParticipant.toString(), currentUnread + 1);

    await chat.save();

    const populatedChat = await Chat.findById(chatId)
      .populate("messages.sender", "name email role")
      .populate("participants", "name email role");

    res.status(200).json({
      success: true,
      data: {
        chatId,
        message: populatedChat.messages[populatedChat.messages.length - 1]
      }
    });
  } catch (error) {
    logger.error("Error in sendMessage:", error);
    res.status(500).json({ message: "Error sending message", error: error.message });
  }
};

// Get all producers/consumers for chat list
export const getChatableUsers = async (req, res) => {
  try {
    const userId = req.user.userId;
    const userRole = req.user.role;

    const roleFilter = (() => {
      if (userRole === "PRODUCER") return "CONSUMER";
      if (userRole === "CONSUMER") return "PRODUCER";
      return { $ne: userRole };
    })();

    const users = await User.find({
      _id: { $ne: userId },
      role: roleFilter
    }).select("name email role");

    res.status(200).json({ success: true, data: users });
  } catch (error) {
    logger.error("Error in getChatableUsers:", error);
    res.status(500).json({ message: "Error fetching users", error: error.message });
  }
};
