const express = require("express");
const router = express.Router();

// Controllers
const {
  generateTodayPlan,
  deleteTodayPlan,
  regenerateTodayPlan,
  completeTask,
  completeAllTasks,
} = require("../controllers/planController");

// Auth middleware
const { protect } = require("../middleware/authMiddleware");

// ==========================================
// Get OR generate today's plan (Gemini AI)
// ==========================================
router.get("/today", protect, generateTodayPlan);

// ==========================================
// Delete today's plan
// ==========================================
router.delete("/today", protect, deleteTodayPlan);

// ==========================================
// Regenerate today's plan (with user prompt)
// ==========================================
router.post("/regenerate", protect, regenerateTodayPlan);

// ==========================================
// Mark ONE task as completed
// ==========================================
router.put("/complete/:planId/:taskId", protect, completeTask);

// ==========================================
// Mark ALL tasks as completed
// ==========================================
router.put("/completeAll/:planId", protect, completeAllTasks);

module.exports = router;
