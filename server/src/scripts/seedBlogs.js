import Blog from "../models/Blog.js";
import User from "../models/userModel.js";
import connect from "../db/index.js";
import logger from "../utils/logger.js";

const blogPostsData = [
  {
    slug: "understanding-carbon-credit-market",
    title: "Understanding the Carbon Credit Market in 2026",
    category: "Market Trends",
    readTime: "6 min read",
    publishedOn: "Feb 15, 2026",
    tags: ["Carbon Credits", "Marketplace", "Compliance"],
    excerpt:
      "Explore how transparent marketplaces and verified registries are reshaping the carbon economy for businesses of every size.",
    content: `Carbon markets have matured beyond voluntary experimentation. New disclosure mandates in the EU, UK, and India are forcing companies to prove the integrity of every offset they purchase.

Platforms like Carbonix respond by pairing vetted project documentation with live production metrics, so buyers understand the story behind every tonne of CO₂.

Key Features:
• Registry-backed verification that surfaces certification status before checkout
• Real-time pricing that reflects supply, demand, and policy movements
• Marketplace filters that help teams shortlist projects aligned with SDG goals

Transparency no longer stops at publishing a price. Sustainability teams expect immutable audit trails, risk scoring, and automated alerts when a project's eligibility changes.

Carbonix integrates satellite imagery, methodology updates, and third-party audits into a unified dashboard so compliance officers can sign off with confidence.`,
    imageUrl:
      "https://images.unsplash.com/photo-1473341304170-971dccb5ac1e?w=1200&h=600&fit=crop",
    status: "published",
  },
  {
    slug: "sustainable-energy-future",
    title: "Building a Sustainable Energy Future",
    category: "Sustainability",
    readTime: "5 min read",
    publishedOn: "Feb 10, 2026",
    tags: ["Renewable Energy", "Sustainability", "Future"],
    excerpt:
      "Discover the key strategies and technologies driving the transition to clean, renewable energy sources worldwide.",
    content: `The global energy landscape is undergoing a fundamental transformation. Renewable energy sources like solar, wind, and hydroelectric power are no longer alternative options—they're becoming the primary choice for new energy infrastructure.

The Economics of Renewable Energy:
• Solar panel costs have dropped 90% in the last decade
• Wind energy is now the cheapest source of electricity in many regions
• Battery storage technology is making renewable sources more reliable

This shift is driven by both environmental necessity and economic opportunity. Countries and corporations are setting aggressive carbon neutral targets, creating massive market demand for clean energy solutions.

The challenge now is scaling these technologies rapidly enough to meet climate goals. Innovation in grid management, energy storage, and smart distribution systems will be crucial to making this transition successful.`,
    imageUrl:
      "https://images.unsplash.com/photo-1509391366360-2e959784a276?w=1200&h=600&fit=crop",
    status: "published",
  },
  {
    slug: "carbon-offsetting-explained",
    title: "Carbon Offsetting: A Complete Guide",
    category: "Education",
    readTime: "7 min read",
    publishedOn: "Feb 5, 2026",
    tags: ["Carbon Offset", "Climate Action", "Guide"],
    excerpt:
      "Learn everything you need to know about carbon offsets, how they work, and how to choose quality offset projects.",
    content: `Carbon offsetting allows individuals and organizations to compensate for their emissions by funding projects that reduce or remove greenhouse gases elsewhere.

How Carbon Offsets Work:
• Calculate your carbon footprint from activities like travel, energy use, and production
• Purchase carbon credits equivalent to your emissions
• Credits fund verified projects that reduce or capture CO₂

Types of Offset Projects:
- Renewable Energy: Wind farms, solar installations
- Reforestation: Tree planting and forest conservation
- Carbon Capture: Direct air capture technology
- Energy Efficiency: Upgrading facilities to reduce consumption

Quality Matters: Not all offset projects are created equal. Look for certifications from recognized standards like Gold Standard, VCS (Verified Carbon Standard), or CDM (Clean Development Mechanism).

When choosing offset projects, consider additionality (would the project happen anyway?), permanence (how long will the carbon stay captured?), and co-benefits (does it help local communities?).`,
    imageUrl:
      "https://images.unsplash.com/photo-1497435334941-8c899ee9e8e9?w=1200&h=600&fit=crop",
    status: "published",
  },
];

const seedBlogs = async () => {
  try {
    // Connect to database
    await connect();
    logger.info("Connected to database for blog seeding");

    // Find an admin user to be the author
    const adminUser = await User.findOne({ role: "admin" });
    if (!adminUser) {
      logger.error("No admin user found. Please create an admin user first.");
      process.exit(1);
    }

    logger.info(`Using admin user: ${adminUser.email} as blog author`);

    // Clear existing blogs
    await Blog.deleteMany({});
    logger.info("Cleared existing blogs");

    // Create blogs with admin as author
    const blogsToCreate = blogPostsData.map((blog) => ({
      ...blog,
      author: adminUser._id,
    }));

    const createdBlogs = await Blog.create(blogsToCreate);
    logger.info(`Successfully created ${createdBlogs.length} blog posts`);

    createdBlogs.forEach((blog) => {
      logger.info(`  - ${blog.title} (slug: ${blog.slug})`);
    });

    logger.info("Blog seeding completed successfully!");
    process.exit(0);
  } catch (error) {
    logger.error("Error seeding blogs:", error);
    process.exit(1);
  }
};

// Run the seed function
seedBlogs();
