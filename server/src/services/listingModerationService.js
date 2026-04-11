import axios from "axios";

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const GEMINI_ENDPOINT =
  "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent";

const MODERATION_CACHE_TTL_MS = 10 * 60 * 1000;
const _moderationCache = new Map();

const getFromCache = (key) => {
  const entry = _moderationCache.get(key);
  if (!entry) return null;
  if (Date.now() - entry.ts > MODERATION_CACHE_TTL_MS) {
    _moderationCache.delete(key);
    return null;
  }
  return entry.data;
};

const setInCache = (key, data) => {
  _moderationCache.set(key, { data, ts: Date.now() });
};

const buildFingerprint = (payload) => {
  const normalized = {
    title: (payload.title || "").trim().toLowerCase(),
    description: (payload.description || "").trim().toLowerCase(),
    quantity: Number(payload.quantity || 0),
    pricePerCredit: Number(payload.pricePerCredit || 0),
    location: (payload.location || "").trim().toLowerCase(),
    projectType: payload.projectType || "",
    verifiedBy: payload.verification?.verifiedBy || "",
    certificateUrl: (payload.verification?.certificateUrl || "").trim().toLowerCase(),
  };
  return JSON.stringify(normalized);
};

const runLocalGuards = (payload) => {
  const reasons = [];

  const title = (payload.title || "").trim();
  const description = (payload.description || "").trim();
  const price = Number(payload.pricePerCredit || 0);
  const quantity = Number(payload.quantity || 0);

  if (title.length < 3) reasons.push("Title is too short.");
  if (description.length < 10) {
    reasons.push("Project summary is too short — use at least 10 characters describing the project.");
  }
  if (quantity <= 0) reasons.push("Quantity must be greater than 0.");
  if (price <= 0) reasons.push("Price per credit must be greater than 0.");

  if (price > 50000) {
    reasons.push("Price per credit appears unusually high and requires review.");
  }

  if (reasons.length > 0) {
    return {
      isValid: false,
      riskScore: 95,
      riskLevel: "high",
      reasons,
      source: "local-guard",
      confidence: 0.98,
      checkedAt: new Date(),
    };
  }

  return null;
};

const parseGeminiJson = (text) => {
  if (!text) return null;
  const match = text.match(/\{[\s\S]*\}/);
  if (!match) return null;

  try {
    return JSON.parse(match[0]);
  } catch {
    return null;
  }
};

export const validateListingAuthenticity = async (listingPayload) => {
  const localCheck = runLocalGuards(listingPayload);
  if (localCheck) return localCheck;

  const fingerprint = buildFingerprint(listingPayload);
  const cached = getFromCache(fingerprint);
  if (cached) return { ...cached, cached: true };

  // Allow listings when Gemini is not configured (e.g. local / demo); local guards already ran.
  if (!GEMINI_API_KEY) {
    return {
      isValid: true,
      riskScore: 45,
      riskLevel: "medium",
      reasons: [],
      errorFields: [],
      source: "no-gemini",
      confidence: 0.5,
      checkedAt: new Date(),
    };
  }

    const prompt = `You are a strict anti-fraud validator for carbon credit marketplace listings.
  Review the listing and decide if it is genuine, internally consistent, and safe to publish.

LISTING:
${JSON.stringify(listingPayload, null, 2)}

Reject if there are signs of fraud, misleading claims, nonsense content, contradictory details,
impossible values, verification mismatch, spam-like text, or suspicious patterns.

  Important certificate-url rule:
  - Treat verification.certificateUrl as a weak supporting signal only.
  - Do NOT reject a listing because the certificate URL does not exactly match a registry domain.
  - Do NOT perform deep URL or registry matching.
  - If the URL looks plausible, nearby, partial, or vendor-hosted, accept it as long as the rest of the listing is consistent.
  - Only flag the certificate URL if it is clearly malformed, empty in a suspicious context, or obviously fake.

Return ONLY JSON in this exact structure:
{
  "isValid": true_or_false,
  "riskScore": 0_to_100,
  "riskLevel": "low|medium|high",
  "confidence": 0_to_1,
  "reasons": ["short reason 1", "short reason 2"],
  "errorFields": ["title", "description", "verification.certificateUrl"]
}`;

  try {
    const response = await axios.post(
      `${GEMINI_ENDPOINT}?key=${GEMINI_API_KEY}`,
      { contents: [{ parts: [{ text: prompt }] }] },
      { timeout: 30000 }
    );

    const responseText = response.data?.candidates?.[0]?.content?.parts?.[0]?.text;
    const parsed = parseGeminiJson(responseText);

    if (!parsed) {
      return {
        isValid: false,
        riskScore: 90,
        riskLevel: "high",
        confidence: 0.7,
        reasons: ["Validation engine returned an unreadable response. Please try again."],
        source: "gemini",
        checkedAt: new Date(),
      };
    }

    const result = {
      isValid: Boolean(parsed.isValid),
      riskScore: Math.max(0, Math.min(100, Number(parsed.riskScore ?? 50))),
      riskLevel: ["low", "medium", "high"].includes(parsed.riskLevel)
        ? parsed.riskLevel
        : "medium",
      confidence: Math.max(0, Math.min(1, Number(parsed.confidence ?? 0.5))),
      reasons: Array.isArray(parsed.reasons) && parsed.reasons.length
        ? parsed.reasons.slice(0, 5).map((r) => String(r).slice(0, 240))
        : ["No detailed reason returned by validator."],
      errorFields: Array.isArray(parsed.errorFields)
        ? parsed.errorFields.slice(0, 10).map((f) => String(f))
        : [],
      source: "gemini",
      checkedAt: new Date(),
    };

    setInCache(fingerprint, result);
    return result;
  } catch (error) {
    return {
      isValid: false,
      riskScore: 95,
      riskLevel: "high",
      confidence: 0.8,
      reasons: [
        `Validation request failed: ${error.response?.data?.error?.message || error.message}`,
      ],
      source: "gemini",
      checkedAt: new Date(),
    };
  }
};
