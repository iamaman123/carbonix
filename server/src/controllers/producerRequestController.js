import ProducerRequest from "../models/producerRequestModel.js";
import User from "../models/userModel.js";
import logger from "../utils/logger.js";

export const submitProducerRequest = async (req, res) => {
  try {
    const userId = req.user.userId;
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }
    if (user.role === "PRODUCER") {
      return res.status(400).json({
        success: false,
        message: "You already have a producer (seller) account.",
      });
    }
    if (user.role === "admin") {
      return res.status(400).json({
        success: false,
        message: "Admins use the admin panel to manage producers.",
      });
    }

    const pending = await ProducerRequest.findOne({ userId, status: "pending" });
    if (pending) {
      return res.status(400).json({
        success: false,
        message: "You already have a pending request. Wait for admin review.",
      });
    }

    const { company = "", phone = "", message = "" } = req.body || {};
    const doc = await ProducerRequest.create({
      userId,
      company: String(company).trim(),
      phone: String(phone).trim(),
      message: String(message).trim(),
      status: "pending",
    });

    res.status(201).json({
      success: true,
      message: "Request submitted. An admin will review it soon.",
      data: doc,
    });
  } catch (error) {
    logger.error("submitProducerRequest:", error);
    res.status(500).json({ success: false, message: "Failed to submit request" });
  }
};

export const getMyProducerRequest = async (req, res) => {
  try {
    const userId = req.user.userId;
    const latest = await ProducerRequest.findOne({ userId })
      .sort({ createdAt: -1 })
      .lean();
    res.json({ success: true, data: latest });
  } catch (error) {
    logger.error("getMyProducerRequest:", error);
    res.status(500).json({ success: false, message: "Failed to load request" });
  }
};

export const listProducerRequests = async (req, res) => {
  try {
    const { status = "pending", page = 1, limit = 20 } = req.query;
    const pageNum = Math.max(1, parseInt(page, 10) || 1);
    const limitNum = Math.min(100, Math.max(1, parseInt(limit, 10) || 20));
    const skip = (pageNum - 1) * limitNum;

    const query = {};
    if (status && ["pending", "approved", "rejected", "all"].includes(status)) {
      if (status !== "all") query.status = status;
    }

    const total = await ProducerRequest.countDocuments(query);
    const rows = await ProducerRequest.find(query)
      .populate("userId", "email name avatar company phone")
      .populate("reviewedBy", "email name")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limitNum)
      .lean();

    res.json({
      success: true,
      data: rows,
      pagination: {
        currentPage: pageNum,
        totalPages: Math.ceil(total / limitNum) || 1,
        totalItems: total,
        itemsPerPage: limitNum,
      },
    });
  } catch (error) {
    logger.error("listProducerRequests:", error);
    res.status(500).json({ success: false, message: "Failed to list requests" });
  }
};

export const reviewProducerRequest = async (req, res) => {
  try {
    const { requestId } = req.params;
    const { action, adminNote = "" } = req.body || {};

    if (!["approve", "reject"].includes(action)) {
      return res.status(400).json({
        success: false,
        message: "action must be 'approve' or 'reject'",
      });
    }

    const request = await ProducerRequest.findById(requestId);
    if (!request) {
      return res.status(404).json({ success: false, message: "Request not found" });
    }
    if (request.status !== "pending") {
      return res.status(400).json({
        success: false,
        message: "This request was already reviewed.",
      });
    }

    const user = await User.findById(request.userId);
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    request.reviewedBy = req.user.userId;
    request.reviewedAt = new Date();
    request.adminNote = String(adminNote || "").trim();

    if (action === "approve") {
      if (user.role !== "CONSUMER") {
        return res.status(400).json({
          success: false,
          message: `User role is ${user.role}; only consumers can be promoted via this flow.`,
        });
      }
      user.role = "PRODUCER";
      await user.save();
      request.status = "approved";
    } else {
      request.status = "rejected";
    }

    await request.save();

    logger.info(
      `Producer request ${requestId} ${action} by admin ${req.user.userId}`,
    );

    res.json({
      success: true,
      message:
        action === "approve"
          ? "User is now a producer. They can list energy for sale."
          : "Request rejected.",
      data: request,
    });
  } catch (error) {
    logger.error("reviewProducerRequest:", error);
    res.status(500).json({ success: false, message: "Failed to review request" });
  }
};
