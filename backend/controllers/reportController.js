const mongoose = require("mongoose");
const Transaction = require("../models/Transaction");

// @desc Get reports data
// @route GET /api/reports
const getReports = async (req, res) => {
  try {
    const userId = new mongoose.Types.ObjectId(req.user._id);
    

    // Category-wise expenses for logged-in user
    const categoryWiseExpenses = await Transaction.aggregate([
      {
        $match: {
          user: userId,
          type: "expense",
        },
      },
      {
        $group: {
          _id: "$category",
          total: { $sum: "$amount" },
        },
      },
    ]);

    // Monthly income and expenses for logged-in user
    const monthlySummary = await Transaction.aggregate([
      {
        $match: {
          user: userId,
        },
      },
      {
        $group: {
          _id: {
            year: { $year: "$date" },
            month: { $month: "$date" },
            type: "$type",
          },
          total: { $sum: "$amount" },
        },
      },
      {
        $sort: {
          "_id.year": 1,
          "_id.month": 1,
        },
      },
    ]);

    // Monthly expense trend for logged-in user
    const spendingTrend = await Transaction.aggregate([
      {
        $match: {
          user: userId,
          type: "expense",
        },
      },
      {
        $group: {
          _id: {
            year: { $year: "$date" },
            month: { $month: "$date" },
          },
          total: { $sum: "$amount" },
        },
      },
      {
        $sort: {
          "_id.year": 1,
          "_id.month": 1,
        },
      },
    ]);

    res.status(200).json({
      categoryWiseExpenses,
      monthlySummary,
      spendingTrend,
    });
  } catch (error) {
    res.status(500).json({
      message: "Error generating reports",
      error: error.message,
    });
  }
};

module.exports = {
  getReports,
};