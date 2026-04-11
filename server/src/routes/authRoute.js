import express from "express";
import passport from "../config/passport.js";
import config from "../config/index.js";
import {
  register,
  verifyOTP,
  login,
  profile,
  updateProfile,
  forgotPassword,
  resetPassword,
  googleAuthCallback,
} from "../controllers/authController.js";
import authMiddleware from "../middlewares/authMiddleware.js";
import { validate } from "../middlewares/validateMiddleware.js";
import {
  registerSchema,
  loginSchema,
  verifyOTPSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
} from "../validators/authValidator.js";
import { rateLimiter } from "../middlewares/rateLimitMiddleware.js";
import logger from "../utils/logger.js";

const router = express.Router();

const OAUTH_STATE_MAX_AGE_MS = 15 * 60 * 1000;

/** Encode signup role in OAuth `state` so it survives server restarts (no in-memory map). */
function encodeOAuthState(role) {
  return Buffer.from(JSON.stringify({ role, ts: Date.now() }), "utf8").toString(
    "base64url",
  );
}

function decodeOAuthState(stateParam) {
  if (typeof stateParam !== "string" || !stateParam.length) return "CONSUMER";
  try {
    const o = JSON.parse(Buffer.from(stateParam, "base64url").toString("utf8"));
    if (!o.ts || Date.now() - o.ts > OAUTH_STATE_MAX_AGE_MS) return "CONSUMER";
    if (o.role === "PRODUCER" || o.role === "CONSUMER") return o.role;
  } catch {
    /* ignore */
  }
  return "CONSUMER";
}

// ─── Email / Password Auth (disabled — Google only) ───────────────────────────
router.post("/register", validate(registerSchema), rateLimiter(5, 15 * 60 * 1000, "register"), register);
router.post("/verify-otp", validate(verifyOTPSchema), rateLimiter(3, 15 * 60 * 1000, "verify-otp"), verifyOTP);
router.post("/login", validate(loginSchema), rateLimiter(5, 15 * 60 * 1000, "login"), login);
router.post("/forgot-password", validate(forgotPasswordSchema), rateLimiter(3, 15 * 60 * 1000, "forgot-password"), forgotPassword);
router.post("/reset-password", validate(resetPasswordSchema), rateLimiter(3, 15 * 60 * 1000, "reset-password"), resetPassword);
router.get("/profile", authMiddleware, profile);
router.patch("/profile", authMiddleware, updateProfile);

// ─── Google OAuth ─────────────────────────────────────────────────────────────
/** Dev helper: confirms env (no secrets). Callback URL must be added in Google Console exactly. */
router.get("/oauth-config", (req, res) => {
  const id = config.google.clientId || "";
  const cb = config.google.callbackUrl || "";
  res.json({
    apiPort: config.port,
    /** OAuth uses callbackUrl only; apiPort is whatever PORT is in env (often 8000 locally). */
    deployedOnVercel: Boolean(process.env.VERCEL),
    callbackUrlAddThisInGoogleConsole: cb,
    /** Public identifier — same string as in Google Cloud → Credentials → your Web client (not a secret). */
    clientId: id,
    googleCloudWhereToAddIt:
      "Credentials → OAuth 2.0 Client IDs → this Web client → Authorized redirect URIs (not JavaScript origins). Paste callbackUrlAddThisInGoogleConsole exactly, Save, wait up to ~15 minutes.",
    hasClientId: Boolean(id),
    hasClientSecret: Boolean(config.google.clientSecret),
  });
});

// Query: ?role=PRODUCER | CONSUMER (default CONSUMER). New users get this role.
router.get("/google", (req, res, next) => {
  if (!config.google.clientId || !config.google.clientSecret) {
    const clientBase = (process.env.CLIENT_URL?.trim() || config.clientUrl).replace(
      /\/+$/,
      "",
    );
    return res.redirect(`${clientBase}/login?error=google_not_configured`);
  }

  const roleParam = (req.query.role || "CONSUMER").toString().toUpperCase();
  const role = ["PRODUCER", "CONSUMER"].includes(roleParam) ? roleParam : "CONSUMER";
  const state = encodeOAuthState(role);

  logger.info(`Google OAuth: redirect to consent (role=${role}, callback=${config.google.callbackUrl})`);

  passport.authenticate("google", {
    scope: ["profile", "email"],
    session: false,
    state,
  })(req, res, next);
});

router.get("/google/callback", (req, res, next) => {
  const clientBase = (process.env.CLIENT_URL?.trim() || config.clientUrl).replace(
    /\/+$/,
    "",
  );

  if (!config.google.clientId || !config.google.clientSecret) {
    return res.redirect(`${clientBase}/login?error=google_not_configured`);
  }

  if (req.query?.error) {
    logger.warn(
      `Google OAuth query error=${req.query.error}: ${req.query.error_description || ""}`,
    );
    const reason = encodeURIComponent(String(req.query.error));
    return res.redirect(`${clientBase}/login?error=google_auth_failed&reason=${reason}`);
  }

  const stateParam = typeof req.query.state === "string" ? req.query.state : "";
  req.oauthSignupRole = decodeOAuthState(stateParam);

  passport.authenticate("google", { session: false }, (err, user) => {
    if (err) {
      logger.warn("Google passport authenticate error:", err?.message || err);
      return res.redirect(`${clientBase}/login?error=google_auth_failed`);
    }
    if (!user) {
      return res.redirect(`${clientBase}/login?error=google_auth_failed`);
    }
    req.user = user;
    next();
  })(req, res, next);
}, googleAuthCallback);

export default router;
