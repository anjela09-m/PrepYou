const express = require("express");
const router = express.Router();
const {
    getAllUsers,
    blockUser,
    unblockUser,
    getAllGoals,
    getAllDailyPlans,
    getStats,
} = require("../controllers/adminController");
const { protect, admin } = require("../middleware/authMiddleware");

router.get("/users", protect, admin, getAllUsers);
router.patch("/users/:id/block", protect, admin, blockUser);
router.patch("/users/:id/unblock", protect, admin, unblockUser);
router.get("/goals", protect, admin, getAllGoals);
router.get("/daily-plans", protect, admin, getAllDailyPlans);
router.get("/stats", protect, admin, getStats);

module.exports = router;
