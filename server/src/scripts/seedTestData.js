/**
 * Adds demo data without wiping the database: 3 carbon listings, 3 eco products, 3 blogs.
 * Re-running removes previous rows with the same demo markers and recreates them.
 *
 * Usage (from server/):  npm run seed:test
 * Requires MONGODB_URI in server/.env (load via config when connect runs).
 */
import connect from "../db/index.js";
import User from "../models/userModel.js";
import CarbonCredit from "../models/Listing.js";
import EcoProduct from "../models/EcoProduct.js";
import Blog from "../models/Blog.js";
import logger from "../utils/logger.js";

const DEMO_LISTING_TITLE_PREFIX = "[Carbonix demo]";
const DEMO_PRODUCT_NAME_PREFIX = "[Carbonix demo]";
const DEMO_BLOG_SLUG_PREFIX = "carbonix-demo-";

async function ensureProducer() {
  let u = await User.findOne({ role: "PRODUCER" });
  if (u) return { user: u, createdDemoProducer: false };
  u = await User.findOne({ email: "carbonix-demo-producer@example.local" });
  if (u) return { user: u, createdDemoProducer: false };
  logger.info("Creating demo PRODUCER carbonix-demo-producer@example.local (password Demo@12345)");
  const created = await User.create({
    email: "carbonix-demo-producer@example.local",
    password: "Demo@12345",
    name: "Demo Producer",
    company: "Carbonix Demo Energy",
    phone: "+91-5550100999",
    role: "PRODUCER",
    totalCredits: 0,
    totalSpents: 0,
    isVerified: true,
    isActive: true,
  });
  return { user: created, createdDemoProducer: true };
}

async function ensureBlogAuthor() {
  const admin = await User.findOne({ role: "admin" });
  if (admin) return admin;
  const { user } = await ensureProducer();
  return user;
}

async function ensureEcoProductOwner() {
  const admin = await User.findOne({ role: "admin" });
  if (admin) return admin;
  const { user } = await ensureProducer();
  return user;
}

const listingTemplates = [
  {
    title: `${DEMO_LISTING_TITLE_PREFIX} Wind farm — Rajasthan`,
    description:
      "Demo listing: 100 MW wind generation displacing grid coal. Verified offsets suitable for corporate net-zero reporting.",
    projectType: "Renewable Energy",
    location: "Jaisalmer, Rajasthan, India",
    quantity: 500,
    pricePerCredit: 18,
    verification: { verifiedBy: "Gold Standard", certificateUrl: "https://registry.goldstandard.org/" },
  },
  {
    title: `${DEMO_LISTING_TITLE_PREFIX} Reforestation — Western Ghats`,
    description:
      "Demo listing: Native species replanting on degraded slopes. Co-benefits for biodiversity and watershed protection.",
    projectType: "Reforestation",
    location: "Karnataka, India",
    quantity: 400,
    pricePerCredit: 22,
    verification: { verifiedBy: "VCS", certificateUrl: "https://registry.verra.org/" },
  },
  {
    title: `${DEMO_LISTING_TITLE_PREFIX} Biogas — rural Haryana`,
    description:
      "Demo listing: Farm waste and manure to clean cooking gas and organic fertilizer for rural households.",
    projectType: "Waste Management",
    location: "Rohtak, Haryana, India",
    quantity: 350,
    pricePerCredit: 16,
    verification: { verifiedBy: "CDM", certificateUrl: "https://cdm.unfccc.int/" },
  },
];

const productTemplates = [
  {
    name: `${DEMO_PRODUCT_NAME_PREFIX} Solar LED desk lamp`,
    description: "USB-chargeable LED lamp with small solar panel — demo product for the eco marketplace.",
    category: "Solar Equipment",
    price: 1299,
    stock: 40,
    imageUrl: "https://images.unsplash.com/photo-1620916297397-a4a5402a3c6c?w=800&q=80",
    ecoRating: 4,
    tags: ["Solar", "Lighting", "Demo"],
    specifications: "Battery 1200mAh, warm white LED, foldable panel",
    carbonEmissionSaved: 800,
    status: "Active",
  },
  {
    name: `${DEMO_PRODUCT_NAME_PREFIX} Bamboo water bottle`,
    description: "Stainless steel interior with bamboo shell — demo sustainable drinkware.",
    category: "Organic & Natural",
    price: 899,
    stock: 75,
    imageUrl: "https://images.unsplash.com/photo-1602143407151-7111542de6e8?w=800&q=80",
    ecoRating: 5,
    tags: ["Bamboo", "Hydration", "Demo"],
    specifications: "500ml, BPA-free liner",
    carbonEmissionSaved: 120,
    status: "Active",
  },
  {
    name: `${DEMO_PRODUCT_NAME_PREFIX} Recycled tote bag`,
    description: "Heavy tote made from recycled PET — demo listing for recycled goods.",
    category: "Recycled Products",
    price: 649,
    stock: 120,
    imageUrl: "https://images.unsplash.com/photo-1591567167664-07d472cdef9a?w=800&q=80",
    ecoRating: 4,
    tags: ["Recycled", "Bag", "Demo"],
    specifications: "40cm × 42cm, 10kg load",
    carbonEmissionSaved: 900,
    status: "Active",
  },
];

