import User from "../models/userModel.js";
import logger from "../utils/logger.js";
import config from "../config/index.js";

export const register = async (req, res) => {
  return res.status(403).json({
    success: false,
    message: "Email registration is disabled. Please sign in with Google.",
  });
};

export const updateProfile = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { name, company, phone } = req.body;

    const updateData = {};
    if (name !== undefined) updateData.name = name;
    if (company !== undefined) updateData.company = company;
    if (phone !== undefined) updateData.phone = phone;

    const user = await User.findByIdAndUpdate(
      userId,
      updateData,
      { new: true, runValidators: true }
    ).select("-password");

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    logger.info(`Profile updated for user ${userId}`);

    res.json({
      success: true,
      message: "Profile updated successfully",
      data: user,
    });
  } catch (error) {
    logger.error("Profile update error:", error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const verifyOTP = async (req, res) => {
  return res.status(403).json({
    success: false,
    message: "OTP verification is disabled. Please sign in with Google.",
  });
};

export const login = async (req, res) => {
  return res.status(403).json({
    success: false,
    message: "Email and password sign-in is disabled. Please use Google.",
  });
};

export const profile = async (req, res) => {
  try {
    const userDetails = await User.findById(req.user.userId).select("-password");
    
    if (!userDetails) {
      return res.status(404).json({ 
        success: false,
        message: "User not found" 
      });
    }
    
    return res.json({ 
      success: true,
      user: userDetails 
    });
  } catch (error) {
    logger.error("Error fetching profile:", error);
    return res.status(500).json({ 
      success: false,
      message: "Failed to fetch profile" 
    });
  }
};

export const forgotPassword = async (req, res) => {
  return res.status(403).json({
    success: false,
    message: "Password reset is not available. Accounts use Google sign-in only.",
  });
};

export const resetPassword = async (req, res) => {
  return res.status(403).json({
    success: false,
    message: "Password reset is not available. Accounts use Google sign-in only.",
  });
};


// ─── Google OAuth ──────────────────────────────────────────────────────────────

/**
 * Called by Passport after successful Google authentication.
 * Issues a JWT and redirects back to the client.
 */
export const googleAuthCallback = async (req, res) => {
  try {
    const clientBase = process.env.CLIENT_URL || config.clientUrl;
    const user = req.user;
    if (!user) {
      return res.redirect(`${clientBase}/login?error=google_auth_failed`);
    }

    // Update last login
    user.lastLogin = new Date();
    await user.save();

    const token = user.generateAuthToken();

    // Redirect to client with token — client reads query param and stores it
    const params = new URLSearchParams({
      token,
      id: user._id.toString(),
      name: user.name || "",
      email: user.email,
      role: user.role,
      avatar: user.avatar || "",
    });

    res.redirect(`${clientBase}/auth/google/success?${params}`);
  } catch (error) {
    logger.error("Google auth callback error:", error);
    const clientBase = process.env.CLIENT_URL || config.clientUrl;
    res.redirect(`${clientBase}/login?error=google_auth_failed`);
  }
};
