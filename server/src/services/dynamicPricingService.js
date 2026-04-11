import axios from "axios";
import CarbonCredit from "../models/Listing.js";
import EcoProduct from "../models/EcoProduct.js";
import transactionsModel from "../models/transactionsModel.js";
import userModel from "../models/userModel.js";
import DynamicPrice from "../models/DynamicPrice.js";

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const GEMINI_ENDPOINT =
  "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent";

// ─── In-memory pricing cache ───────────────────────────────────────────────────
// Avoids Gemini calls for the same listing on every page load.
// TTL: 30 minutes. Key: listingId string.
const _priceCache = new Map();
const PRICE_CACHE_TTL = 30 * 60 * 1000; // 30 min

const getPriceFromCache = (id) => {
  const entry = _priceCache.get(id);
  if (!entry) return null;
  if (Date.now() - entry.ts > PRICE_CACHE_TTL) { _priceCache.delete(id); return null; }
  return entry.data;
};

const setPriceInCache = (id, data) => {
  _priceCache.set(id, { data, ts: Date.now() });
};

// ─── In-flight deduplication ───────────────────────────────────────────────────
// If two concurrent requests ask for the same listing, share one Gemini call.
const _inFlight = new Map();

// ─── DB staleness threshold ────────────────────────────────────────────────────
// Reuse the DB price if it was calculated within the last 6 hours.
const DB_STALENESS_MS = 6 * 60 * 60 * 1000; // 6 hours

const isDbPriceFresh = (lastUpdatedAt) =>
  lastUpdatedAt && Date.now() - new Date(lastUpdatedAt).getTime() < DB_STALENESS_MS;

// ─── Market metrics (IMPROVED logic) ─────────────────────────────────────────
const calculateMarketMetrics = async (listing, isProduct = false) => {
  try {
    const projectType = isProduct ? listing.category : listing.projectType;
    const basePrice = isProduct ? listing.price : listing.pricePerCredit;

    const [similarItems, totalSupply, itemTransactions, allTransactions, seller] = await Promise.all([
      (isProduct ? EcoProduct : CarbonCredit).countDocuments({
        [isProduct ? "category" : "projectType"]: projectType,
        status: isProduct ? "Active" : "Available",
      }),
      (isProduct ? EcoProduct : CarbonCredit).aggregate([
        {
          $match: {
            [isProduct ? "category" : "projectType"]: projectType,
            status: isProduct ? "Active" : "Available",
          },
        },
        { $group: { _id: null, total: { $sum: isProduct ? "$stock" : "$quantity" } } },
      ]),
      // Item's own recent sales
      transactionsModel
        .find({
          ...(isProduct ? {} : { listing: listing._id }),
          purchaseDate: { $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) },
        })
        .select("pricePerCredit quantity")
        .sort({ purchaseDate: -1 })
        .limit(20),
      // Platform-wide recent sales (proxy for general market health)
      transactionsModel.countDocuments({
        purchaseDate: { $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) },
      }),
      userModel.findById(listing.seller || listing.addedBy).select("ratings").lean(),
    ]);

    const sellerRating = seller?.ratings?.average || 3.5;
    const supplyQuantity = totalSupply[0]?.total || 0;

    // SUPPLY SCORE (0-100): High score means high supply on the market (drives price DOWN)
    // Based on how many similar listings exist and total available volume.
    // Example: 20 similar items or 5000 units = score of ~90.
    const supplyScore = Math.floor(Math.min(100, Math.max(10, (similarItems * 2.5) + (supplyQuantity / 50))));

    // DEMAND SCORE (0-100): High score means high buyer interest (drives price UP)
    // Built from: Seller reputation (40%), item's local sales velocity (40%), global platform trend (20%)
    const sellerPoints = (sellerRating / 5) * 40;
    const localSalesPoints = Math.min(itemTransactions.length * 8, 40);
    const globalTrendPoints = Math.min(allTransactions * 2, 20);
    const demandScore = Math.floor(sellerPoints + localSalesPoints + globalTrendPoints);

    // Calculate recent average price paid to find trends
    const avgRecentPrice =
      itemTransactions.length > 0
        ? itemTransactions.reduce((sum, t) => sum + t.pricePerCredit, 0) / itemTransactions.length
        : basePrice;
        
    const trendFactor = avgRecentPrice / basePrice;
    const ageInDays = (Date.now() - new Date(listing.createdAt)) / (24 * 60 * 60 * 1000);
    
    // Older items that haven't sold decay in value (down to max 80% penalty over 100 days)
    const timeDecay = Math.max(0.8, 1 - ageInDays / 100);

    return {
      demandScore,
      supplyScore,
      sellerRating,
      recentTransactionCount: itemTransactions.length,
      avgRecentPrice,
      trendFactor,
      timeDecay,
      similarItemsCount: similarItems,
      totalSupplyQuantity: supplyQuantity,
    };
  } catch (error) {
    console.error("Error calculating market metrics:", error);
    return null;
  }
};

