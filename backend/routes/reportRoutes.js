const express = require("express");
const { getReports } = require("../controllers/reportController");

const router = express.Router();

// GET /api/reports
router.get("/", getReports);

module.exports = router;