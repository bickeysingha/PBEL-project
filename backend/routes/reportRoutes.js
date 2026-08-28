const express = require("express");
const { getReports } = require("../controllers/reportController");
const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();

// Reports require login
router.get("/", authMiddleware, getReports);

module.exports = router;