const express = require("express");
const router = express.Router();

const {
  getCategories,
  createCategory,
  deleteCategory,
} = require("../controllers/categoryController");

const authMiddleware = require("../middleware/authMiddleware");

router.get("/", authMiddleware, getCategories);
router.post("/", authMiddleware, createCategory);
router.delete("/:id", authMiddleware, deleteCategory);

module.exports = router;