const express = require("express");
const router = express.Router();
const { getProgressSummary } = require("../controllers/progressController");
const { protect } = require("../middleware/authMiddleware");

router.get("/summary", protect, getProgressSummary);

module.exports = router;
