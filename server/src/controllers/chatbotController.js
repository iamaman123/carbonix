import CarbonCredit from "../models/Listing.js";
import transactionsModel from "../models/transactionsModel.js";
import userModel from "../models/userModel.js";
import logger from "../utils/logger.js";

// ─── In-memory cache ───────────────────────────────────────────────────────────
// TTL: 5 minutes. Serves the same data across all users until it expires or is
// invalidated. Avoids firing 7 DB queries on every chatbot open.
let contextCache = null;
let cacheTimestamp = 0;
const CACHE_TTL_MS = 5 * 60 * 1000; // 5 minutes

// Allow other modules (e.g. listing/transaction controllers) to bust the cache
// when data changes meaningfully.
export const bustChatbotCache = () => {
  contextCache = null;
  cacheTimestamp = 0;
};

const isCacheValid = () =>
  contextCache !== null && Date.now() - cacheTimestamp < CACHE_TTL_MS;

// ─── Build context (runs DB queries only when cache is stale) ────────────────
const buildContext = async () => {
  // Fire all independent queries in parallel using Promise.all
  const [
    totalListings,
    availableListings,
    totalTransactions,
    totalUsers,
    sampleListings,
    projectTypes,
    totalCreditsAvailable,
    priceStats,
    certifications,
  ] = await Promise.all([
    CarbonCredit.countDocuments(),
    CarbonCredit.countDocuments({ status: "Available" }),
    transactionsModel.countDocuments(),
    userModel.countDocuments(),
    CarbonCredit.find({ status: "Available" })
      .select("title projectType quantity pricePerCredit location verification")
      .limit(10)
      .lean(),
    CarbonCredit.aggregate([
      { $group: { _id: "$projectType", count: { $sum: 1 } } },
    ]),
    CarbonCredit.aggregate([
      { $match: { status: "Available" } },
      { $group: { _id: null, total: { $sum: "$quantity" } } },
    ]),
    CarbonCredit.aggregate([
      { $match: { status: "Available" } },
      {
        $group: {
          _id: null,
          minPrice: { $min: "$pricePerCredit" },
          maxPrice: { $max: "$pricePerCredit" },
          avgPrice: { $avg: "$pricePerCredit" },
        },
      },
    ]),
    CarbonCredit.aggregate([
      { $group: { _id: "$verification.verifiedBy", count: { $sum: 1 } } },
    ]),
  ]);

  const context = {
    platformInfo: {
      name: "Carbonix",
      description:
        "A blockchain-verified carbon credit trading platform connecting buyers and sellers transparently",
      features: [
        "Blockchain-verified transactions",
        "Real-time carbon footprint calculator",
        "Registry-certified credits (Verra, Gold Standard, ACR)",
        "Live analytics and impact tracking",
        "Multiple payment methods (Card, UPI, Crypto)",
        "Global project mapping",
        "Automated receipt generation",
      ],
    },
    statistics: {
      totalListings,
      availableListings,
      totalTransactions,
      totalUsers,
      totalCreditsAvailable: totalCreditsAvailable[0]?.total || 0,
      priceRange: priceStats[0] || { minPrice: 0, maxPrice: 0, avgPrice: 0 },
    },
    projectTypes: projectTypes.map((pt) => ({ type: pt._id, count: pt.count })),
    certifications: certifications.map((c) => ({
      standard: c._id,
      count: c.count,
    })),
    sampleListings: sampleListings.map((listing) => ({
      title: listing.title,
      type: listing.projectType,
      quantity: listing.quantity,
      price: listing.pricePerCredit,
      location: listing.location,
      certification: listing.verification?.verifiedBy || "N/A",
    })),
  };

  return context;
};

// ─── Route handler ────────────────────────────────────────────────────────────
export const getChatbotContext = async (req, res) => {
  try {
    if (isCacheValid()) {
      return res.status(200).json({
        success: true,
        context: contextCache,
        cached: true,
      });
    }

    const context = await buildContext();

    contextCache = context;
    cacheTimestamp = Date.now();

    logger.info("Chatbot context cache refreshed");

    return res.status(200).json({
      success: true,
      context,
      cached: false,
    });
  } catch (error) {
    logger.error("Error fetching chatbot context:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch chatbot context",
    });
  }
};

// ─── Gemini proxy ─────────────────────────────────────────────────────────────
// Keeps the API key server-side, adds per-question response caching,
// and retries on 429 with exponential backoff.

const GEMINI_CHAT_ENDPOINT =
  "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent";

// Simple LRU-style response cache: question → answer (max 200 entries, 30-min TTL)
const _replyCache = new Map();
const REPLY_CACHE_TTL = 30 * 60 * 1000;
const REPLY_CACHE_MAX = 200;

const getCachedReply = (key) => {
  const entry = _replyCache.get(key);
  if (!entry) return null;
  if (Date.now() - entry.ts > REPLY_CACHE_TTL) {
    _replyCache.delete(key);
    return null;
  }
  return entry.reply;
};

