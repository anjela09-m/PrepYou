const mongoose = require("mongoose");
const DailyPlan = require("../models/DailyPlan");
const Goal = require("../models/Goal");
const Journal = require("../models/Journal");
const { generateDailyPlanWithAI, generatePersonalizedMotivationWithAI } = require("../services/aiService");
const { updateProgressAfterTask } = require("./progressController");

// ===============================
// Generate today's plan
// ===============================
const generateTodayPlan = async (req, res) => {
  console.log("✅ generateTodayPlan HIT");

  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // 1️⃣ Active goal
    const goal = await Goal.findOne({ user: req.user.id, isActive: true });
    if (!goal) return res.status(404).json({ message: "No active goal found" });

    // 2️⃣ Existing plan?
    let existingPlan = await DailyPlan.findOne({ user: req.user.id, date: today });

    // If plan exists, check if it matches the current ACTIVE goal
    if (existingPlan) {
      if (existingPlan.goal.toString() !== goal._id.toString()) {
        console.log("♻️ Found plan for older goal. Deleting and regenerating...");
        await DailyPlan.findByIdAndDelete(existingPlan._id);
        existingPlan = null; // Proceed to generate new plan
      } else {
        return res.json(existingPlan);
      }
    }

    // 3️⃣ Roll-over logic: Fetch yesterday's plan
    const yesterday = new Date(today);
    yesterday.setDate(today.getDate() - 1);

    const yesterdayPlan = await DailyPlan.findOne({ user: req.user.id, date: yesterday });
    let rolledOverTasks = [];
    if (yesterdayPlan) {
      rolledOverTasks = yesterdayPlan.tasks
        .filter(task => !task.isCompleted)
        .map(task => ({
          skill: task.skill,
          task: task.task,
          duration: task.duration,
          priority: task.priority,
          isCompleted: false,
          isRolledOver: true,
          originalDate: task.originalDate || yesterday
        }));
    }

    // 4️⃣ Total hours for today
    const day = today.getDay();
    const dailyHoursBudget = day === 0 || day === 6 ? (goal.weekendHours || 4) : (goal.weekdayHours || 2);

    // Calculate time consumed by rolled tasks (in hours)
    const rolledMinutes = rolledOverTasks.reduce((acc, t) => acc + (t.duration || 0), 0);
    const rolledHours = rolledMinutes / 60;

    // Calculate remaining time for AI to fill
    // Ensure we ask for at least 20 mins if we aren't totally over budget, else 0
    let remainingHours = dailyHoursBudget - rolledHours;
    if (remainingHours < 0.3) remainingHours = 0; // If less than ~20 mins left, don't ask AI for more tasks

    // 5️⃣ Ensure skills exist
    const skillsForAI = goal.skills && goal.skills.length ? goal.skills : [
      { name: goal.title || "General Prep", priority: 1 }
    ];

    // 5.5 Fetch recent sentiment & stats for adaptation
    const latestJournal = await Journal.findOne({ user: req.user.id }).sort({ date: -1 });
    const sentiment = latestJournal ? latestJournal.sentiment : "neutral";

    let adaptationPrompt = "";
    if (yesterdayPlan && yesterdayPlan.completionPercentage !== undefined) {
      adaptationPrompt = `User completion rate yesterday: ${yesterdayPlan.completionPercentage}%.`;
    }

    let aiTasks = [];
    if (remainingHours >= 0.3) {
      aiTasks = await generateDailyPlanWithAI({
        goalTitle: goal.title,
        skills: skillsForAI,
        weekdayHours: remainingHours, // Passing the REMAINING time budget
        weekendHours: 0,
        userPrompt: `${adaptationPrompt} Focus on remaining ${Math.round(remainingHours * 60)} minutes.`,
        sentiment
      });
    }

    const motivation = await generatePersonalizedMotivationWithAI({
      goalTitle: goal.title,
      completedToday: 0,
      totalToday: aiTasks.length + rolledOverTasks.length,
      sentiment
    });

    // 7️⃣ Combine AI tasks with Rolled-over tasks
    const allTasks = [...rolledOverTasks, ...aiTasks.map(t => ({ ...t, originalDate: today }))];

    // 8️⃣ Save plan (Draft initially)
    const plan = await DailyPlan.create({
      user: req.user.id,
      goal: goal._id,
      date: today,
      tasks: allTasks,
      dailyMotivation: motivation,
      isAccepted: false
    });

    // Update progress entry for the new day
    await updateProgressAfterTask(req.user.id, goal._id, today);

    res.status(201).json(plan);
  } catch (error) {
    console.error("Generate plan error:", error);
    res.status(500).json({ message: error.message });
  }
};

