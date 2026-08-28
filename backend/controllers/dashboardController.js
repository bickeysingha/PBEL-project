const Transaction = require("../models/Transaction");

// @desc Get dashboard statistics
// @route GET /api/dashboard
const getDashboard = async (req, res) => {
  try {
    // Only get transactions belonging to the logged-in user
    const transactions = await Transaction.find({
      user: req.user.id,
    });

    let totalIncome = 0;
    let totalExpense = 0;

    transactions.forEach((transaction) => {
      if (transaction.type === "income") {
        totalIncome += transaction.amount;
      } else if (transaction.type === "expense") {
        totalExpense += transaction.amount;
      }
    });

    const balance = totalIncome - totalExpense;

    // Get only this user's recent transactions
    const recentTransactions = await Transaction.find({
      user: req.user.id,
    })
      .sort({ date: -1 })
      .limit(5)
      .populate("category", "name");

    res.status(200).json({
      totalIncome,
      totalExpense,
      balance,
      recentTransactions,
    });
  } catch (error) {
    res.status(500).json({
      message: "Error fetching dashboard data",
      error: error.message,
    });
  }
};

module.exports = {
  getDashboard,
};