import mongoose from "mongoose";
import dotenv from "dotenv";
import CarbonCredit from "./src/models/Listing.js";
import Blog from "./src/models/Blog.js";
import User from "./src/models/userModel.js";

dotenv.config();

const seed = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log("Connected to MongoDB for seeding...");

        let user = await User.findOne({ role: { $in: ["PRODUCER", "BOTH"] } }) || await User.findOne();
        if (!user) {
            console.log("No users found. Creating a dummy user.");
            user = await User.create({
                email: "seed@peergrid.local",
                password: "password123",
                name: "Seed User",
                role: "PRODUCER",
                isVerified: true
            });
        }

        console.log(`Using user ${user.name || user.email} (${user._id}) for seeding.`);

        // Seed Listings
        const listings = [
            {
                title: "Amazon Reforestation Project",
                description: "Preserving the amazon basin by replanting native trees. Verified carbon capture.",
                seller: user._id,
                quantity: 500,
                pricePerCredit: 12.50,
                location: "Brazil",
                projectType: "Reforestation",
                verification: { verifiedBy: "VCS" },
                status: "Available"
            },
            {
                title: "Solar Farm Initiative - Gujarat",
                description: "Large scale solar farm offsetting local coal plants.",
                seller: user._id,
                quantity: 2000,
                pricePerCredit: 8.75,
                location: "India",
                projectType: "Renewable Energy",
                verification: { verifiedBy: "Gold Standard" },
                status: "Available"
            },
            {
                title: "Ocean Blue Carbon - Mangroves",
                description: "Restoring coastal mangrove forests which sequester carbon 4x faster than terrestrial forests.",
                seller: user._id,
                quantity: 150,
                pricePerCredit: 25.00,
                location: "Indonesia",
                projectType: "Blue Carbon",
                verification: { verifiedBy: "CDM" },
                status: "Available"
            },
            {
                title: "Delhi Waste-to-Energy Plant",
                description: "Converting municipal solid waste into renewable electricity.",
                seller: user._id,
                quantity: 800,
                pricePerCredit: 10.00,
                location: "New Delhi, India",
                projectType: "Waste Management",
                verification: { verifiedBy: "Others" },
                status: "Available"
            }
        ];

        // Seed Blogs
        const blogs = [
            {
                slug: "future-of-p2p-energy",
                title: "The Future of Peer-to-Peer Energy Trading",
                category: "Market Trends",
                publishedOn: new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }),
                tags: ["Trading", "Renewable", "P2P"],
                excerpt: "How peer-to-peer networks are decentralizing the grid and giving power back to the consumer.",
                content: "<p>Peer-to-peer (P2P) energy trading is revolutionizing how we think about the power grid. By allowing individuals and businesses to buy and sell excess renewable energy directly with one another, we are moving away from traditional, centralized utilities toward a more democratized system.</p><br><p>This shift not only empowers consumers to monetize their solar panels or wind turbines but also ensures that clean energy is distributed more efficiently across local communities. As blockchain technology and smart contracts mature, we can expect P2P platforms to become standard infrastructure in the green energy economy.</p>",
                author: user._id,
                imageUrl: "https://images.unsplash.com/photo-1466611653911-95081537e5b7?auto=format&fit=crop&q=80&w=1200",
                accent: "from-blue-600 via-indigo-600 to-purple-800"
            },
            {
                slug: "understanding-carbon-credits",
                title: "A Beginner's Guide to Carbon Credits",
                category: "Education",
                publishedOn: new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }),
                tags: ["Carbon Credits", "Guide", "Beginner"],
                excerpt: "Everything you need to know about buying, selling, and retiring carbon credits.",
                content: "<p>Carbon credits are essentially permits that represent the right to emit one ton of carbon dioxide or an equivalent amount of a different greenhouse gas. They are a crucial mechanism in global efforts to mitigate climate change by incentivizing emission reductions.</p><br><h3>How do they work?</h3><p>Organizations that emit less carbon than their allocated limit can sell their excess credits to those who exceed theirs. Alternatively, credits can be generated by projects that proactively remove greenhouse gases from the atmosphere, such as reforestation or building renewable energy facilities.</p>",
                author: user._id,
                imageUrl: "https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?auto=format&fit=crop&q=80&w=1200",
                accent: "from-emerald-500 via-green-600 to-teal-800"
            },
            {
                slug: "top-renewable-projects-2026",
                title: "Top 5 Renewable Energy Projects to Watch",
                category: "Analysis",
                publishedOn: new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }),
                tags: ["Solar", "Wind", "Investments"],
                excerpt: "A deep dive into the most promising green energy initiatives launching this year.",
                content: "<p>This year promises to be a landmark period for renewable energy development. With falling costs for solar photovoltaics and wind turbines, coupled with significant advancements in battery storage technology, massive projects that were once theoretical are now becoming operational.</p><br><p>From massive offshore wind farms in the North Sea to sprawling solar parks across the Thar desert, these mega-projects are proving that 100% renewable grids are not just possible, but economically superior.</p>",
                author: user._id,
                imageUrl: "https://images.unsplash.com/photo-1509391366360-2e959784a276?auto=format&fit=crop&q=80&w=1200",
                accent: "from-amber-500 via-orange-600 to-red-800"
            }
        ];

        let listingCount = 0;
        for (const item of listings) {
            const exists = await CarbonCredit.findOne({ title: item.title });
            if (!exists) {
                await CarbonCredit.create(item);
                listingCount++;
            }
        }
        console.log(`Added ${listingCount} new listings.`);

        let blogCount = 0;
        for (const b of blogs) {
            const exists = await Blog.findOne({ slug: b.slug });
            if (!exists) {
                await Blog.create(b);
                blogCount++;
            }
        }
        console.log(`Added ${blogCount} new blogs.`);

        console.log("Seeding complete.");
        process.exit(0);
    } catch (e) {
        console.error("Error seeding:", e);
        process.exit(1);
    }
}

seed();