// ===============================
// Regenerate today's plan
// ===============================
const regenerateTodayPlan = async (req, res) => {
  try {
    const { prompt = "" } = req.body;
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const existingPlan = await DailyPlan.findOne({ user: req.user.id, date: today });
    // Allow regeneration even if accepted (User request)
    // if (existingPlan && existingPlan.isAccepted) {
    //   return res.status(400).json({ message: "Cannot regenerate an accepted plan. It is locked for the day." });
    // }

    const goal = await Goal.findOne({ user: req.user.id, isActive: true });
    if (!goal) return res.status(404).json({ message: "No active goal found" });

    // Keep rolled over tasks when regenerating
    const rolledOverTasks = existingPlan ? existingPlan.tasks.filter(t => t.isRolledOver) : [];

    await DailyPlan.findOneAndDelete({ user: req.user.id, date: today });

    const skillsForAI = goal.skills && goal.skills.length ? goal.skills : [
      { name: "DSA", priority: 1 },
      { name: "Java", priority: 2 },
      { name: "Aptitude", priority: 3 }
    ];

    // Fetch recent sentiment
    const latestJournal = await Journal.findOne({ user: req.user.id }).sort({ date: -1 });
    const sentiment = latestJournal ? latestJournal.sentiment : "neutral";

    const aiTasks = await generateDailyPlanWithAI({
      goalTitle: goal.title,
      skills: skillsForAI,
      weekdayHours: goal.weekdayHours,
      weekendHours: goal.weekendHours,
      userPrompt: prompt,
      sentiment
    });

    const { generatePersonalizedMotivationWithAI } = require("../services/aiService");
    const motivation = await generatePersonalizedMotivationWithAI({
      goalTitle: goal.title,
      completedToday: 0,
      totalToday: aiTasks.length + rolledOverTasks.length,
      sentiment
    });

    const allTasks = [...rolledOverTasks, ...aiTasks.map(t => ({ ...t, originalDate: today }))];

    const plan = await DailyPlan.create({
      user: req.user.id,
      goal: goal._id,
      date: today,
      tasks: allTasks,
      dailyMotivation: motivation,
      isAccepted: false
    });

    await updateProgressAfterTask(req.user.id, goal._id, today);

    res.status(201).json(plan);
  } catch (error) {
    console.error("Regenerate plan error:", error);
    res.status(500).json({ message: error.message });
  }
};

// ===============================
// Accept today's plan
// ===============================
const acceptPlan = async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const plan = await DailyPlan.findOne({ user: req.user.id, date: today });
    if (!plan) return res.status(404).json({ message: "No plan found to accept" });

    if (plan.isAccepted) return res.status(400).json({ message: "Plan already accepted" });

    plan.isAccepted = true;
    plan.acceptedAt = new Date();
    await plan.save();

    await updateProgressAfterTask(req.user.id, plan.goal, today);

    res.json({ message: "Plan accepted successfully", plan });
  } catch (error) {
    console.error("Accept plan error:", error);
    res.status(500).json({ message: error.message });
  }
};

