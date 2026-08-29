const Budget = require("../models/Budget");

// @desc    Get logged-in user's budgets
// @route   GET /api/budgets
const getBudgets = async (req, res) => {
  try {
    const budgets = await Budget.find({
      user: req.user._id,
    }).populate("category", "name type");

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
    const { category, amount, month, year } = req.body;

    if (!category || amount === undefined || !month || !year) {
      return res.status(400).json({
        message: "Category, amount, month and year are required",
      });
    }

    if (Number(amount) <= 0) {
      return res.status(400).json({
        message: "Budget amount must be greater than 0",
      });
    }

    if (Number(month) < 1 || Number(month) > 12) {
      return res.status(400).json({
        message: "Month must be between 1 and 12",
      });
    }

    const budget = await Budget.create({
      user: req.user._id,
      category,
      amount: Number(amount),
      month: Number(month),
      year: Number(year),
    });

    const populatedBudget = await Budget.findById(budget._id).populate(
      "category",
      "name type"
    );

    res.status(201).json(populatedBudget);
  } catch (error) {
    res.status(500).json({
      message: "Error creating budget",
      error: error.message,
    });
  }
};

// @desc    Update logged-in user's budget
// @route   PUT /api/budgets/:id
const updateBudget = async (req, res) => {
  try {
    const { category, amount, month, year } = req.body;

    const budget = await Budget.findOneAndUpdate(
      {
        _id: req.params.id,
        user: req.user._id,
      },
      {
        category,
        amount: Number(amount),
        month: Number(month),
        year: Number(year),
      },
      {
        new: true,
        runValidators: true,
      }
    ).populate("category", "name type");

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

// @desc    Delete logged-in user's budget
// @route   DELETE /api/budgets/:id
const deleteBudget = async (req, res) => {
  try {
    const budget = await Budget.findOneAndDelete({
      _id: req.params.id,
      user: req.user._id,
    });

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