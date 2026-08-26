const Transaction = require("../models/Transaction");

// @desc    Get dashboard statistics
// @route   GET /api/dashboard
const getDashboard = async (req, res) => {
  try {
    const transactions = await Transaction.find();

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

    const recentTransactions = await Transaction.find()
      .sort({ date: -1 })
      .limit(5);

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