// ===============================
// Delete today's plan
// ===============================
const deleteTodayPlan = async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const goal = await Goal.findOne({ user: req.user.id, isActive: true });
    const deleted = await DailyPlan.findOneAndDelete({ user: req.user.id, date: today });
    if (!deleted) return res.status(404).json({ message: "No plan found" });

    if (goal) {
      await updateProgressAfterTask(req.user.id, goal._id, today);
    }

    res.json({ message: "Today's plan deleted" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Complete ONE task (Toggled)
const completeTask = async (req, res) => {
  const { planId, taskId } = req.params;
  console.log(`🎯 Toggle Task: Plan [${planId}] Task [${taskId}]`);

  try {
    // 1. Validate ObjectIds
    if (!mongoose.Types.ObjectId.isValid(planId) || !mongoose.Types.ObjectId.isValid(taskId)) {
      console.log("❌ Invalid ObjectId format received");
      return res.status(400).json({ message: "Invalid ID format" });
    }

    // 2. Find the plan and the current task state
    const plan = await DailyPlan.findById(planId);
    if (!plan) {
      console.log("❌ Plan not found");
      return res.status(404).json({ message: "Plan not found" });
    }

    const task = plan.tasks.id(taskId);
    if (!task) {
      console.log("❌ Task not found in plan");
      return res.status(404).json({ message: "Task not found" });
    }

    const newStatus = !task.isCompleted;
    console.log(`🔄 Toggling from ${task.isCompleted} to ${newStatus}`);

    // 3. Perform atomic update to avoid validation/middleware crashes
    const updatedPlan = await DailyPlan.findOneAndUpdate(
      { _id: planId, "tasks._id": taskId },
      { $set: { "tasks.$.isCompleted": newStatus } },
      { new: true, runValidators: false } // Skip validators to fix existing "bad" data
    );

    if (!updatedPlan) {
      throw new Error("Failed to update plan document atomically");
    }

    console.log("✅ Task toggled successfully");

    // 4. Update progress (Non-blocking)
    updateProgressAfterTask(updatedPlan.user.toString(), updatedPlan.goal.toString(), updatedPlan.date)
      .catch(err => console.error("⚠️ Background Progress Update failed:", err.message));

    return res.json({
      message: `Task ${newStatus ? "completed" : "uncompleted"}`,
      plan: updatedPlan
    });

  } catch (error) {
    console.error("💥 Controller Crash:", error);
    return res.status(500).json({
      message: "Server encountered an error while updating task",
      error: error.message,
      stack: error.stack
    });
  }
};

// Complete ALL tasks
const completeAllTasks = async (req, res) => {
  const { planId } = req.params;
  console.log(`🎯 Complete All Tasks for plan [${planId}]`);

  try {
    if (!mongoose.Types.ObjectId.isValid(planId)) {
      return res.status(400).json({ message: "Invalid Plan ID format" });
    }

    // 1. Update all tasks in the plan atomically
    const updatedPlan = await DailyPlan.findOneAndUpdate(
      { _id: planId },
      { $set: { "tasks.$[].isCompleted": true } },
      { new: true, runValidators: false }
    );

    if (!updatedPlan) {
      return res.status(404).json({ message: "Plan not found" });
    }

    console.log("✅ All tasks marked completed");

    // 2. Update progress (Non-blocking)
    updateProgressAfterTask(updatedPlan.user.toString(), updatedPlan.goal.toString(), updatedPlan.date)
      .catch(err => console.error("⚠️ Background Progress Update failed:", err.message));

    return res.json({ message: "All tasks completed", plan: updatedPlan });
  } catch (error) {
    console.error("💥 Controller Crash (completeAll):", error);
    return res.status(500).json({
      message: "Server error during tasks update",
      error: error.message
    });
  }
};

// ===============================
// Submit Today's Day (LOCK & FINALIZE)
// ===============================
const submitDay = async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // 1️⃣ Find today's plan
    const plan = await DailyPlan.findOne({ user: req.user.id, date: today });
    if (!plan) return res.status(404).json({ message: "No plan found for today" });

    // 2️⃣ Prevent double submission
    if (plan.status === "SUBMITTED") {
      return res.status(400).json({ message: "Today's plan is already submitted" });
    }

    // 3️⃣ Calculate final completion percentage
    const completedCount = plan.tasks.filter(t => t.isCompleted).length;
    const totalCount = plan.tasks.length || 1;
    const completionPercentage = Math.round((completedCount / totalCount) * 100);

    // 4️⃣ Update plan to SUBMITTED
    plan.status = "SUBMITTED";
    plan.submittedAt = new Date();
    plan.completionPercentage = completionPercentage;
    await plan.save();

    // 5️⃣ Update progress tracking
    await updateProgressAfterTask(req.user.id, plan.goal, today);

    // 6️⃣ Identify pending tasks for roll-over
    const pendingTasks = plan.tasks.filter(t => !t.isCompleted);

    // 7️⃣ Create tomorrow's plan with rolled-over tasks
    const tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 1);

    const existingTomorrowPlan = await DailyPlan.findOne({ user: req.user.id, date: tomorrow });

    if (!existingTomorrowPlan) {
      const goal = await Goal.findById(plan.goal);

      // --- Time Budget Logic ---
      const isWeekend = tomorrow.getDay() === 0 || tomorrow.getDay() === 6;
      const dailyHoursBudget = isWeekend ? (goal.weekendHours || 4) : (goal.weekdayHours || 2);

      const rolledTasks = pendingTasks.map(t => ({
        skill: t.skill,
        task: t.task,
        duration: t.duration,
        priority: t.priority,
        isCompleted: false,
        isRolledOver: true,
        originalDate: t.originalDate || today
      }));

      // Calculate time consumed by rolled tasks (in hours)
      const rolledMinutes = rolledTasks.reduce((acc, t) => acc + (t.duration || 0), 0);
      const rolledHours = rolledMinutes / 60;

      // Calculate remaining time for AI to fill
      // Ensure we ask for at least 20 mins if we aren't totally over budget, else 0
      let remainingHours = dailyHoursBudget - rolledHours;
      if (remainingHours < 0.3) remainingHours = 0; // If less than ~20 mins left, don't ask AI for more tasks

      let aiTasks = [];
      if (remainingHours >= 0.3) {
        const latestJournal = await Journal.findOne({ user: req.user.id }).sort({ date: -1 });
        const sentiment = latestJournal ? latestJournal.sentiment : "neutral";

        const skillsForAI = goal.skills && goal.skills.length ? goal.skills : [
          { name: "General", priority: 1 }
        ];

        // We pass 'remainingHours' as weekdayHours because aiService uses the first argument it finds.
        // This ensures the AI respects the adjusted budget.
        aiTasks = await generateDailyPlanWithAI({
          goalTitle: goal.title,
          skills: skillsForAI,
          weekdayHours: remainingHours,
          weekendHours: 0,
          userPrompt: `Focus on remaining ${Math.round(remainingHours * 60)} minutes.`,
          sentiment
        });
      }

      const motivation = await generatePersonalizedMotivationWithAI({
        goalTitle: goal.title,
        completedToday: 0,
        totalToday: aiTasks.length + rolledTasks.length,
        sentiment: "neutral" // default for tomorrow
      });

      const allTasks = [...rolledTasks, ...aiTasks.map(t => ({ ...t, originalDate: tomorrow }))];

      await DailyPlan.create({
        user: req.user.id,
        goal: goal._id,
        date: tomorrow,
        tasks: allTasks,
        dailyMotivation: motivation,
        status: "PLANNED",
        isAccepted: false
      });
    }

    res.json({
      message: "Day submitted successfully! 🎉",
      completionPercentage,
      completedTasks: completedCount,
      totalTasks: totalCount,
      pendingTasksRolledOver: pendingTasks.length
    });
  } catch (error) {
    console.error("Submit day error:", error);
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  generateTodayPlan,
  regenerateTodayPlan,
  acceptPlan,
  deleteTodayPlan,
  completeTask,
  completeAllTasks,
  submitDay
};

