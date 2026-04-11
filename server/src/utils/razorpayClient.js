import crypto from "crypto";
import Razorpay from "razorpay";
import config from "../config/index.js";

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
