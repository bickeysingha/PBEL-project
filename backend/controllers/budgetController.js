const Budget = require("../models/Budget");

// @desc    Get all budgets
// @route   GET /api/budgets
const getBudgets = async (req, res) => {
  try {
    const budgets = await Budget.find();

    res.status(200).json(budgets);
  } catch (error) {
    res.status(500).json({
      message: "Error fetching budgets",
      error: error.message,
    });
  }
};

// @desc    Create a budget
// @route   POST /api/budgets
const createBudget = async (req, res) => {
  try {
    const { user, category, amount, month, year } = req.body;

    // Basic validation
    if (!user || !category || !amount || !month || !year) {
      return res.status(400).json({
        message: "All fields are required",
      });
    }

    const budget = await Budget.create({
      user,
      category,
      amount,
      month,
      year,
    });

    res.status(201).json(budget);
  } catch (error) {
    res.status(500).json({
      message: "Error creating budget",
      error: error.message,
    });
  }
};

// @desc    Update a budget
// @route   PUT /api/budgets/:id
const updateBudget = async (req, res) => {
  try {
    const budget = await Budget.findByIdAndUpdate(
      req.params.id,
      req.body,
      {
        new: true,
        runValidators: true,
      }
    );

    if (!budget) {
      return res.status(404).json({
        message: "Budget not found",
      });
    }

    res.status(200).json(budget);
  } catch (error) {
    res.status(500).json({
      message: "Error updating budget",
      error: error.message,
    });
  }
};

// @desc    Delete a budget
// @route   DELETE /api/budgets/:id
const deleteBudget = async (req, res) => {
  try {
    const budget = await Budget.findByIdAndDelete(req.params.id);

    if (!budget) {
      return res.status(404).json({
        message: "Budget not found",
      });
    }

    res.status(200).json({
      message: "Budget deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      message: "Error deleting budget",
      error: error.message,
    });
  }
};

module.exports = {
  getBudgets,
  createBudget,
  updateBudget,
  deleteBudget,
};