import crypto from "crypto";
import Razorpay from "razorpay";
import config from "../config/index.js";

/**
 * When true, checkout skips Razorpay order creation and uses POST .../complete-mock-checkout instead.
 * - RAZORPAY_MOCK=true|1|yes → always mock (even if keys exist; for UI testing)
 * - RAZORPAY_MOCK=false|0 → never mock (503 if keys missing)
 * - unset → mock if key id or secret is missing (demo / local / Vercel without keys)
 */
export function isRazorpayCheckoutMocked() {
  const v = process.env.RAZORPAY_MOCK?.trim().toLowerCase();
  if (v === "false" || v === "0") return false;
  if (v === "true" || v === "1" || v === "yes") return true;
  const hasKeys = Boolean(config.razorpay.keyId && config.razorpay.keySecret);
  return !hasKeys;
}

let _client = null;
let _checked = false;

/**
 * Razorpay SDK instance when RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET are set.
 * Otherwise null so the server can boot without payment keys.
 */
export function getRazorpay() {
  if (_checked) return _client;
  _checked = true;
  const keyId = config.razorpay.keyId;
  const keySecret = config.razorpay.keySecret;
  if (!keyId || !keySecret) {
    _client = null;
    return null;
  }
  _client = new Razorpay({ key_id: keyId, key_secret: keySecret });
  return _client;
}

/**
 * Razorpay's Node SDK rejects with a plain object `{ statusCode, error }`, not `Error`,
 * so `catch (e) { e.message }` is usually undefined. Use this for logs and API responses.
 */
export function getRazorpayErrorMessage(err) {
  if (err == null) return "";
  if (typeof err.message === "string" && err.message) return err.message;
  const inner = err.error;
  if (inner && typeof inner === "object") {
    if (typeof inner.description === "string" && inner.description) return inner.description;
    if (typeof inner.reason === "string" && inner.reason) return inner.reason;
  }
  if (typeof err.description === "string") return err.description;
  try {
    const s = JSON.stringify(inner ?? err);
    return s !== "{}" ? s : "Razorpay request failed";
  } catch {
    return "Razorpay request failed";
  }
}

/** True when Razorpay API rejected key_id / key_secret (wrong, mismatched, or not from same mode). */
export function isRazorpayAuthFailure(err) {
  if (err?.statusCode === 401) return true;
  const m = getRazorpayErrorMessage(err).toLowerCase();
  return m.includes("authentication") && m.includes("failed");
}

export function verifyRazorpayPaymentSignature(orderId, paymentId, signature) {
  const secret = config.razorpay.keySecret;
  if (!secret || !orderId || !paymentId || !signature) return false;
  const body = `${orderId}|${paymentId}`;
  const expected = crypto.createHmac("sha256", secret).update(body).digest("hex");
  if (expected.length !== signature.length) return false;
  try {
    return crypto.timingSafeEqual(Buffer.from(expected, "hex"), Buffer.from(signature, "hex"));
  } catch {
    return false;
  }
}
