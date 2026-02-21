const Goal = require("../models/Goal");
const { generateSkillsWithAI, generateSummaryPlanWithAI } = require("../services/aiService");

// @desc   Create a new goal
// @route  POST /api/goals
// @access Private
const createGoal = async (req, res) => {
  try {
    const {
      title,
      target,
      preparationMode,
      deadline,
      duration,
      weekdayHours,
      weekendHours,
      skills,
      level,
      isActive,
      weakAreas,
    } = req.body;

    let finalSkills = skills;

    // 1. Generate skills if missing
    if (!skills || skills.length === 0) {
      finalSkills = await generateSkillsWithAI({
        target,
        preparationMode,
        level,
        deadline,
        weekdayHours,
        weekendHours,
        weakAreas,
      });
    }

    // 2. Map skills to include priority
    finalSkills = finalSkills.map((s, i) => ({
      name: s.name,
      priority: s.priority || i + 1,
    }));

    // 3. Generate Summary Plan
    const summaryPlan = await generateSummaryPlanWithAI({
      goalTitle: title,
      target,
      preparationMode,
      level,
      duration,
      skills: finalSkills,
    });

    // Deactivate previous active goals
    if (isActive !== false) {
      await Goal.updateMany(
        { user: req.user.id, isActive: true },
        { isActive: false }
      );
    }

    const goal = await Goal.create({
      user: req.user.id,
      title,
      target,
      preparationMode,
      deadline,
      duration,
      weekdayHours,
      weekendHours,
      skills: finalSkills,
      level,
      isActive: isActive !== false,
      summaryPlan,
      status: "draft",
      weakAreas,
    });

    res.status(201).json({
      message: "Goal created successfully. Please review the summary plan.",
      goal,
    });
  } catch (error) {
    console.error("Create Goal error:", error.message);
    res.status(500).json({ message: error.message });
  }
};

// @desc    Accept goal summary plan
// @route   POST /api/goals/:id/accept
// @access  Private
const acceptGoal = async (req, res) => {
  try {
    const goal = await Goal.findById(req.params.id);
    if (!goal) return res.status(404).json({ message: "Goal not found" });

    goal.status = "accepted";
    await goal.save();

    res.json({ message: "Goal plan accepted!", goal });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Regenerate goal summary plan
// @route   POST /api/goals/:id/regenerate
// @access  Private
const regenerateGoalPlan = async (req, res) => {
  try {
    const { prompt } = req.body;
    const goal = await Goal.findById(req.params.id);
    if (!goal) return res.status(404).json({ message: "Goal not found" });

    const newSummaryPlan = await generateSummaryPlanWithAI({
      goalTitle: goal.title,
      target: goal.target,
      preparationMode: goal.preparationMode,
      level: goal.level,
      duration: goal.duration,
      skills: goal.skills,
      userPrompt: prompt,
    });

    goal.summaryPlan = newSummaryPlan;
    await goal.save();

    res.json({ message: "Goal plan regenerated!", goal });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get active goal
// @route   GET /api/goals/active
// @access  Private
const getActiveGoal = async (req, res) => {
  try {
    const goal = await Goal.findOne({
      user: req.user.id,
      isActive: true,
    });

    if (!goal) {
      return res.status(404).json({ message: "No active goal found" });
    }

    // Sort skills by priority
    goal.skills.sort((a, b) => a.priority - b.priority);

    res.json(goal);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get all goals
// @route   GET /api/goals
// @access  Private
const getAllGoals = async (req, res) => {
  try {
    const goals = await Goal.find({ user: req.user.id }).sort({
      createdAt: -1,
    });

    goals.forEach((goal) => {
      goal.skills.sort((a, b) => a.priority - b.priority);
    });

    res.json(goals);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update goal
// @route   PUT /api/goals/:id
// @access  Private
const updateGoal = async (req, res) => {
  try {
    const {
      title,
      target,
      preparationMode,
      deadline,
      weekdayHours,
      weekendHours,
      skills,
      level,
      weakAreas,
    } = req.body;

    const goal = await Goal.findById(req.params.id);
    if (!goal) return res.status(404).json({ message: "Goal not found" });

    // Check if goal belongs to user
    if (goal.user.toString() !== req.user.id) {
      return res.status(401).json({ message: "Not authorized" });
    }

    // Update fields
    goal.title = title || goal.title;
    goal.target = target || goal.target;
    goal.preparationMode = preparationMode || goal.preparationMode;
    goal.deadline = deadline || goal.deadline;
    goal.weekdayHours = weekdayHours !== undefined ? weekdayHours : goal.weekdayHours;
    goal.weekendHours = weekendHours !== undefined ? weekendHours : goal.weekendHours;
    goal.skills = skills || goal.skills;
    goal.level = level || goal.level;
    goal.weakAreas = weakAreas || goal.weakAreas;

    // Regenerate Summary Plan if core fields changed
    const summaryPlan = await generateSummaryPlanWithAI({
      goalTitle: goal.title,
      target: goal.target,
      preparationMode: goal.preparationMode,
      level: goal.level,
      skills: goal.skills,
    });

    goal.summaryPlan = summaryPlan;
    goal.status = "draft"; // Reset status to draft so user reviews new plan

    await goal.save();

    res.json({
      message: "Goal updated successfully.",
      goal,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  createGoal,
  acceptGoal,
  regenerateGoalPlan,
  getActiveGoal,
  getAllGoals,
  updateGoal,
};
