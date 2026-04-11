import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import fs from "fs";

// Load environment variables - try multiple paths
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Try to find and load .env from server root
const envPaths = [
  path.resolve(__dirname, "../../.env"),  // When run from scripts folder
  path.resolve(process.cwd(), ".env"),     // When run via npm from server root
];

let envLoaded = false;
for (const envPath of envPaths) {
  if (fs.existsSync(envPath)) {
    dotenv.config({ path: envPath });
    console.log(`✓ Loaded .env from: ${envPath}`);
    envLoaded = true;
    break;
  }
}

if (!envLoaded) {
  console.warn("⚠ .env file not found in expected locations");
  console.warn("Tried:", envPaths);
}

// Verify MONGODB_URI is loaded
if (!process.env.MONGODB_URI) {
  console.error("❌ ERROR: MONGODB_URI environment variable is not set!");
  console.error("Make sure your .env file contains MONGODB_URI");
  process.exit(1);
}

import User from "../models/userModel.js";
import CarbonCredit from "../models/Listing.js";
import connect from "../db/index.js";
import logger from "../utils/logger.js";

const projectTypes = [
  "Reforestation",
  "Renewable Energy",
  "Waste Management",
  "Agriculture",
  "Blue Carbon",
  "Others",
];

const verifiers = ["VCS", "Gold Standard", "CDM", "Others"];

const locations = [
  "California, USA",
  "Brazil",
  "India",
  "Kenya",
  "Indonesia",
  "Australia",
  "Germany",
  "Norway",
  "Costa Rica",
  "Philippines",
];

const titles = {
  "Reforestation": [
    "Amazon Rainforest Carbon Credits",
    "Mangrove Restoration Project",
    "Tropical Forest Preservation",
    "Native Tree Planting Initiative",
  ],
  "Renewable Energy": [
    "Solar Farm Energy Credits",
    "Wind Energy Generation",
    "Hydroelectric Power Project",
    "Geothermal Energy Credits",
    "Biogas Energy Initiative",
  ],
  "Waste Management": [
    "Landfill Gas Capture Project",
    "Waste-to-Energy Facility",
    "Recycling Center Credits",
    "Composting Program",
  ],
  "Agriculture": [
    "Regenerative Agriculture Credits",
    "Methane Reduction in Livestock",
    "Sustainable Farming Initiative",
    "Crop Carbon Sequestration",
  ],
  "Blue Carbon": [
    "Seagrass Restoration Project",
    "Mangrove Carbon Credits",
    "Kelp Forest Protection",
    "Coastal Wetland Restoration",
  ],
  "Others": [
    "Carbon Offset Credits",
    "General Sustainability Project",
    "Green Building Credits",
    "Methane Reduction Initiative",
  ],
};

const descriptions = {
  "Reforestation":
    "High-quality carbon credits from verified reforestation projects. Each credit represents 1 metric ton of CO2 equivalent sequestered through forest conservation and tree planting.",
  "Renewable Energy":
    "Clean energy carbon credits from renewable energy projects. Credits represent emissions reductions from solar, wind, hydro, and other renewable sources.",
  "Waste Management":
    "Carbon credits from waste management and waste-to-energy projects. Reducing methane emissions from landfills and processing waste sustainably.",
  "Agriculture":
    "Agricultural carbon credits from sustainable farming and soil conservation. Includes livestock methane reduction and regenerative agriculture practices.",
  "Blue Carbon":
    "High-value carbon credits from coastal and marine ecosystem protection. Seagrass, mangroves, and ocean-based carbon sequestration.",
  "Others":
    "General carbon offset credits from verified sustainability projects. Supporting various climate action initiatives globally.",
};

const getRandomElement = (arr) => arr[Math.floor(Math.random() * arr.length)];

const getRandomPrice = () => Math.round((Math.random() * 40 + 10) * 100) / 100; // $10-$50
const getRandomQuantity = () => Math.floor(Math.random() * 900 + 100); // 100-1000 credits

const addListingsToUsers = async () => {
  try {
    await connect();
    logger.info("Connected to database");

    // Get all users except admin
    const users = await User.find({ role: { $ne: "admin" } });
    logger.info(`Found ${users.length} non-admin users`);

    if (users.length === 0) {
      logger.warn("No non-admin users found in database");
      process.exit(0);
    }

    let totalListingsCreated = 0;

    for (const user of users) {
      // Only create listings for PRODUCER
      if (user.role !== "PRODUCER") {
        logger.info(`Skipping ${user.email} (role: ${user.role})`);
        continue;
      }

      // Create 2-4 listings per user
      const listingCount = Math.floor(Math.random() * 3) + 2;
      const userListings = [];

      for (let i = 0; i < listingCount; i++) {
        const projectType = getRandomElement(projectTypes);
        const title = `${getRandomElement(titles[projectType])} - Batch ${i + 1}`;
        const quantity = getRandomQuantity();
        const pricePerCredit = getRandomPrice();

        const listing = await CarbonCredit.create({
          title,
          description: descriptions[projectType],
          seller: user._id,
          quantity,
          pricePerCredit,
          location: getRandomElement(locations),
          projectType,
          verification: {
            verifiedBy: getRandomElement(verifiers),
            certificateUrl: `https://example.com/cert/${user._id}`
          },
          status: "Available",
        });

        userListings.push(listing._id);
        totalListingsCreated++;

        logger.info(
          `Created listing: ${listing.title} (${listing.quantity} credits @ $${listing.pricePerCredit})`
        );
      }

      // Add listings to user's posted array
      user.posted = [...(user.posted || []), ...userListings];
      await user.save();

      logger.info(
        `Added ${userListings.length} listings to user: ${user.name} (${user.email})`
      );
    }

    logger.info(`✅ Successfully created ${totalListingsCreated} listings!`);
    process.exit(0);
  } catch (error) {
    logger.error("Error adding listings to users:", error);
    process.exit(1);
  }
};

// Run the script
addListingsToUsers();
