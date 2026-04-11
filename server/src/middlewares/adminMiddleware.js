import logger from "../utils/logger.js";

/**
 * Middleware to check if user is an admin
 */
export const isAdmin = (req, res, next) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "Authentication required",
      });
    }

    if (req.user.role !== "admin") {
      logger.warn(`Non-admin user ${req.user.userId} attempted admin access`);
      return res.status(403).json({
        success: false,
        message: "Admin access required",
      });
    }

    next();
  } catch (error) {
    logger.error("Admin check error:", error);
    return res.status(500).json({
      success: false,
      message: "Authorization check failed",
    });
  }
};

/**
 * Middleware to check if user has specific role(s)
 */
export const hasRole = (...roles) => {
  return async (req, res, next) => {
    try {
      if (!req.user) {
        return res.status(401).json({
          success: false,
          message: "Authentication required",
        });
      }

      // Note: This requires role to be included in JWT token
      // or fetched from database
      const userRole = req.user.role;

      if (!roles.includes(userRole)) {
        logger.warn(`Unauthorized access attempt by user ${req.user.userId}`);
        return res.status(403).json({
          success: false,
          message: "You do not have permission to access this resource",
        });
      }

      next();
    } catch (error) {
      logger.error("Role check error:", error);
      return res.status(500).json({
        success: false,
        message: "Authorization check failed",
      });
    }
  };
};
