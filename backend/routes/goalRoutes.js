const express = require("express");
const router = express.Router();
const {
    createGoal,
    getActiveGoal,
    acceptGoal,
    regenerateGoalPlan,
    updateGoal,
} = require("../controllers/goalController");
const { protect } = require("../middleware/authMiddleware");

// Create a new goal
router.post("/", protect, createGoal);

// Get current active goal
router.get("/active", protect, getActiveGoal);

// Accept summary plan
router.post("/:id/accept", protect, acceptGoal);

// Regenerate summary plan
router.post("/:id/regenerate", protect, regenerateGoalPlan);

// Update a goal
router.put("/:id", protect, updateGoal);

module.exports = router;
