import connect from "../db/index.js";
import User from "../models/userModel.js";
import EcoProduct from "../models/EcoProduct.js";
import logger from "../utils/logger.js";

const ecoProductsData = [
  {
    name: "Solar Powered Power Bank 20000mAh",
    description: "High capacity power bank with solar charging capability built for outdoor use. Waterproof and durable.",
    category: "Solar Equipment",
    price: 2500,
    stock: 50,
    imageUrl: "https://images.unsplash.com/photo-1620916297397-a4a5402a3c6c?w=800&q=80",
    ecoRating: 4,
    tags: ["Solar", "Portable", "Gadgets"],
    specifications: "Capacity: 20000mAh, Output: 18W Fast Charging, Weatherproof",
    carbonEmissionSaved: 1500,
    status: "Active"
  },
  {
    name: "Bamboo Toothbrush Pack of 4",
    description: "100% biodegradable bamboo toothbrushes with charcoal infused bristles.",
    category: "Organic & Natural",
    price: 399,
    stock: 200,
    imageUrl: "https://images.unsplash.com/photo-1606836486004-94672e35dd7a?w=800&q=80",
    ecoRating: 5,
    tags: ["Biodegradable", "Personal Care", "Bamboo"],
    specifications: "Material: Bamboo, Bristles: Nylon-4 (degradable), Pack: 4",
    carbonEmissionSaved: 200,
    status: "Active"
  },
  {
    name: "Recycled Plastic Laptop Backpack",
    description: "Stylish and functional backpack made entirely from recycled ocean plastics. Water resistant and padded.",
    category: "Recycled Products",
    price: 3500,
    stock: 30,
    imageUrl: "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=800&q=80",
    ecoRating: 5,
    tags: ["Recycled", "Bag", "Fashion"],
    specifications: "Volume: 25L, Material: 100% Recycled PET",
    carbonEmissionSaved: 3500,
    status: "Active"
  },
  {
    name: "Smart Water Flow Controller",
    description: "Easily attaches to standard taps to reduce water flow without compromising pressure. Save up to 50% water.",
    category: "Water Conservation",
    price: 850,
    stock: 120,
    imageUrl: "https://images.unsplash.com/photo-1584347781912-252f4cbfb45f?w=800&q=80",
    ecoRating: 4,
    tags: ["Water Save", "Smart Home"],
    specifications: "Flow Rate: 3L/min, Thread: Standard 24mm",
    carbonEmissionSaved: null,
    status: "Active"
  },
  {
    name: "Home Composting Bin 15L",
    description: "Odorless indoor composting bin for kitchen scraps. Includes starter compost mix.",
    category: "Eco Home",
    price: 1800,
    stock: 45,
    imageUrl: "https://images.unsplash.com/photo-1590682680695-43b964a3ae17?w=800&q=80",
    ecoRating: 5,
    tags: ["Compost", "Kitchen", "Zero Waste"],
    specifications: "Capacity: 15L, Material: Recycled PP, Includes carbon filter",
    carbonEmissionSaved: 5000,
    status: "Active"
  },
  {
    name: "Organic Cotton Reusable Grocery Bags",
    description: "Set of 5 heavy-duty reusable canvas bags for grocery shopping. Washable and durable.",
    category: "Organic & Natural",
    price: 650,
    stock: 150,
    imageUrl: "https://images.unsplash.com/photo-1591567167664-07d472cdef9a?w=800&q=80",
    ecoRating: 4,
    tags: ["Reusable", "Shopping", "Cotton"],
    specifications: "Material: 100% Organic Cotton. Load capacity: 15kg",
    carbonEmissionSaved: 800,
    status: "Active"
  },
  {
    name: "Level 2 EV Home Charger 7.4kW",
    description: "Fast AC charging for electric vehicles at home. Weatherproof enclosure for indoor/outdoor use.",
    category: "EV Accessories",
    price: 28500,
    stock: 15,
    imageUrl: "https://images.unsplash.com/photo-1629853317070-1fc45f27da08?w=800&q=80",
    ecoRating: 5,
    tags: ["EV", "Charger", "Fast Charge"],
    specifications: "Output: 7.4kW 32A, Cable Length: 5m, Type 2 Plug",
    carbonEmissionSaved: 12000,
    status: "Active"
  },
  {
    name: "Solar Pathway Lights (Pack of 6)",
    description: "LED solar powered garden and pathway lights. Auto on/off from dusk to dawn.",
    category: "Solar Equipment",
    price: 1250,
    stock: 80,
    imageUrl: "https://images.unsplash.com/photo-1527668600746-81cf8addce0c?w=800&q=80",
    ecoRating: 4,
    tags: ["Solar", "Garden", "Lighting"],
    specifications: "Battery: 600mAh Ni-MH, LED: Warm White, Weatherproof IP65",
    carbonEmissionSaved: 2400,
    status: "Active"
  }
];

const seedEcoProducts = async () => {
  try {
    await connect();
    logger.info("Connected to database for eco product seeding");

    let adminUser = await User.findOne({ role: "admin" });
    if (!adminUser) {
      adminUser = await User.findOne();
      if (!adminUser) {
        logger.error("No users found. Please create a user first before seeding.");
        process.exit(1);
      }
    }
    
    logger.info(`Using user: ${adminUser.email} as product creator`);

    await EcoProduct.deleteMany({});
    logger.info("Cleared existing eco products");

    const productsToCreate = ecoProductsData.map((prod) => ({
      ...prod,
      addedBy: adminUser._id,
    }));

    const createdProducts = await EcoProduct.create(productsToCreate);
    logger.info(`Successfully created ${createdProducts.length} eco products`);
    
    createdProducts.forEach((p) => {
      logger.info(`  - ${p.name}`);
    });

    logger.info("Eco Product seeding completed successfully!");
    process.exit(0);
  } catch (error) {
    logger.error("Error seeding eco products:", error);
    process.exit(1);
  }
};

seedEcoProducts();
