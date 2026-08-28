const express = require("express");
const {
  createCategory,
  getCategories,
} = require("../controllers/categoryController");
const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();

router.use(authMiddleware);

router.get("/", getCategories);
router.post("/", createCategory);

module.exports = router;
