const express = require("express");
const User = require("../models/User");
const Category = require("../models/Category");
const Transaction = require("../models/Transaction");

const router = express.Router();

// Create a temporary user
router.post("/user", async (req, res) => {
  try {
    const user = await User.create({
      name: "Test User",
      email: "test2@example.com",
      password: "testpassword123",
    });

    res.status(201).json(user);
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
});

// Create a temporary category
router.post("/category", async (req, res) => {
  try {
    const category = await Category.create({
      name: "Food",
      type: "expense",
    });

    res.status(201).json(category);
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
});

router.post("/transaction", async (req, res) => {
  try {
    const transaction = await Transaction.create(req.body);

    res.status(201).json(transaction);
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
});

module.exports = router;