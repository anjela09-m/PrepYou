const mongoose = require("mongoose");
const Progress = require("../models/Progress");
const DailyPlan = require("../models/DailyPlan");
const Goal = require("../models/Goal");
const Journal = require("../models/Journal");

// ===============================
// Utility: calculate completion %
// ===============================
const calculateCompletion = (completed, total) => {
  if (total === 0) return 0;
  return Math.round((completed / total) * 100);
};

const updateProgressAfterTask = async (userId, goalId, date) => {
  try {
    if (!userId || !goalId || !date) {
      console.warn("⚠️ Missing parameters in updateProgressAfterTask:", { userId, goalId, date });
      return;
    }

    const plan = await DailyPlan.findOne({
      user: userId,
      date,
    });

    // 🔹 If plan no longer exists
    if (!plan) {
      console.log(`ℹ️ No plan found for user ${userId} on date ${date}. Cleaning up progress...`);
      await Progress.findOneAndDelete({
        user: userId,
        goal: goalId,
        date,
      });
      return;
    }

    const totalTasks = plan.tasks.length;
    const completedTasks = plan.tasks.filter((t) => t.isCompleted).length;
    const pendingTasks = plan.tasks.filter((t) => !t.isCompleted).length;
    const rolledOverTasks = plan.tasks.filter((t) => t.isRolledOver).length;

    const completionPercentage = calculateCompletion(completedTasks, totalTasks);

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
        pendingTasks,
        rolledOverTasks,
        completionPercentage,
      });
    } else {
      progress.totalTasks = totalTasks;
      progress.completedTasks = completedTasks;
      progress.pendingTasks = pendingTasks;
      progress.rolledOverTasks = rolledOverTasks;
      progress.completionPercentage = completionPercentage;
    }

    // 🔹 Simple overload detection
    progress.overloadDetected = completionPercentage < 40;

    await progress.save();

    // 🔹 Update user lastActiveAt
    const User = require("../models/User");
    await User.findByIdAndUpdate(userId, { lastActiveAt: new Date() });

  } catch (error) {
    console.error("Progress update error:", error.message);
  }
};

// ===============================
// Reset progress for a given date
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
    const goal = await Goal.findOne({ user: userId, isActive: true });

    if (!goal) return res.status(404).json({ message: "No active goal found" });

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // 1. Today's snapshot
    const todayProgress = await Progress.findOne({ user: userId, goal: goal._id, date: today });

    // 2. Last 7 days trend (Fetch raw data)
    const sevenDaysAgo = new Date(today);
    sevenDaysAgo.setDate(today.getDate() - 7);

    const trendDocs = await Progress.find({
      user: userId,
      goal: goal._id,
      date: { $gte: sevenDaysAgo }
    }).sort({ date: 1 });

    // 3. Weekly Aggregates (Calculate based on ACTUAL active days)
    const totalDays = trendDocs.length || 1;
    const avgCompletion = trendDocs.reduce((sum, p) => sum + p.completionPercentage, 0) / totalDays;
    const totalTasksWeek = trendDocs.reduce((sum, p) => sum + p.totalTasks, 0);
    const completedTasksWeek = trendDocs.reduce((sum, p) => sum + p.completedTasks, 0);
    const rolledOverWeek = trendDocs.reduce((sum, p) => sum + p.rolledOverTasks, 0);

    let levelSuggestion = "none";
    if (avgCompletion >= 80) levelSuggestion = "upgrade";
    else if (avgCompletion <= 40) levelSuggestion = "downgrade";

    // 4. Overall aggregates
    const allProgress = await Progress.find({ user: userId, goal: goal._id });
    const totalCompletedTasksOverall = allProgress.reduce((sum, p) => sum + p.completedTasks, 0);
    const totalTasksGeneratedOverall = allProgress.reduce((sum, p) => sum + p.totalTasks, 0);
    const overallCompletionPercentage = totalTasksGeneratedOverall > 0
      ? Math.round((totalCompletedTasksOverall / totalTasksGeneratedOverall) * 100)
      : 0;

    // 5. Construct full 7-day trend for UI (Backfilling empty days)
    const fullTrend = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(today.getDate() - i);
      d.setHours(0, 0, 0, 0);

      // Find matching doc safely comparing time
      const doc = trendDocs.find(p => new Date(p.date).getTime() === d.getTime());

      fullTrend.push({
        date: d,
        percentage: doc ? doc.completionPercentage : 0,
        tasks: doc ? doc.totalTasks : 0
      });
    }

    res.json({
      activeGoal: goal.title,
      today: todayProgress || { completionPercentage: 0, completedTasks: 0, totalTasks: 0, pendingTasks: 0, rolledOverTasks: 0 },
      weekly: {
        averageCompletion: Math.round(avgCompletion),
        totalTasks: totalTasksWeek,
        completedTasks: completedTasksWeek,
        rolledOverTasks: rolledOverWeek,
        totalDays: trendDocs.length
      },
      weeklyReflections: {
        totalJournals: await Journal.countDocuments({ user: userId, date: { $gte: sevenDaysAgo } }),
        mostFrequentMood: await (async () => {
          const moods = await Journal.aggregate([
            { $match: { user: new mongoose.Types.ObjectId(userId), date: { $gte: sevenDaysAgo } } },
            { $group: { _id: "$sentiment", count: { $sum: 1 } } },
            { $sort: { count: -1 } },
            { $limit: 1 }
          ]);
          return moods.length ? moods[0]._id : "N/A";
        })()
      },
      overall: {
        completionPercentage: overallCompletionPercentage,
        totalCompletedTasks: totalCompletedTasksOverall,
        totalTasksGenerated: totalTasksGeneratedOverall
      },
      trend: fullTrend, // Return the filled 7-day array
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