// ─── Single-listing Gemini call (with backoff) ─────────────────────────────────
const getAIRecommendedPrice = async (listing, metrics, isProduct = false) => {
  const MAX_RETRIES = 3;
  const BASE_DELAY = 1500;
  const basePrice = isProduct ? listing.price : listing.pricePerCredit;
  const projectType = isProduct ? listing.category : listing.projectType;

  if (!GEMINI_API_KEY) {
    console.warn("GEMINI_API_KEY not configured");
    return basePrice;
  }

  const prompt = `You are an expert in dynamic pricing for carbon credits and eco-products.

PRODUCT INFO:
- Type: ${isProduct ? "Eco Product" : "Carbon Credit Listing"}
- Category: ${projectType}
- Base Price: ₹${basePrice}
- ${isProduct ? `Stock: ${listing.stock}` : `Quantity: ${listing.quantity}`}
- Seller Rating: ${metrics.sellerRating}/5

MARKET METRICS:
- Demand Score: ${metrics.demandScore}/100
- Supply Score: ${metrics.supplyScore}/100
- Similar Items: ${metrics.similarItemsCount}
- Recent Avg Price: ₹${metrics.avgRecentPrice.toFixed(2)}
- Market Trend: ${metrics.trendFactor > 1 ? "UPWARD" : "DOWNWARD"} (${(metrics.trendFactor * 100).toFixed(1)}%)
- Age Decay: ${(metrics.timeDecay * 100).toFixed(1)}%
- Recent Sales: ${metrics.recentTransactionCount} (last 30 days)

Return ONLY valid JSON:
{"recommendedPrice":<number>,"priceMultiplier":<0.5-2>,"marketTemperature":"<cold|cool|moderate|warm|hot>","demandFactor":<0-1>,"supplyFactor":<0-1>,"rateFactor":<0-1>,"verificationFactor":<0-1>,"trendFactor":<0-1>,"reasoning":"<max 100 chars>"}`;

  for (let attempt = 0; attempt < MAX_RETRIES; attempt++) {
    try {
      const response = await axios.post(
        `${GEMINI_ENDPOINT}?key=${GEMINI_API_KEY}`,
        { contents: [{ parts: [{ text: prompt }] }] },
        { timeout: 30000 }
      );

      const responseText = response.data?.candidates?.[0]?.content?.parts?.[0]?.text;
      if (!responseText) return basePrice;

      const jsonMatch = responseText.match(/\{[\s\S]*\}/);
      if (!jsonMatch) return basePrice;

      const result = JSON.parse(jsonMatch[0]);
      return {
        recommendedPrice: Math.max(basePrice * 0.5, Math.min(result.recommendedPrice, basePrice * 2)),
        priceMultiplier: result.priceMultiplier,
        marketTemperature: result.marketTemperature,
        factors: {
          demandFactor: result.demandFactor,
          supplyFactor: result.supplyFactor,
          rateFactor: result.rateFactor,
          verificationFactor: result.verificationFactor,
          trendFactor: result.trendFactor,
          timeDecayFactor: metrics.timeDecay,
        },
        reasoning: result.reasoning,
      };
    } catch (error) {
      const isRateLimit = error.response?.status === 429;
      const delay = BASE_DELAY * Math.pow(2, attempt);
      if (isRateLimit && attempt < MAX_RETRIES - 1) {
        console.warn(`[AI Pricing] Rate limited. Retrying in ${delay}ms (${attempt + 1}/${MAX_RETRIES})`);
        await new Promise((r) => setTimeout(r, delay));
        continue;
      }
      console.error(`[AI Pricing] Failed for ${listing._id}:`, error.message);
      break;
    }
  }
  return basePrice;
};

