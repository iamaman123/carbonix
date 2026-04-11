import Transaction from "../models/transactionsModel.js";
import CarbonCredit from "../models/Listing.js";
import logger from "../utils/logger.js";

// Get seller analytics
export const getSellerAnalytics = async (req, res) => {
  try {
    const sellerId = req.user.userId;

    // Get all transactions where user is seller
    const transactions = await Transaction.find({
      seller: sellerId,
      paymentStatus: "completed",
    }).sort({ purchaseDate: -1 });

    // Calculate metrics
    const totalRevenue = transactions.reduce(
      (sum, txn) => sum + (txn.totalAmount || 0),
      0
    );
    const totalCreditsSold = transactions.reduce(
      (sum, txn) => sum + (txn.quantity || 0),
      0
    );
    const totalTransactions = transactions.length;

    // Get active listings
    const activeListings = await CarbonCredit.countDocuments({
      seller: sellerId,
      status: "Available",
    });

    // Monthly revenue (last 6 months)
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

    const monthlyRevenue = await Transaction.aggregate([
      {
        $match: {
          seller: sellerId,
          paymentStatus: "completed",
          purchaseDate: { $gte: sixMonthsAgo },
        },
      },
      {
        $group: {
          _id: {
            year: { $year: "$purchaseDate" },
            month: { $month: "$purchaseDate" },
          },
          revenue: { $sum: "$totalAmount" },
          sales: { $sum: 1 },
          credits: { $sum: "$quantity" },
        },
      },
      {
        $sort: { "_id.year": 1, "_id.month": 1 },
      },
    ]);

    // Top buyers
    const topBuyers = await Transaction.aggregate([
      {
        $match: {
          seller: sellerId,
          paymentStatus: "completed",
        },
      },
      {
        $group: {
          _id: "$buyer",
          totalSpent: { $sum: "$totalAmount" },
          transactionCount: { $sum: 1 },
        },
      },
      {
        $sort: { totalSpent: -1 },
      },
      {
        $limit: 5,
      },
      {
        $lookup: {
          from: "users",
          localField: "_id",
          foreignField: "_id",
          as: "buyerInfo",
        },
      },
      {
        $unwind: "$buyerInfo",
      },
      {
        $project: {
          email: "$buyerInfo.email",
          name: "$buyerInfo.name",
          totalSpent: 1,
          transactionCount: 1,
        },
      },
    ]);

    // Recent transactions
    const recentTransactions = await Transaction.find({
      seller: sellerId,
      paymentStatus: "completed",
    })
      .populate("buyer", "email name")
      .populate("listing", "title")
      .sort({ purchaseDate: -1 })
      .limit(10);

    res.json({
      success: true,
      data: {
        summary: {
          totalRevenue,
          totalCreditsSold,
          totalTransactions,
          activeListings,
        },
        monthlyRevenue,
        topBuyers,
        recentTransactions,
      },
    });
  } catch (error) {
    logger.error("Error fetching seller analytics:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch analytics",
    });
  }
};

// Get buyer analytics
export const getBuyerAnalytics = async (req, res) => {
  try {
    const buyerId = req.user.userId;

    // Get all transactions where user is buyer
    const transactions = await Transaction.find({
      buyer: buyerId,
      paymentStatus: "completed",
    }).sort({ purchaseDate: -1 });

    // Calculate metrics
    const totalSpent = transactions.reduce(
      (sum, txn) => sum + (txn.totalAmount || 0),
      0
    );
    const totalCreditsPurchased = transactions.reduce(
      (sum, txn) => sum + (txn.quantity || 0),
      0
    );
    const totalTransactions = transactions.length;

    // Monthly spending (last 6 months)
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

    const monthlySpending = await Transaction.aggregate([
      {
        $match: {
          buyer: buyerId,
          paymentStatus: "completed",
          purchaseDate: { $gte: sixMonthsAgo },
        },
      },
      {
        $group: {
          _id: {
            year: { $year: "$purchaseDate" },
            month: { $month: "$purchaseDate" },
          },
          spending: { $sum: "$totalAmount" },
          purchases: { $sum: 1 },
          credits: { $sum: "$quantity" },
        },
      },
      {
        $sort: { "_id.year": 1, "_id.month": 1 },
      },
    ]);

    // Credits by project type
    const creditsByType = await Transaction.aggregate([
      {
        $match: {
          buyer: buyerId,
          paymentStatus: "completed",
        },
      },
      {
        $lookup: {
          from: "carboncredits",
          localField: "listing",
          foreignField: "_id",
          as: "listingInfo",
        },
      },
      {
        $unwind: "$listingInfo",
      },
      {
        $group: {
          _id: "$listingInfo.projectType",
          credits: { $sum: "$quantity" },
          spent: { $sum: "$totalAmount" },
        },
      },
      {
        $sort: { credits: -1 },
      },
    ]);

    // Recent transactions
    const recentTransactions = await Transaction.find({
      buyer: buyerId,
      paymentStatus: "completed",
    })
      .populate("seller", "email name")
      .populate("listing", "title projectType")
      .sort({ purchaseDate: -1 })
      .limit(10);

    res.json({
      success: true,
      data: {
        summary: {
          totalSpent,
          totalCreditsPurchased,
          totalTransactions,
          carbonOffsetTons: totalCreditsPurchased, // 1 credit = 1 ton CO2
        },
        monthlySpending,
        creditsByType,
        recentTransactions,
      },
    });
  } catch (error) {
    logger.error("Error fetching buyer analytics:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch analytics",
    });
  }
};

// Get market trends (public)
export const getMarketTrends = async (req, res) => {
  try {
    // Average price trend (last 6 months)
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

    const priceTrends = await Transaction.aggregate([
      {
        $match: {
          paymentStatus: "completed",
          purchaseDate: { $gte: sixMonthsAgo },
        },
      },
      {
        $group: {
          _id: {
            year: { $year: "$purchaseDate" },
            month: { $month: "$purchaseDate" },
          },
          avgPrice: { $avg: "$pricePerCredit" },
          totalVolume: { $sum: "$quantity" },
          totalTransactions: { $sum: 1 },
        },
      },
      {
        $sort: { "_id.year": 1, "_id.month": 1 },
      },
    ]);

    // Most popular project types
    const popularTypes = await CarbonCredit.aggregate([
      {
        $match: { status: "Available" },
      },
      {
        $group: {
          _id: "$projectType",
          count: { $sum: 1 },
          avgPrice: { $avg: "$pricePerCredit" },
          totalCredits: { $sum: "$quantity" },
        },
      },
      {
        $sort: { count: -1 },
      },
      {
        $limit: 5,
      },
    ]);

    // Top locations
    const topLocations = await CarbonCredit.aggregate([
      {
        $match: { status: "Available" },
      },
      {
        $group: {
          _id: "$location",
          count: { $sum: 1 },
          avgPrice: { $avg: "$pricePerCredit" },
        },
      },
      {
        $sort: { count: -1 },
      },
      {
        $limit: 10,
      },
    ]);

    // Platform stats
    const totalListings = await CarbonCredit.countDocuments();
    const availableCredits = await CarbonCredit.aggregate([
      {
        $match: { status: "Available" },
      },
      {
        $group: {
          _id: null,
          total: { $sum: "$quantity" },
        },
      },
    ]);

    res.json({
      success: true,
      data: {
        priceTrends,
        popularTypes,
        topLocations,
        platformStats: {
          totalListings,
          availableCredits: availableCredits[0]?.total || 0,
        },
      },
    });
  } catch (error) {
    logger.error("Error fetching market trends:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch market trends",
    });
  }
};
