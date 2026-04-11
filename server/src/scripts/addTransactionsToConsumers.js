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

import User from "../models/userModel.js";
import CarbonCredit from "../models/Listing.js";
import Transaction from "../models/transactionsModel.js";
import connect from "../db/index.js";
import logger from "../utils/logger.js";

const paymentMethods = ["card", "upi", "other"];

const getRandomElement = (arr) => arr[Math.floor(Math.random() * arr.length)];
const getRandomQuantity = () => Math.floor(Math.random() * 100 + 10); // 10-110 credits
const getRandomPastDate = () => {
  const now = new Date();
  const daysAgo = Math.floor(Math.random() * 60) + 1; // 1-60 days ago
  return new Date(now.getTime() - daysAgo * 24 * 60 * 60 * 1000);
};

const addTransactionsToConsumers = async () => {
  try {
    await connect();
    logger.info("Connected to database");

    const consumers = await User.find({
      role: { $in: ["CONSUMER", "PRODUCER"] }
    });
    
    logger.info(`Found ${consumers.length} consumer/both users`);

    if (consumers.length === 0) {
      logger.warn("No consumer users found in database");
      process.exit(0);
    }

    // Get all available listings
    const listings = await CarbonCredit.find({ status: "Available" })
      .populate("seller");

    logger.info(`Found ${listings.length} available listings`);

    if (listings.length === 0) {
      logger.warn("No available listings found. Run addListingsToUsers.js first!");
      process.exit(0);
    }

    let totalTransactionsCreated = 0;

    for (const consumer of consumers) {
      // Create 2-5 transactions per consumer
      const transactionCount = Math.floor(Math.random() * 4) + 2;
      const consumerTransactions = [];

      for (let i = 0; i < transactionCount; i++) {
        // Select a random listing
        const listing = getRandomElement(listings);
        
        // Make sure consumer is not buying from themselves
        if (listing.seller._id.toString() === consumer._id.toString()) {
          continue;
        }

        // Get a random quantity (but not more than available)
        const purchaseQuantity = Math.min(
          getRandomQuantity(),
          listing.quantity
        );

        const totalAmount = purchaseQuantity * listing.pricePerCredit;
        const purchaseDate = getRandomPastDate();

        // Create transaction
        const transaction = await Transaction.create({
          listing: listing._id,
          buyer: consumer._id,
          seller: listing.seller._id,
          quantity: purchaseQuantity,
          pricePerCredit: listing.pricePerCredit,
          totalAmount,
          paymentStatus: "completed",
          paymentMethod: getRandomElement(paymentMethods),
          purchaseDate,
          completedAt: purchaseDate,
        });

        consumerTransactions.push(transaction._id);
        totalTransactionsCreated++;

        // Update seller's transactions
        listing.seller.transactions.push(transaction._id);
        await listing.seller.save();

        if (consumer.role === "PRODUCER") {
          consumer.totalSpents = (consumer.totalSpents || 0) + totalAmount;
        }

        logger.info(
          `Created transaction: ${consumer.name} bought ${purchaseQuantity} credits from ${listing.seller.name} @ $${listing.pricePerCredit}`
        );
      }

      if (consumerTransactions.length > 0) {
        // Add transactions to consumer's transactions array
        consumer.transactions = [
          ...(consumer.transactions || []),
          ...consumerTransactions,
        ];

        // Update totalSpents for consumer
        const consumerStats = await Transaction.aggregate([
          { $match: { buyer: consumer._id } },
          { $group: { _id: null, total: { $sum: "$totalAmount" } } },
        ]);

        if (consumerStats.length > 0) {
          consumer.totalSpents = consumerStats[0].total;
        }

        await consumer.save();

        logger.info(
          `Added ${consumerTransactions.length} transactions to consumer: ${consumer.name} (${consumer.email})`
        );
      }
    }

    logger.info(`✅ Successfully created ${totalTransactionsCreated} transactions!`);
    process.exit(0);
  } catch (error) {
    logger.error("Error adding transactions to consumers:", error);
    process.exit(1);
  }
};

// Run the script
addTransactionsToConsumers();