// ─── BATCH Gemini call — prices up to 5 listings in ONE API request ────────────
const getBatchAIPrices = async (items) => {
  // items: [{ listing, metrics, isProduct }]
  if (!GEMINI_API_KEY || items.length === 0) return [];

  const snippets = items.map((item, i) => {
    const { listing, metrics, isProduct } = item;
    const basePrice = isProduct ? listing.price : listing.pricePerCredit;
    return `ITEM ${i + 1} (id: ${listing._id}):
- Category: ${isProduct ? listing.category : listing.projectType}
- BasePrice: ₹${basePrice}
- Demand: ${metrics.demandScore}/100, Supply: ${metrics.supplyScore}/100
- AvgRecentPrice: ₹${metrics.avgRecentPrice.toFixed(2)}
- Trend: ${metrics.trendFactor > 1 ? "UP" : "DOWN"}, Decay: ${(metrics.timeDecay * 100).toFixed(1)}%`;
  }).join("\n\n");

  const prompt = `You are an expert dynamic pricing AI for carbon credits and eco-products.
Analyze each item and return JSON array of exactly ${items.length} objects in the same order:
[{"id":"<id>","recommendedPrice":<n>,"priceMultiplier":<0.5-2>,"marketTemperature":"<cold|cool|moderate|warm|hot>","demandFactor":<0-1>,"supplyFactor":<0-1>,"rateFactor":<0-1>,"verificationFactor":<0-1>,"trendFactor":<0-1>,"reasoning":"<max 80 chars>"}]

Rules: recommendedPrice must be between 0.5x–2x base price. Reply ONLY with the JSON array.

${snippets}`;

  const MAX_RETRIES = 3;
  for (let attempt = 0; attempt < MAX_RETRIES; attempt++) {
    try {
      const response = await axios.post(
        `${GEMINI_ENDPOINT}?key=${GEMINI_API_KEY}`,
        { contents: [{ parts: [{ text: prompt }] }] },
        { timeout: 45000 }
      );

      const text = response.data?.candidates?.[0]?.content?.parts?.[0]?.text || "";
      const jsonMatch = text.match(/\[[\s\S]*\]/);
      if (!jsonMatch) return [];

      return JSON.parse(jsonMatch[0]);
    } catch (error) {
      const isRateLimit = error.response?.status === 429;
      const delay = 2000 * Math.pow(2, attempt);
      if (isRateLimit && attempt < MAX_RETRIES - 1) {
        console.warn(`[Batch Pricing] Rate limited. Retrying in ${delay}ms`);
        await new Promise((r) => setTimeout(r, delay));
        continue;
      }
      console.error("[Batch Pricing] Failed:", error.message);
      return [];
    }
  }
  return [];
};

