import User from "../models/userModel.js";
import CarbonCredit from "../models/Listing.js";
import Transaction from "../models/transactionsModel.js";
import connect from "../db/index.js";
import logger from "../utils/logger.js";
import mongoose from "mongoose";

const seedData = async () => {
  try {
    // Connect to database
    await connect();

    // Drop the database to avoid case sensitivity issues
    logger.info("Dropping existing database...");
    await mongoose.connection.db.dropDatabase();
    logger.info("Database dropped successfully");

    // Clear existing data
    logger.info("Creating fresh data...");
    await User.deleteMany({});
    await CarbonCredit.deleteMany({});
    await Transaction.deleteMany({});
    logger.info("Ready to create new data");

    // Create users
    logger.info("Creating users...");
    const users = await User.create([
      {
        email: "admin@example.local",
        password: "Admin@123",
        name: "Demo Admin",
        company: "Carbonix Admin",
        phone: "+1-555-0100",
        role: "admin",
        totalCredits: 0,
        totalSpents: 0,
        isVerified: true,
        isActive: true,
      },
      {
        email: "seller.demo@example.com",
        password: "User@123",
        name: "Morgan Lee",
        company: "Green Energy Solutions",
        phone: "+1-555-0101",
        role: "PRODUCER",
        totalCredits: 5000,
        totalSpents: 7500,
        isVerified: true,
        isActive: true,
      },
      {
        email: "buyer.demo@example.com",
        password: "User@123",
        name: "Riley Chen",
        company: "EcoTech Industries",
        phone: "+1-555-0102",
        role: "CONSUMER",
        totalCredits: 3000,
        totalSpents: 15000,
        isVerified: true,
        isActive: true,
      },
      {
        email: "seller1@example.com",
        password: "User@456",
        name: "Rajesh Mehta",
        company: "Solar Power Corp",
        phone: "+1-555-0103",
        role: "PRODUCER",
        totalCredits: 10000,
        totalSpents: 0,
        isVerified: true,
        isActive: true,
      },
      {
        email: "buyer1@example.com",
        password: "User@456",
        name: "Alex Park",
        company: "Tech Innovations Ltd",
        phone: "+1-555-0104",
        role: "CONSUMER",
        totalCredits: 2000,
        totalSpents: 25000,
        isVerified: true,
        isActive: true,
      },
      {
        email: "user1@example.com",
        password: "User@789",
        name: "Amit Patel",
        company: "GreenTech Solutions",
        phone: "+1-555-0105",
        role: "CONSUMER",
        totalCredits: 3000,
        totalSpents: 5000,
        isVerified: true,
        isActive: true,
      },
    ]);

    logger.info(`${users.length} users created successfully`);

    // Create carbon credit listings
    logger.info("Creating carbon credit listings...");
    const listings = await CarbonCredit.create([
      {
        title: "Reforestation Project - Amazon Rainforest",
        description: "Large-scale reforestation initiative in the Amazon rainforest, planting native tree species to restore biodiversity and sequester carbon. This project has restored over 1000 hectares of degraded land.",
        seller: users[1]._id, // seller.demo@example.com
        quantity: 5000,
        pricePerCredit: 15,
        location: "Amazon Basin, Brazil",
        projectType: "Reforestation",
        verification: {
          verifiedBy: "VCS",
          certificateUrl: "https://registry.verra.org/app/projectDetail/VCS/1234",
        },
        status: "Available",
      },
      {
        title: "Wind Energy Farm - Rajasthan",
        description: "100 MW wind energy project generating clean electricity and displacing fossil fuel-based power generation. The project consists of 50 wind turbines and provides power to over 100,000 homes.",
        seller: users[3]._id, // seller1@example.com
        quantity: 8000,
        pricePerCredit: 12,
        location: "Jaisalmer, Rajasthan, India",
        projectType: "Renewable Energy",
        verification: {
          verifiedBy: "Gold Standard",
          certificateUrl: "https://registry.goldstandard.org/projects/details/5678",
        },
        status: "Available",
      },
      {
        title: "Solar Power Installation - Gujarat",
        description: "50 MW solar photovoltaic power plant reducing CO2 emissions by replacing coal-based electricity. This project features state-of-the-art solar panels with tracking systems.",
        seller: users[3]._id, // seller1@example.com
        quantity: 6000,
        pricePerCredit: 13,
        location: "Kutch, Gujarat, India",
        projectType: "Renewable Energy",
        verification: {
          verifiedBy: "CDM",
          certificateUrl: "https://cdm.unfccc.int/Projects/DB/9012",
        },
        status: "Available",
      },
      {
        title: "Waste-to-Energy Project - Mumbai",
        description: "Converting municipal solid waste into clean energy through advanced gasification technology. The project processes 500 tons of waste daily and generates 10 MW of electricity.",
        seller: users[1]._id, // seller.demo@example.com
        quantity: 4000,
        pricePerCredit: 14,
        location: "Mumbai, Maharashtra, India",
        projectType: "Waste Management",
        verification: {
          verifiedBy: "VCS",
          certificateUrl: "https://registry.verra.org/app/projectDetail/VCS/3456",
        },
        status: "Available",
      },
      {
        title: "Sustainable Agriculture - Punjab",
        description: "Implementing sustainable agricultural practices including no-till farming, crop rotation, and organic farming methods across 5000 acres of farmland. Reduces emissions from fertilizer use and enhances soil carbon sequestration.",
        seller: users[5]._id, // user1@example.com
        quantity: 3000,
        pricePerCredit: 11,
        location: "Ludhiana, Punjab, India",
        projectType: "Agriculture",
        verification: {
          verifiedBy: "Gold Standard",
          certificateUrl: "https://registry.goldstandard.org/projects/details/7890",
        },
        status: "Available",
      },
      {
        title: "Mangrove Restoration - Kerala",
        description: "Restoring mangrove ecosystems along the Kerala coast to protect against coastal erosion and sequester carbon. This blue carbon project has restored 500 hectares of mangrove forest.",
        seller: users[5]._id, // user1@example.com
        quantity: 2500,
        pricePerCredit: 16,
        location: "Kannur, Kerala, India",
        projectType: "Blue Carbon",
        verification: {
          verifiedBy: "VCS",
          certificateUrl: "https://registry.verra.org/app/projectDetail/VCS/1122",
        },
        status: "Available",
      },
      {
        title: "Biogas Plant - Rural Haryana",
        description: "Community biogas project converting agricultural waste and animal manure into clean cooking gas and organic fertilizer. Serves 500 rural households.",
        seller: users[1]._id, // seller.demo@example.com
        quantity: 1500,
        pricePerCredit: 10,
        location: "Rohtak, Haryana, India",
        projectType: "Waste Management",
        verification: {
          verifiedBy: "Gold Standard",
          certificateUrl: "https://registry.goldstandard.org/projects/details/3344",
        },
        status: "Available",
      },
      {
        title: "Hydroelectric Power - Uttarakhand",
        description: "Small-scale run-of-river hydroelectric project generating 25 MW of clean electricity without large dams. Minimal environmental impact with maximum carbon offset.",
        seller: users[3]._id, // seller1@example.com
        quantity: 7000,
        pricePerCredit: 14,
        location: "Tehri, Uttarakhand, India",
        projectType: "Renewable Energy",
        verification: {
          verifiedBy: "CDM",
          certificateUrl: "https://cdm.unfccc.int/Projects/DB/5566",
        },
        status: "Available",
      },
      {
        title: "Forest Conservation - Western Ghats",
        description: "REDD+ project protecting 10,000 hectares of pristine forest in the Western Ghats biodiversity hotspot. Prevents deforestation and preserves endangered species habitat.",
        seller: users[5]._id, // user1@example.com
        quantity: 9000,
        pricePerCredit: 17,
        location: "Western Ghats, Karnataka, India",
        projectType: "Reforestation",
        verification: {
          verifiedBy: "VCS",
          certificateUrl: "https://registry.verra.org/app/projectDetail/VCS/7788",
        },
        status: "Sold",
      },
      {
        title: "Energy Efficiency - Industrial Park",
        description: "Industrial energy efficiency project implementing LED lighting, efficient motors, and waste heat recovery systems across 50 manufacturing units.",
        seller: users[1]._id, // seller.demo@example.com
        quantity: 3500,
        pricePerCredit: 12,
        location: "Chennai, Tamil Nadu, India",
        projectType: "Others",
        verification: {
          verifiedBy: "Gold Standard",
          certificateUrl: "https://registry.goldstandard.org/projects/details/9900",
        },
        status: "Pending",
      },
    ]);

    logger.info(`${listings.length} carbon credit listings created successfully`);

    // Update user posted listings
    await User.findByIdAndUpdate(users[1]._id, {
      posted: [listings[0]._id, listings[3]._id, listings[6]._id, listings[9]._id],
    });
    await User.findByIdAndUpdate(users[3]._id, {
      posted: [listings[1]._id, listings[2]._id, listings[7]._id],
    });
    await User.findByIdAndUpdate(users[5]._id, {
      posted: [listings[4]._id, listings[5]._id, listings[8]._id],
    });

    // Create transactions
    logger.info("Creating transactions...");
    const transactions = await Transaction.create([
      {
        listing: listings[8]._id, // Forest Conservation - Sold
        buyer: users[2]._id, // buyer.demo@example.com
        seller: users[5]._id, // user1@example.com
        quantity: 1000,
        pricePerCredit: 17,
        totalAmount: 17000,
        paymentStatus: "completed",
        paymentMethod: "card",
        transactionHash: "0x1a2b3c4d5e6f7g8h9i0j",
        purchaseDate: new Date("2024-11-01"),
        completedAt: new Date("2024-11-01"),
      },
      {
        listing: listings[1]._id, // Wind Energy Farm
        buyer: users[4]._id, // buyer1@example.com
        seller: users[3]._id, // seller1@example.com
        quantity: 2000,
        pricePerCredit: 12,
        totalAmount: 24000,
        paymentStatus: "completed",
        paymentMethod: "upi",
        transactionHash: "0x2b3c4d5e6f7g8h9i0j1k",
        purchaseDate: new Date("2024-11-10"),
        completedAt: new Date("2024-11-10"),
      },
      {
        listing: listings[0]._id, // Reforestation Project
        buyer: users[5]._id, // user1@example.com
        seller: users[1]._id, // seller.demo@example.com
        quantity: 500,
        pricePerCredit: 15,
        totalAmount: 7500,
        paymentStatus: "completed",
        paymentMethod: "card",
        transactionHash: "0x3c4d5e6f7g8h9i0j1k2l",
        purchaseDate: new Date("2024-11-15"),
        completedAt: new Date("2024-11-15"),
      },
      {
        listing: listings[9]._id, // Energy Efficiency - Pending
        buyer: users[2]._id, // buyer.demo@example.com
        seller: users[1]._id, // seller.demo@example.com
        quantity: 800,
        pricePerCredit: 12,
        totalAmount: 9600,
        paymentStatus: "pending",
        paymentMethod: "other",
        transactionHash: "",
        purchaseDate: new Date("2024-11-20"),
      },
      {
        listing: listings[2]._id, // Solar Power Installation
        buyer: users[4]._id, // buyer1@example.com
        seller: users[3]._id, // seller1@example.com
        quantity: 1500,
        pricePerCredit: 13,
        totalAmount: 19500,
        paymentStatus: "completed",
        paymentMethod: "card",
        transactionHash: "0x4d5e6f7g8h9i0j1k2l3m",
        purchaseDate: new Date("2024-11-18"),
        completedAt: new Date("2024-11-18"),
      },
    ]);

    logger.info(`${transactions.length} transactions created successfully`);

    // Update user transactions
    await User.findByIdAndUpdate(users[2]._id, {
      transactions: [transactions[0]._id, transactions[3]._id],
    });
    await User.findByIdAndUpdate(users[4]._id, {
      transactions: [transactions[1]._id, transactions[4]._id],
    });
    await User.findByIdAndUpdate(users[5]._id, {
      transactions: [transactions[2]._id],
    });

    // Update listing quantities based on completed transactions
    await CarbonCredit.findByIdAndUpdate(listings[8]._id, {
      quantity: 8000, // Sold 1000 from 9000
      status: "Sold",
    });
    await CarbonCredit.findByIdAndUpdate(listings[1]._id, {
      quantity: 6000, // Sold 2000 from 8000
    });
    await CarbonCredit.findByIdAndUpdate(listings[0]._id, {
      quantity: 4500, // Sold 500 from 5000
    });
    await CarbonCredit.findByIdAndUpdate(listings[2]._id, {
      quantity: 4500, // Sold 1500 from 6000
    });

    logger.info("✅ Database seeded successfully!");
    logger.info("\n📊 Summary:");
    logger.info(`   - ${users.length} users created`);
    logger.info(`   - ${listings.length} carbon credit listings created`);
    logger.info(`   - ${transactions.length} transactions created`);
    logger.info("\n👤 User Credentials:");
    logger.info("   1. Admin: admin@example.local / Admin@123");
    logger.info("   2. User: seller.demo@example.com / User@123");
    logger.info("   3. User: buyer.demo@example.com / User@123");
    logger.info("   4. User: seller1@example.com / User@456");
    logger.info("   5. User: buyer1@example.com / User@456");
    logger.info("   6. User: user1@example.com / User@789");

    process.exit(0);
  } catch (error) {
    logger.error("Error seeding database:", error);
    process.exit(1);
  }
};

seedData();