const blogTemplates = [
  {
    slug: `${DEMO_BLOG_SLUG_PREFIX}try-carbon-credits`,
    title: "Try carbon credits on Carbonix (demo article)",
    category: "Education",
    readTime: "4 min read",
    publishedOn: "Apr 1, 2026",
    tags: ["Demo", "Carbon Credits", "How it works"],
    excerpt: "A short walkthrough of browsing verified listings and what each field means.",
    content: `This is **demo blog content** for local and staging environments.

Carbon credits on Carbonix represent one tonne of CO₂ equivalent avoided or removed, backed by project documentation.

Use filters for project type, location, and registry to narrow listings. Minimum checkout amounts may apply for test payments.

Happy testing!`,
    imageUrl: "https://images.unsplash.com/photo-1473341304170-971dccb5ac1e?w=1200&h=600&fit=crop",
    status: "published",
  },
  {
    slug: `${DEMO_BLOG_SLUG_PREFIX}eco-marketplace-tips`,
    title: "Eco marketplace tips (demo article)",
    category: "Sustainability",
    readTime: "3 min read",
    publishedOn: "Apr 5, 2026",
    tags: ["Demo", "Shopping", "Eco"],
    excerpt: "How to explore solar gear, recycled goods, and water-saving products in the demo catalog.",
    content: `**Demo content** for the eco storefront.

Products are grouped by category. Check stock and ratings before purchase. Test checkouts use Razorpay test keys when configured.

Remove demo articles in production if you prefer a clean blog.`,
    imageUrl: "https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?w=1200&h=600&fit=crop",
    status: "published",
  },
  {
    slug: `${DEMO_BLOG_SLUG_PREFIX}payments-testing`,
    title: "Testing payments safely (demo article)",
    category: "Market Trends",
    readTime: "5 min read",
    publishedOn: "Apr 10, 2026",
    tags: ["Demo", "Razorpay", "Test mode"],
    excerpt: "Use Razorpay test keys and Vercel environment variables for end-to-end checkout tests.",
    content: `**Demo-only guidance**

1. Add \`RAZORPAY_KEY_ID\` and \`RAZORPAY_KEY_SECRET\` from Razorpay **Test** mode.
2. On Vercel, set the same variables on the **API** project and redeploy.
3. Use card/UPI test methods from the Razorpay docs.

Never commit live secrets to the repository.`,
    imageUrl: "https://images.unsplash.com/photo-1563013544-824ae1b704d3?w=1200&h=600&fit=crop",
    status: "published",
  },
];

async function seedTestData() {
  try {
    if (!process.env.MONGODB_URI?.trim()) {
      logger.error("MONGODB_URI is not set. Add it to server/.env");
      process.exit(1);
    }

    await connect();

    await CarbonCredit.deleteMany({ title: /^\[Carbonix demo\]/ });
    await EcoProduct.deleteMany({ name: /^\[Carbonix demo\]/ });
    await Blog.deleteMany({ slug: /^carbonix-demo-/ });

    const { user: producer, createdDemoProducer } = await ensureProducer();
    const ecoOwner = await ensureEcoProductOwner();
    const blogAuthor = await ensureBlogAuthor();

    const listings = await CarbonCredit.create(
      listingTemplates.map((t) => ({
        ...t,
        seller: producer._id,
        status: "Available",
      })),
    );

    await User.findByIdAndUpdate(producer._id, {
      $addToSet: { posted: { $each: listings.map((l) => l._id) } },
    });

    const products = await EcoProduct.create(
      productTemplates.map((p) => ({
        ...p,
        addedBy: ecoOwner._id,
      })),
    );

    const blogs = await Blog.create(
      blogTemplates.map((b) => ({
        ...b,
        author: blogAuthor._id,
      })),
    );

    logger.info("✅ Demo seed complete (safe re-run: replaces only demo-marked rows)");
    logger.info(`   Listings: ${listings.length}  |  Eco products: ${products.length}  |  Blogs: ${blogs.length}`);
    logger.info(`   Listing seller: ${producer.email}`);
    if (createdDemoProducer) {
      logger.info("   Demo producer login: carbonix-demo-producer@example.local / Demo@12345");
    }
    process.exit(0);
  } catch (err) {
    logger.error("seedTestData failed:", err);
    process.exit(1);
  }
}

seedTestData();