// ─── Core: calculate dynamic price for one item ────────────────────────────────
export const calculateDynamicPrice = async (listingId, isProduct = false) => {
  const id = listingId.toString();

  // 1. Check in-memory cache first
  const cached = getPriceFromCache(id);
  if (cached) {
    console.log(`[AI Pricing] Memory cache hit for ${id}`);
    return { success: true, data: cached, cached: true };
  }

  // 2. Deduplicate concurrent requests for the same ID
  if (_inFlight.has(id)) {
    console.log(`[AI Pricing] Deduplicating in-flight request for ${id}`);
    return _inFlight.get(id);
  }

  const promise = (async () => {
    try {
      const model = isProduct ? EcoProduct : CarbonCredit;
      const populateField = isProduct ? "addedBy" : "seller";
      const listing = await model.findById(listingId).populate(populateField, "ratings");

      if (!listing) return { success: false, message: "Listing not found" };

      // 3. Check DB for a fresh price (skip Gemini entirely if recent)
      const existingPrice = await DynamicPrice.findOne(
        isProduct ? { product: listingId } : { listing: listingId }
      ).lean();

      if (existingPrice && isDbPriceFresh(existingPrice.lastUpdatedAt)) {
        const data = buildResponseData(existingPrice, existingPrice.basePrice);
        setPriceInCache(id, data);
        console.log(`[AI Pricing] DB cache hit for ${id} (age: ${Math.round((Date.now() - new Date(existingPrice.lastUpdatedAt)) / 60000)}min)`);
        return { success: true, data, cached: true };
      }

      // 4. Calculate fresh metrics + call Gemini
      const metrics = await calculateMarketMetrics(listing, isProduct);
      if (!metrics) return { success: false, message: "Could not calculate market metrics" };

      const aiRecommendation = await getAIRecommendedPrice(listing, metrics, isProduct);

      const basePrice = isProduct ? listing.price : listing.pricePerCredit;
      const aiData = normalizeAIResult(aiRecommendation, basePrice, metrics);

      // 5. Persist to DB
      await DynamicPrice.findOneAndUpdate(
        { [isProduct ? "product" : "listing"]: listingId },
        {
          [isProduct ? "product" : "listing"]: listingId,
          basePrice,
          ...aiData,
          lastUpdatedAt: new Date(),
          $push: { priceHistory: { price: aiData.recommendedPrice, timestamp: new Date(), reason: aiData.reasoning } },
        },
        { upsert: true, new: true }
      );

      const data = buildResponseData(aiData, basePrice, metrics);
      setPriceInCache(id, data);
      return { success: true, data };
    } finally {
      _inFlight.delete(id);
    }
  })();

  _inFlight.set(id, promise);
  return promise;
};

// ─── Get stored price (prefers DB if fresh, else calculates) ──────────────────
export const getDynamicPrice = async (listingId, isProduct = false) => {
  const id = listingId.toString();

  // In-memory cache hit
  const cached = getPriceFromCache(id);
  if (cached) return { success: true, data: cached, cached: true };

  try {
    const query = isProduct ? { product: listingId } : { listing: listingId };
    const dynamicPrice = await DynamicPrice.findOne(query).lean();

    // Self-heal GET requests: if record is missing or stale, compute a fresh one.
    if (!dynamicPrice || !isDbPriceFresh(dynamicPrice.lastUpdatedAt)) {
      return calculateDynamicPrice(listingId, isProduct);
    }

    const data = {
      basePrice: dynamicPrice.basePrice,
      recommendedPrice: dynamicPrice.recommendedPrice,
      priceMultiplier: dynamicPrice.priceMultiplier,
      currentMarketTemperature: dynamicPrice.marketTemperature,
      demandScore: dynamicPrice.demandScore,
      supplyScore: dynamicPrice.supplyScore,
      savings: dynamicPrice.basePrice - dynamicPrice.recommendedPrice,
      factors: dynamicPrice.factors,
      lastUpdatedAt: dynamicPrice.lastUpdatedAt,
      priceHistory: dynamicPrice.priceHistory.slice(-10),
    };

    // Cache in memory for next time
    setPriceInCache(id, data);
    return { success: true, data };
  } catch (error) {
    console.error("Error fetching dynamic price:", error);
    return { success: false, message: error.message };
  }
};

