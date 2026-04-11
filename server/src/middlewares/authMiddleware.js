import logger from "../utils/logger.js";
import jwt from "jsonwebtoken";
import config from "../config/index.js";

const authMiddleware = (req, res, next) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader?.split(" ")[1];

  if (!token) {
    logger.warn("Access attempt without valid token!");
    return res.status(401).json({
      message: "Authentication required",
      success: false,
    });
  }

  jwt.verify(token, config.jwt.secret, (err, user) => {
    if (err) {
      logger.warn("Invalid token!");
      return res.status(403).json({
        message: "Invalid or expired token",
        success: false,
      });
    }

    req.user = user;
    next();
  });
};

// Role-based authorization middleware
const roleMiddleware = (allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "Authentication required",
      });
    }

    const userRole = req.user.role;

    // Check if user's role is in the allowed roles
    if (!allowedRoles.includes(userRole)) {
      logger.warn(`User with role ${userRole} attempted to access route requiring ${allowedRoles.join(", ")}`);
      return res.status(403).json({
        success: false,
        message: "You do not have permission to access this resource",
      });
    }

    next();
  };
};

export default authMiddleware;
export { authMiddleware, roleMiddleware };