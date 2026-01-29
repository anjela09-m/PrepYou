const User = require("../models/User");

// @desc    Get logged-in user profile
// @route   GET /api/user/profile
// @access  Private
exports.getUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password");

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json(user);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

// @desc    Update user preparation settings
// @route   PUT /api/user/settings
// @access  Private
exports.updateUserSettings = async (req, res) => {
  try {
    const { preparationMode, level, dailyTime } = req.body;

    const user = await User.findById(req.user.id);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (preparationMode) user.preparationMode = preparationMode;
    if (level) user.level = level;
    if (dailyTime) user.dailyTime = dailyTime;

    await user.save();

    res.json({
      message: "User settings updated successfully",
      user,
    });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};