// ─── Batch update all listings (OPTIMIZED) ─────────────────────────────────────
// - Skips listings updated within the last 1 hour
// - Groups up to 5 listings per Gemini call
// - 2-second throttle between batches to respect RPM
export const updateAllDynamicPrices = async () => {
  try {
    const STALE_THRESHOLD_MS = 60 * 60 * 1000; // 1 hour
    const BATCH_SIZE = 5;
    const BATCH_DELAY_MS = 2000;

    const staleAfter = new Date(Date.now() - STALE_THRESHOLD_MS);

    // Only fetch listings that don't have a fresh price
    const [allListings, allProducts] = await Promise.all([
      CarbonCredit.find({ status: "Available" }).select("_id projectType pricePerCredit quantity createdAt seller").lean(),
      EcoProduct.find({ status: "Active" }).select("_id category price stock createdAt addedBy").lean(),
    ]);

    // Find which ones already have fresh prices in DB (skip them)
    const [freshListingIds, freshProductIds] = await Promise.all([
      DynamicPrice.find({ listing: { $in: allListings.map((l) => l._id) }, lastUpdatedAt: { $gte: staleAfter } })
        .select("listing").lean().then((docs) => new Set(docs.map((d) => d.listing.toString()))),
      DynamicPrice.find({ product: { $in: allProducts.map((p) => p._id) }, lastUpdatedAt: { $gte: staleAfter } })
        .select("product").lean().then((docs) => new Set(docs.map((d) => d.product.toString()))),
    ]);

    const staleListings = allListings.filter((l) => !freshListingIds.has(l._id.toString()));
    const staleProducts = allProducts.filter((p) => !freshProductIds.has(p._id.toString()));

    console.log(`[Batch Pricing] ${staleListings.length} listings and ${staleProducts.length} products need updates (skipping ${freshListingIds.size + freshProductIds.size} fresh)`);

    const results = { listings: 0, products: 0, errors: 0, skipped: freshListingIds.size + freshProductIds.size };

    const processItems = async (items, isProduct) => {
      // Prefetch metrics for all items in parallel (DB queries, not Gemini)
      const withMetrics = (
        await Promise.all(
          items.map(async (listing) => {
            const metrics = await calculateMarketMetrics(listing, isProduct).catch(() => null);
            return metrics ? { listing, metrics, isProduct } : null;
          })
        )
      ).filter(Boolean);

      // Chunk into batches of BATCH_SIZE
      for (let i = 0; i < withMetrics.length; i += BATCH_SIZE) {
        const batch = withMetrics.slice(i, i + BATCH_SIZE);

        console.log(`[Batch Pricing] Calling Gemini for ${batch.length} ${isProduct ? "products" : "listings"} (batch ${Math.floor(i / BATCH_SIZE) + 1})`);

        // ONE Gemini call for the whole batch
        const batchResults = await getBatchAIPrices(batch);

        for (let j = 0; j < batch.length; j++) {
          const { listing, metrics, isProduct: isProd } = batch[j];
          const aiResult = batchResults[j];
          const basePrice = isProd ? listing.price : listing.pricePerCredit;

          try {
            const aiData = aiResult
              ? {
                  recommendedPrice: Math.max(basePrice * 0.5, Math.min(aiResult.recommendedPrice, basePrice * 2)),
                  priceMultiplier: aiResult.priceMultiplier,
                  marketTemperature: aiResult.marketTemperature,
                  factors: {
                    demandFactor: aiResult.demandFactor,
                    supplyFactor: aiResult.supplyFactor,
                    rateFactor: aiResult.rateFactor,
                    verificationFactor: aiResult.verificationFactor,
                    trendFactor: aiResult.trendFactor,
                    timeDecayFactor: metrics.timeDecay,
                  },
                  reasoning: aiResult.reasoning,
                }
              : { recommendedPrice: basePrice, priceMultiplier: 1.0, marketTemperature: "moderate", factors: {}, reasoning: "Fallback" };

            await DynamicPrice.findOneAndUpdate(
              { [isProd ? "product" : "listing"]: listing._id },
              {
                [isProd ? "product" : "listing"]: listing._id,
                basePrice,
                ...aiData,
                demandScore: metrics.demandScore,
                supplyScore: metrics.supplyScore,
                lastUpdatedAt: new Date(),
                $push: { priceHistory: { price: aiData.recommendedPrice, timestamp: new Date(), reason: aiData.reasoning } },
              },
              { upsert: true, new: true }
            );

            // Update in-memory cache too
            setPriceInCache(listing._id.toString(), buildResponseData(aiData, basePrice, metrics));

            if (isProd) results.products++;
            else results.listings++;
          } catch (err) {
            console.error(`[Batch Pricing] Failed to save ${listing._id}:`, err.message);
            results.errors++;
          }
        }

        // Throttle between batches to respect Gemini RPM
        if (i + BATCH_SIZE < withMetrics.length) {
          await new Promise((r) => setTimeout(r, BATCH_DELAY_MS));
        }
      }
    };

    await processItems(staleListings, false);
    await processItems(staleProducts, true);

    console.log(`[Batch Pricing] Done — ${results.listings} listings, ${results.products} products, ${results.errors} errors, ${results.skipped} skipped`);

    return {
      success: true,
      message: `Updated ${results.listings} listings and ${results.products} products (${results.skipped} already fresh, ${results.errors} errors)`,
      results,
    };
  } catch (error) {
    console.error("Error batch updating dynamic prices:", error);
    return { success: false, message: error.message };
  }
};

