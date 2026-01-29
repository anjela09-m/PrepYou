const express = require("express");
const router = express.Router();
const {
  getUserProfile,
  updateUserSettings,
} = require("../controllers/userController.js");
const { protect } = require("../middleware/authMiddleware.js");

// Get user profile
router.get("/profile", protect, getUserProfile);

// Update preparation settings
router.put("/settings", protect, updateUserSettings);

module.exports = router;