const setCachedReply = (key, reply) => {
  if (_replyCache.size >= REPLY_CACHE_MAX) {
    // Evict oldest entry
    _replyCache.delete(_replyCache.keys().next().value);
  }
  _replyCache.set(key, { reply, ts: Date.now() });
};

const buildSystemPrompt = (ctx) => {
  if (!ctx) return "";
  return `You are Carbonix Assistant, a specialized AI for the Carbonix peer-to-peer carbon credit trading platform.

RULES:
1. Only answer questions about: carbon credits, markets, climate change, the Carbonix platform, buying/selling credits, renewable energy, sustainability.
2. If asked about anything else, say: "I can only help with questions about carbon credits, climate action, and the Carbonix platform."
3. Be concise and professional. Format prices in Indian Rupees (₹).

LIVE PLATFORM DATA:
- Total Listings: ${ctx.statistics.totalListings}
- Available: ${ctx.statistics.availableListings}
- Users: ${ctx.statistics.totalUsers}
- Transactions: ${ctx.statistics.totalTransactions}
- Credits Available: ${ctx.statistics.totalCreditsAvailable} tons
- Price Range: ₹${ctx.statistics.priceRange.minPrice}–₹${ctx.statistics.priceRange.maxPrice} (Avg: ₹${Math.round(ctx.statistics.priceRange.avgPrice)})

PROJECT TYPES:
${ctx.projectTypes.map((pt) => `- ${pt.type}: ${pt.count} projects`).join("\n")}

VERIFICATION STANDARDS:
${ctx.certifications.map((c) => `- ${c.standard}: ${c.count} listings`).join("\n")}

TOP LISTINGS:
${ctx.sampleListings.map((l, i) => `${i + 1}. ${l.title} | ${l.type} | ${l.quantity}t @ ₹${l.price} | ${l.location} | ${l.certification}`).join("\n")}`;
};

export const chatWithGemini = async (req, res) => {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return res.status(500).json({ success: false, message: "Gemini API key not configured on server." });
  }

  const { message, history = [] } = req.body;
  if (!message || typeof message !== "string") {
    return res.status(400).json({ success: false, message: "message is required." });
  }

  // Check reply cache (skip for messages that include previous history context)
  const cacheKey = `${message.trim().toLowerCase().slice(0, 120)}`;
  if (history.length === 0) {
    const cached = getCachedReply(cacheKey);
    if (cached) {
      logger.info(`[Chatbot] Cache hit: "${cacheKey.slice(0, 50)}"`);
      return res.json({ success: true, reply: cached, cached: true });
    }
  }

  // Ensure context is loaded
  if (!contextCache) await buildContext().then((c) => { contextCache = c; cacheTimestamp = Date.now(); }).catch(() => {});

  const systemPrompt = buildSystemPrompt(contextCache);

  const contents = [
    ...history.map((h) => ({ 
      role: h.role, 
      parts: [{ text: h.text || (h.parts && h.parts[0]?.text) || "" }] 
    })),
    { role: "user", parts: [{ text: message }] },
  ];

  // Retry with exponential backoff on 429
  const MAX_RETRIES = 3;
  let lastError = null;

  for (let attempt = 0; attempt < MAX_RETRIES; attempt++) {
    try {
      const response = await fetch(
        `${GEMINI_CHAT_ENDPOINT}?key=${apiKey}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            systemInstruction: {
              parts: [{ text: systemPrompt }]
            },
            contents,
            generationConfig: { temperature: 0.7, maxOutputTokens: 2048 },
          }),
        }
      );

      if (response.status === 429) {
        const delay = 1000 * Math.pow(2, attempt);
        logger.warn(`[Chatbot] Rate limited (429). Retrying in ${delay}ms (attempt ${attempt + 1}/${MAX_RETRIES})`);
        await new Promise((r) => setTimeout(r, delay));
        continue;
      }

      if (!response.ok) {
        const body = await response.json().catch(() => ({}));
        throw new Error(body?.error?.message || `Gemini returned ${response.status}`);
      }

      const data = await response.json();
      const reply =
        data?.candidates?.[0]?.content?.parts?.[0]?.text?.trim() ||
        "I didn't get a response. Please try again.";

      // Cache simple single-turn replies
      if (history.length === 0) setCachedReply(cacheKey, reply);

      return res.json({ success: true, reply, cached: false });
    } catch (err) {
      lastError = err;
      if (attempt < MAX_RETRIES - 1) {
        await new Promise((r) => setTimeout(r, 1000 * Math.pow(2, attempt)));
      }
    }
  }

  logger.error("[Chatbot] All retries failed:", lastError?.message);

  // Friendly message depending on error type
  const isRateLimit = lastError?.message?.includes("429") || lastError?.message?.includes("quota");
  return res.status(isRateLimit ? 429 : 500).json({
    success: false,
    message: isRateLimit
      ? "The assistant is getting too many requests right now. Please wait a few seconds and try again."
      : "Something went wrong contacting the AI. Please try again.",
  });
};