// ─── Market insights (unchanged) ──────────────────────────────────────────────
export const getMarketInsights = async () => {
  try {
    const dynamicPrices = await DynamicPrice.aggregate([
      {
        $group: {
          _id: null,
          avgPriceChange: { $avg: { $subtract: ["$recommendedPrice", "$basePrice"] } },
          avgDemandScore: { $avg: "$demandScore" },
          avgSupplyScore: { $avg: "$supplyScore" },
          temperatureDistribution: { $push: "$marketTemperature" },
          priceMultiplierMin: { $min: "$priceMultiplier" },
          priceMultiplierMax: { $max: "$priceMultiplier" },
          priceMultiplierAvg: { $avg: "$priceMultiplier" },
        },
      },
    ]);

    if (!dynamicPrices.length) return { success: false, message: "No market data available" };

    const data = dynamicPrices[0];
    const tempDist = data.temperatureDistribution.reduce((acc, temp) => {
      acc[temp] = (acc[temp] || 0) + 1;
      return acc;
    }, {});

    return {
      success: true,
      data: {
        averagePriceChange: data.avgPriceChange,
        averageDemandScore: data.avgDemandScore,
        averageSupplyScore: data.avgSupplyScore,
        temperatureDistribution: tempDist,
        priceMultiplierRange: {
          min: data.priceMultiplierMin,
          max: data.priceMultiplierMax,
          avg: data.priceMultiplierAvg,
        },
      },
    };
  } catch (error) {
    console.error("Error fetching market insights:", error);
    return { success: false, message: error.message };
  }
};

// ─── Helpers ──────────────────────────────────────────────────────────────────
const normalizeAIResult = (aiRecommendation, basePrice, metrics) => {
  if (typeof aiRecommendation === "number") {
    return {
      recommendedPrice: aiRecommendation,
      priceMultiplier: 1.0,
      marketTemperature: "moderate",
      factors: { demandFactor: 0.5, supplyFactor: 0.5, rateFactor: 0.5, verificationFactor: 0.5, trendFactor: 1.0, timeDecayFactor: metrics.timeDecay },
      reasoning: "Fallback: base price (API unavailable)",
    };
  }
  return aiRecommendation;
};

const buildResponseData = (aiData, basePrice, metrics) => ({
  basePrice,
  recommendedPrice: aiData.recommendedPrice,
  priceMultiplier: aiData.priceMultiplier,
  currentMarketTemperature: aiData.marketTemperature || aiData.currentMarketTemperature,
  savings: basePrice - aiData.recommendedPrice,
  demandScore: metrics?.demandScore ?? aiData.demandScore,
  supplyScore: metrics?.supplyScore ?? aiData.supplyScore,
  sellerRating: metrics?.sellerRating,
  recentSales: metrics?.recentTransactionCount,
  factors: aiData.factors,
  reasoning: aiData.reasoning,
  lastUpdatedAt: aiData.lastUpdatedAt || new Date(),
});
