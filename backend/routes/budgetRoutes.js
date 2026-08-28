const express = require("express");

const {
  getBudgets,
  createBudget,
  updateBudget,
  deleteBudget,
} = require("../controllers/budgetController");

const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();

// All budget routes require login
router.use(authMiddleware);

router
  .route("/")
  .get(getBudgets)
  .post(createBudget);

router
  .route("/:id")
  .put(updateBudget)
  .delete(deleteBudget);

module.exports = router;