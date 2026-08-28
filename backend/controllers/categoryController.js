const mongoose = require("mongoose");
const Category = require("../models/Category");

const getCategories = async (req, res) => {
  try {
    const categories = await Category.find({ user: req.user.id }).sort({
      type: 1,
      name: 1,
    });

    return res.status(200).json({ categories });
  } catch (error) {
    return res.status(500).json({
      message: "Failed to fetch categories",
      error: error.message,
    });
  }
};

const createCategory = async (req, res) => {
  try {
    const { name, type } = req.body;

    if (!name?.trim() || !type) {
      return res.status(400).json({
        message: "Name and type are required",
      });
    }

    if (!["income", "expense"].includes(type)) {
      return res.status(400).json({
        message: "Type must be income or expense",
      });
    }

    const category = await Category.create({
      user: req.user.id,
      name: name.trim(),
      type,
    });

    return res.status(201).json({
      message: "Category created successfully",
      category,
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({
        message: "You already have this category for this transaction type",
      });
    }

    if (error instanceof mongoose.Error.ValidationError) {
      return res.status(400).json({
        message: Object.values(error.errors)
          .map((item) => item.message)
          .join(", "),
      });
    }

    return res.status(500).json({
      message: "Failed to create category",
      error: error.message,
    });
  }
};

module.exports = {
  getCategories,
  createCategory,
};
