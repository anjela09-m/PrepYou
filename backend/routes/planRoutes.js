const express = require("express");
const router = express.Router();

const {
  generateTodayPlan,
  regenerateTodayPlan,
  acceptPlan,
  deleteTodayPlan,
  completeTask,
  completeAllTasks,
  submitDay,
} = require("../controllers/planController");

const { protect } = require("../middleware/authMiddleware");


router.post("/today", protect, generateTodayPlan);


router.post("/today/regenerate", protect, regenerateTodayPlan);


router.post("/today/accept", protect, acceptPlan);


router.delete("/today", protect, deleteTodayPlan);


router.patch("/:planId/task/:taskId", protect, completeTask);


router.patch("/:planId/complete", protect, completeAllTasks);

// Submit today's day (LOCK & FINALIZE)
router.post("/today/submit", protect, submitDay);

router.get("/test", (req, res) => {
  res.json({ ok: true });
});


module.exports = router;
