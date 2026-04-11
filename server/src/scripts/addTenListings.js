import "dotenv/config";
import mongoose from "mongoose";
import CarbonCredit from "../models/Listing.js";
import User from "../models/userModel.js";

const sellerAId = "699576b1cd7075c9c03778d3";
const sellerBId = "699576d2cd7075c9c03778d7";

async function run() {
  await mongoose.connect(process.env.MONGODB_URI);

  const sellerA = new mongoose.Types.ObjectId(sellerAId);
  const sellerB = new mongoose.Types.ObjectId(sellerBId);
  const now = new Date();

  const docs = [
    {
      title: "Community Solar Park - Rajasthan",
      description:
        "A 75 MW community solar project delivering clean power to rural microgrids while reducing dependence on diesel generators. The project includes local workforce training and long-term panel maintenance commitments.",
      seller: sellerA,
      quantity: 4200,
      pricePerCredit: 13,
      location: "Bikaner, Rajasthan, India",
      projectType: "Renewable Energy",
      verification: {
        verifiedBy: "Gold Standard",
        certificateUrl: "https://registry.goldstandard.org/projects/details/CRB-2101",
      },
      status: "Available",
      createdAt: now,
      updatedAt: now,
    },
    {
      title: "Agroforestry Regeneration Cluster",
      description:
        "Mixed-species agroforestry initiative across smallholder farms that increases soil carbon, improves biodiversity corridors, and stabilizes farm income through diversified crops.",
      seller: sellerB,
      quantity: 3600,
      pricePerCredit: 12,
      location: "Nashik, Maharashtra, India",
      projectType: "Reforestation",
      verification: {
        verifiedBy: "VCS",
        certificateUrl: "https://registry.verra.org/app/projectDetail/VCS/CRB-2102",
      },
      status: "Available",
      createdAt: now,
      updatedAt: now,
    },
    {
      title: "Landfill Methane Capture Program",
      description:
        "Municipal landfill methane capture and flaring project with phased conversion to electricity generation, preventing high-GWP methane from reaching the atmosphere.",
      seller: sellerA,
      quantity: 5100,
      pricePerCredit: 14,
      location: "Indore, Madhya Pradesh, India",
      projectType: "Waste Management",
      verification: {
        verifiedBy: "CDM",
        certificateUrl: "https://cdm.unfccc.int/Projects/DB/CRB-2103",
      },
      status: "Available",
      createdAt: now,
      updatedAt: now,
    },
    {
      title: "Onshore Wind Corridor Expansion",
      description:
        "Expansion of existing wind corridor with high-capacity turbines and predictive maintenance systems, replacing grid electricity sourced from thermal plants.",
      seller: sellerB,
      quantity: 6400,
      pricePerCredit: 15,
      location: "Kutch, Gujarat, India",
      projectType: "Renewable Energy",
      verification: {
        verifiedBy: "Gold Standard",
        certificateUrl: "https://registry.goldstandard.org/projects/details/CRB-2104",
      },
      status: "Available",
      createdAt: now,
      updatedAt: now,
    },
    {
      title: "Blue Carbon Mangrove Shield",
      description:
        "Mangrove restoration and protection along vulnerable coastline to enhance carbon sequestration, reduce storm surge impact, and support fisheries-dependent livelihoods.",
      seller: sellerA,
      quantity: 2900,
      pricePerCredit: 17,
      location: "Sundarbans, West Bengal, India",
      projectType: "Blue Carbon",
      verification: {
        verifiedBy: "VCS",
        certificateUrl: "https://registry.verra.org/app/projectDetail/VCS/CRB-2105",
      },
      status: "Available",
      createdAt: now,
      updatedAt: now,
    },
    {
      title: "Regenerative Rice Cultivation Pilot",
      description:
        "Low-emission rice cultivation practices including alternate wetting and drying, optimized nutrient management, and crop residue composting for methane reduction.",
      seller: sellerB,
      quantity: 3100,
      pricePerCredit: 11,
      location: "Thanjavur, Tamil Nadu, India",
      projectType: "Agriculture",
      verification: {
        verifiedBy: "Gold Standard",
        certificateUrl: "https://registry.goldstandard.org/projects/details/CRB-2106",
      },
      status: "Pending",
      createdAt: now,
      updatedAt: now,
    },
    {
      title: "Industrial Waste Heat Recovery",
      description:
        "Waste heat capture across medium-scale manufacturing units, converting otherwise lost thermal energy into usable process energy and reducing fuel consumption.",
      seller: sellerA,
      quantity: 3300,
      pricePerCredit: 12,
      location: "Pune, Maharashtra, India",
      projectType: "Others",
      verification: {
        verifiedBy: "CDM",
        certificateUrl: "https://cdm.unfccc.int/Projects/DB/CRB-2107",
      },
      status: "Available",
      createdAt: now,
      updatedAt: now,
    },
    {
      title: "Urban E-Mobility Charging From Renewables",
      description:
        "Solar-backed EV charging depots for public transport fleets, reducing lifecycle emissions from city transit operations and grid peak dependence.",
      seller: sellerB,
      quantity: 2700,
      pricePerCredit: 13,
      location: "Bengaluru, Karnataka, India",
      projectType: "Renewable Energy",
      verification: {
        verifiedBy: "VCS",
        certificateUrl: "https://registry.verra.org/app/projectDetail/VCS/CRB-2108",
      },
      status: "Available",
      createdAt: now,
      updatedAt: now,
    },
    {
      title: "Degraded Forest Assisted Natural Regrowth",
      description:
        "Protection and assisted natural regeneration of degraded forest tracts with native species monitoring and firebreak management.",
      seller: sellerA,
      quantity: 5800,
      pricePerCredit: 16,
      location: "Bastar, Chhattisgarh, India",
      projectType: "Reforestation",
      verification: {
        verifiedBy: "Gold Standard",
        certificateUrl: "https://registry.goldstandard.org/projects/details/CRB-2109",
      },
      status: "Sold",
      createdAt: now,
      updatedAt: now,
    },
    {
      title: "Decentralized Biogas for Dairy Cooperatives",
      description:
        "Cluster of biodigesters at dairy cooperatives converting manure into clean biogas and slurry fertilizer, reducing methane leakage and LPG dependence.",
      seller: sellerB,
      quantity: 2400,
      pricePerCredit: 10,
      location: "Anand, Gujarat, India",
      projectType: "Waste Management",
      verification: {
        verifiedBy: "VCS",
        certificateUrl: "https://registry.verra.org/app/projectDetail/VCS/CRB-2110",
      },
      status: "Available",
      createdAt: now,
      updatedAt: now,
    },
  ];

  const inserted = await CarbonCredit.insertMany(docs);

  const sellerAPosted = inserted
    .filter((item) => item.seller.toString() === sellerA.toString())
    .map((item) => item._id);
  const sellerBPosted = inserted
    .filter((item) => item.seller.toString() === sellerB.toString())
    .map((item) => item._id);

  await User.updateOne(
    { _id: sellerA },
    { $addToSet: { posted: { $each: sellerAPosted } } }
  );
  await User.updateOne(
    { _id: sellerB },
    { $addToSet: { posted: { $each: sellerBPosted } } }
  );

  const totalListings = await CarbonCredit.countDocuments();

  console.log(`Inserted listings: ${inserted.length}`);
  console.log(`Current listings count: ${totalListings}`);

  await mongoose.disconnect();
}

run().catch(async (error) => {
  console.error("Failed to add listings:", error.message);
  await mongoose.disconnect();
  process.exit(1);
});
