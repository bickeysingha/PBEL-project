const express = require("express");

const {
  getBudgets,
  createBudget,
  updateBudget,
  deleteBudget,
} = require("../controllers/budgetController");

const router = express.Router();

router
  .route("/")
  .get(getBudgets)
  .post(createBudget);

router
  .route("/:id")
  .put(updateBudget)
  .delete(deleteBudget);

module.exports = router;