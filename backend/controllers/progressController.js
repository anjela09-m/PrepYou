const Progress = require("../models/Progress");
const DailyPlan = require("../models/DailyPlan");
const Goal = require("../models/Goal");

// ===============================
// Utility: calculate completion %
// ===============================
const calculateCompletion = (completed, total) => {
  if (total === 0) return 0;
  return Math.round((completed / total) * 100);
};

// ===============================
// Update progress after task completion
// ===============================
const updateProgressAfterTask = async (userId, goalId, date) => {
  try {
    const plan = await DailyPlan.findOne({
      user: userId,
      date,
    });

    // 🔹 If plan no longer exists (deleted / regenerated)
    if (!plan) {
      await Progress.findOneAndDelete({
        user: userId,
        goal: goalId,
        date,
      });
      return;
    }

    const totalTasks = plan.tasks.length;
    const completedTasks = plan.tasks.filter(
      (t) => t.isCompleted
    ).length;

    const completionRate = calculateCompletion(
      completedTasks,
      totalTasks
    );

    let progress = await Progress.findOne({
      user: userId,
      goal: goalId,
      date,
    });

    if (!progress) {
      progress = new Progress({
        user: userId,
        goal: goalId,
        date,
        totalTasks,
        completedTasks,
        completionRate,
      });
    } else {
      progress.totalTasks = totalTasks;
      progress.completedTasks = completedTasks;
      progress.completionRate = completionRate;
    }

    // 🔹 Simple overload detection (exam-friendly)
    progress.overloadDetected = completionRate < 40;

    await progress.save();
  } catch (error) {
    console.error("Progress update error:", error.message);
  }
};

// ===============================
// Reset progress for a given date
// (used on delete / regenerate)
// ===============================
const resetProgressForDate = async (userId, goalId, date) => {
  try {
    await Progress.findOneAndDelete({
      user: userId,
      goal: goalId,
      date,
    });
  } catch (error) {
    console.error("Progress reset error:", error.message);
  }
};

// ===============================
// Get dashboard progress summary
// ===============================
const getProgressSummary = async (req, res) => {
  try {
    const userId = req.user.id;

    const goal = await Goal.findOne({
      user: userId,
      isActive: true,
    });

    if (!goal) {
      return res
        .status(404)
        .json({ message: "No active goal found" });
    }

    const last7Days = await Progress.find({
      user: userId,
      goal: goal._id,
    })
      .sort({ date: -1 })
      .limit(7);

    const avgCompletion =
      last7Days.reduce(
        (sum, p) => sum + p.completionRate,
        0
      ) / (last7Days.length || 1);

    let levelSuggestion = "none";
    if (avgCompletion >= 80) levelSuggestion = "upgrade";
    else if (avgCompletion <= 40) levelSuggestion = "downgrade";

    res.json({
      activeGoal: goal.title,
      averageCompletion: Math.round(avgCompletion),
      last7Days,
      levelSuggestion,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  updateProgressAfterTask,
  resetProgressForDate,
  getProgressSummary,
};
