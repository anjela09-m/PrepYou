const express = require("express");
const router = express.Router();
const { createGoal, getActiveGoal } = require("../controllers/goalController");
const { protect } = require("../middleware/authMiddleware");

// Create a new goal
router.post("/", protect, createGoal);

// Get current active goal
router.get("/active", protect, getActiveGoal);

module.exports = router;
