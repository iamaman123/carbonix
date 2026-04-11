import logger from "../utils/logger.js";

// Simple in-memory rate limiter (for production, use Redis)
const attempts = new Map();

/**
 * Rate limiter middleware
 * @param {number} maxAttempts - Maximum number of attempts allowed
 * @param {number} windowMs - Time window in milliseconds
 * @param {string} keyPrefix - Prefix for the rate limit key
 */
export const rateLimiter = (maxAttempts = 5, windowMs = 15 * 60 * 1000, keyPrefix = "ratelimit") => {
  return (req, res, next) => {
    const identifier = req.body.email || req.ip;
    const key = `${keyPrefix}:${identifier}`;
    const now = Date.now();

    if (!attempts.has(key)) {
      attempts.set(key, []);
    }

    const userAttempts = attempts.get(key);
    
    // Remove old attempts outside the window
    const recentAttempts = userAttempts.filter(
      (timestamp) => now - timestamp < windowMs
    );

    if (recentAttempts.length >= maxAttempts) {
      const oldestAttempt = Math.min(...recentAttempts);
      const resetTime = Math.ceil((oldestAttempt + windowMs - now) / 1000 / 60);

      logger.warn(`Rate limit exceeded for ${identifier}`, {
        key,
        attempts: recentAttempts.length,
      });

      return res.status(429).json({
        success: false,
        message: `Too many attempts. Please try again in ${resetTime} minute(s).`,
        retryAfter: resetTime,
      });
    }

    // Add current attempt
    recentAttempts.push(now);
    attempts.set(key, recentAttempts);

    next();
  };
};

// Clean up old entries periodically (every hour)
setInterval(() => {
  const now = Date.now();
  const oneHour = 60 * 60 * 1000;

  for (const [key, timestamps] of attempts.entries()) {
    const recentAttempts = timestamps.filter(
      (timestamp) => now - timestamp < oneHour
    );
    
    if (recentAttempts.length === 0) {
      attempts.delete(key);
    } else {
      attempts.set(key, recentAttempts);
    }
  }
}, 60 * 60 * 1000);
