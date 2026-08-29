const mongoose = require("mongoose");
const Transaction = require("../models/Transaction");
const Category = require("../models/Category");

const isValidObjectId = (id) => mongoose.Types.ObjectId.isValid(id);

const validateTransactionData = async ({ type, amount, category, date }, userId) => {
  if (!type || !["income", "expense"].includes(type)) {
    return "Type must be income or expense";
  }

  if (amount === undefined || amount === null || amount === "") {
    return "Amount is required";
  }

  const numericAmount = Number(amount);

  if (!Number.isFinite(numericAmount) || numericAmount <= 0) {
    return "Amount must be greater than 0";
  }

  if (!category) {
    return "Category is required";
  }

  if (!isValidObjectId(category)) {
    return "Invalid category ID";
  }

  if (date && Number.isNaN(new Date(date).getTime())) {
    return "Invalid date";
  }

  const categoryExists = await Category.findOne({
    _id: category,
    user: userId,
  });

  if (!categoryExists) {
    return "Category not found ";
  }

  return null;
};


// POST /api/transactions
const createTransaction = async (req, res) => {
  try {
    const { type, amount, category, description, date } = req.body;

    const validationError = await validateTransactionData(
      { type, amount, category, date },
      req.user._id
    );

    if (validationError) {
      return res.status(400).json({
        message: validationError,
      });
    }

    const transaction = await Transaction.create({
      user: req.user._id,
      type,
      amount: Number(amount),
      category,
      description: description?.trim(),
      date: date || Date.now(),
    });

    await transaction.populate("category", "name type");

    return res.status(201).json({
      message: "Transaction created successfully",
      transaction,
    });
  } catch (error) {
    if (error instanceof mongoose.Error.ValidationError) {
      return res.status(400).json({
        message: Object.values(error.errors)
          .map((item) => item.message)
          .join(", "),
      });
    }

    return res.status(500).json({
      message: "Failed to create transaction",
      error: error.message,
    });
  }
};


// GET /api/transactions
const getTransactions = async (req, res) => {
  try {
    const {
      type,
      category,
      startDate,
      endDate,
    } = req.query;

    const filter = {
      user: req.user._id,
    };

    if (type) {
      if (!["income", "expense"].includes(type)) {
        return res.status(400).json({
          message: "Type must be income or expense",
        });
      }

      filter.type = type;
    }

    if (category) {
      if (!isValidObjectId(category)) {
        return res.status(400).json({
          message: "Invalid category ID",
        });
      }

      filter.category = category;
    }

    if (startDate || endDate) {
      filter.date = {};

      if (startDate) {
        const start = new Date(startDate);

        if (Number.isNaN(start.getTime())) {
          return res.status(400).json({
            message: "Invalid startDate",
          });
        }

        start.setHours(0, 0, 0, 0);
        filter.date.$gte = start;
      }

      if (endDate) {
        const end = new Date(endDate);

        if (Number.isNaN(end.getTime())) {
          return res.status(400).json({
            message: "Invalid endDate",
          });
        }

        end.setHours(23, 59, 59, 999);
        filter.date.$lte = end;
      }
    }

    const transactions = await Transaction.find(filter)
      .populate("category", "name type")
      .sort({ date: -1, createdAt: -1 });

    return res.status(200).json({
      count: transactions.length,
      transactions,
    });
  } catch (error) {
    return res.status(500).json({
      message: "Failed to fetch transactions",
      error: error.message,
    });
  }
};


// GET /api/transactions/:id
const getTransactionById = async (req, res) => {
  try {
    const { id } = req.params;

    if (!isValidObjectId(id)) {
      return res.status(400).json({
        message: "Invalid transaction ID",
      });
    }

    const transaction = await Transaction.findOne({
      _id: id,
      user: req.user._id,
    }).populate("category", "name type");

    if (!transaction) {
      return res.status(404).json({
        message: "Transaction not found",
      });
    }

    return res.status(200).json({
      transaction,
    });
  } catch (error) {
    return res.status(500).json({
      message: "Failed to fetch transaction",
      error: error.message,
    });
  }
};


// PUT /api/transactions/:id
const updateTransaction = async (req, res) => {
  try {
    const { id } = req.params;

    if (!isValidObjectId(id)) {
      return res.status(400).json({
        message: "Invalid transaction ID",
      });
    }

    const transaction = await Transaction.findOne({
      _id: id,
      user: req.user._id,
    });

    if (!transaction) {
      return res.status(404).json({
        message: "Transaction not found",
      });
    }

    const {
      type = transaction.type,
      amount = transaction.amount,
      category = transaction.category.toString(),
      description = transaction.description,
      date = transaction.date,
    } = req.body;

    const validationError = await validateTransactionData(
      { type, amount, category, date },
      req.user._id
    );

    if (validationError) {
      return res.status(400).json({
        message: validationError,
      });
    }

    transaction.type = type;
    transaction.amount = Number(amount);
    transaction.category = category;
    transaction.description = description?.trim();
    transaction.date = date;

    await transaction.save();
    await transaction.populate("category", "name type");

    return res.status(200).json({
      message: "Transaction updated successfully",
      transaction,
    });
  } catch (error) {
    if (error instanceof mongoose.Error.ValidationError) {
      return res.status(400).json({
        message: Object.values(error.errors)
          .map((item) => item.message)
          .join(", "),
      });
    }

    return res.status(500).json({
      message: "Failed to update transaction",
      error: error.message,
    });
  }
};


// DELETE /api/transactions/:id
const deleteTransaction = async (req, res) => {
  try {
    const { id } = req.params;

    if (!isValidObjectId(id)) {
      return res.status(400).json({
        message: "Invalid transaction ID",
      });
    }

    const transaction = await Transaction.findOneAndDelete({
      _id: id,
      user: req.user._id,
    });

    if (!transaction) {
      return res.status(404).json({
        message: "Transaction not found",
      });
    }

    return res.status(200).json({
      message: "Transaction deleted successfully",
    });
  } catch (error) {
    return res.status(500).json({
      message: "Failed to delete transaction",
      error: error.message,
    });
  }
};


module.exports = {
  createTransaction,
  getTransactions,
  getTransactionById,
  updateTransaction,
  deleteTransaction,
};