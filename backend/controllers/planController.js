const DailyPlan = require("../models/DailyPlan");
const Goal = require("../models/Goal");
const { generateDailyPlanWithAI } = require("../services/aiService");

// ===============================
// Generate today's plan with AI
// ===============================
const generateTodayPlan = async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // 1️⃣ Get active goal
    const goal = await Goal.findOne({
      user: req.user.id,
      isActive: true,
    });

    if (!goal) {
      return res.status(404).json({ message: "No active goal found" });
    }

    // 2️⃣ Check if today's plan already exists
    const existingPlan = await DailyPlan.findOne({
      user: req.user.id,
      date: today,
    });

    if (existingPlan) return res.json(existingPlan);

    // 3️⃣ Collect pending tasks from previous days
    const pendingPlans = await DailyPlan.find({
      user: req.user.id,
      date: { $lt: today },
      "tasks.isCompleted": false,
    });

    let pendingTasks = [];
    pendingPlans.forEach((plan) => {
      plan.tasks.forEach((task) => {
        if (!task.isCompleted) pendingTasks.push(task);
      });
    });

    // 4️⃣ Determine total hours for today
    const day = today.getDay();
    const totalHours =
      day === 0 || day === 6 ? goal.weekendHours : goal.weekdayHours;

    // 5️⃣ Generate AI plan
    const aiPlan = await generateDailyPlanWithAI({
      goalTitle: goal.title,
      skills: goal.skills,
      weekdayHours: goal.weekdayHours,
      weekendHours: goal.weekendHours,
      userPrompt: "",
    });

    // 6️⃣ Merge pending + AI tasks (avoid duplicates)
    let mergedTasks = [...pendingTasks];

    const existingKeys = new Set(
      mergedTasks.map((t) => `${t.skill}-${t.task}`)
    );

    aiPlan.forEach((t) => {
      const key = `${t.skill}-${t.task}`;
      if (!existingKeys.has(key)) mergedTasks.push(t);
    });

    // 7️⃣ Adjust duration if exceeding hours
    let totalDuration = mergedTasks.reduce(
      (sum, t) => sum + t.duration,
      0
    );

    if (totalDuration > totalHours) {
      const ratio = totalHours / totalDuration;
      mergedTasks = mergedTasks.map((t) => ({
        ...t,
        duration: Math.max(
          0.5,
          Math.round(t.duration * ratio * 2) / 2
        ),
      }));
    }

    // 8️⃣ Save plan
    const plan = await DailyPlan.create({
      user: req.user.id,
      goal: goal._id,
      date: today,
      tasks: mergedTasks,
    });

    res.status(201).json(plan);
  } catch (error) {
    console.error("Generate plan error:", error.message);
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

    const deletedPlan = await DailyPlan.findOneAndDelete({
      user: req.user.id,
      date: today,
    });

    if (!deletedPlan) {
      return res.status(404).json({ message: "No plan found for today" });
    }

    res.json({ message: "Today's plan deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ===============================
// Regenerate today's plan with AI
// ===============================
const regenerateTodayPlan = async (req, res) => {
  try {
    const { prompt: userPrompt = "" } = req.body;

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const goal = await Goal.findOne({
      user: req.user.id,
      isActive: true,
    });

    if (!goal) {
      return res.status(404).json({ message: "No active goal found" });
    }

    await DailyPlan.findOneAndDelete({
      user: req.user.id,
      date: today,
    });

    const aiPlan = await generateDailyPlanWithAI({
      goalTitle: goal.title,
      skills: goal.skills,
      weekdayHours: goal.weekdayHours,
      weekendHours: goal.weekendHours,
      userPrompt,
    });

    const newPlan = await DailyPlan.create({
      user: req.user.id,
      goal: goal._id,
      date: today,
      tasks: aiPlan,
    });

    res.status(201).json(newPlan);
  } catch (error) {
    console.error("Regenerate plan error:", error.message);
    res.status(500).json({ message: error.message });
  }
};

// ===============================
// Complete ONE task
// ===============================
const completeTask = async (req, res) => {
  try {
    const { planId, taskId } = req.params;

    const plan = await DailyPlan.findById(planId);
    if (!plan) return res.status(404).json({ message: "Plan not found" });

    const task = plan.tasks.id(taskId);
    if (!task) return res.status(404).json({ message: "Task not found" });

    task.isCompleted = true;
    await plan.save();

    res.json({ message: "Task completed", plan });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ===============================
// Complete ALL tasks
// ===============================
const completeAllTasks = async (req, res) => {
  try {
    const { planId } = req.params;

    const plan = await DailyPlan.findById(planId);
    if (!plan) return res.status(404).json({ message: "Plan not found" });

    plan.tasks.forEach((task) => (task.isCompleted = true));
    await plan.save();

    res.json({ message: "All tasks completed", plan });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  generateTodayPlan,
  deleteTodayPlan,
  regenerateTodayPlan,
  completeTask,
  completeAllTasks,
};
