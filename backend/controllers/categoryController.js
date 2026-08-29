const mongoose = require("mongoose");
const Category = require("../models/Category");

// GET /api/categories
const getCategories = async (req, res) => {
  try {
    const categories = await Category.find({
      user: req.user._id,
    }).sort({
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

// POST /api/categories
const createCategory = async (req, res) => {
  try {
    const { name } = req.body;

    if (!name?.trim()) {
      return res.status(400).json({
        message: "Category name is required",
      });
    }

    const category = await Category.create({
      user: req.user._id,
      name: name.trim(),
    });

    return res.status(201).json({
      message: "Category created successfully",
      category,
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({
        message: "You already have this category",
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

// DELETE /api/categories/:id
const deleteCategory = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        message: "Invalid category ID",
      });
    }

    const category = await Category.findOneAndDelete({
      _id: id,
      user: req.user._id,
    });

    if (!category) {
      return res.status(404).json({
        message: "Category not found",
      });
    }

    return res.status(200).json({
      message: "Category deleted successfully",
    });
  } catch (error) {
    return res.status(500).json({
      message: "Failed to delete category",
      error: error.message,
    });
  }
};

module.exports = {
  getCategories,
  createCategory,
  deleteCategory,
};