const Goal = require("../models/Goal");
const { generateSkillsWithAI } = require("../services/aiService");

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
      weekdayHours,
      weekendHours,
      skills,
      level,
      isActive,
    } = req.body;

    let finalSkills = skills;

    /**
     * CASE 1:
     * User did NOT provide any skills
     * → Use AI to generate skills + priority
     */
    if (!skills || skills.length === 0) {
      finalSkills = await generateSkillsWithAI({
        target,
        preparationMode,
        level,
        deadline,
        weekdayHours,
        weekendHours,
      });
    }

    /**
     * CASE 2:
     * User provided skills but NO priority
     * → Use AI to assign priority
     */
    else if (skills.some((skill) => !skill.priority)) {
      const skillNames = skills.map((skill) => skill.name);

      finalSkills = await generateSkillsWithAI({
        target,
        preparationMode,
        level,
        deadline,
        weekdayHours,
        weekendHours,
        providedSkills: skillNames,
      });
    }

    /**
     * CASE 3:
     * User provided skills + priority
     * → Use as-is (NO AI)
     */

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
      weekdayHours,
      weekendHours,
      skills: finalSkills,
      level,
      isActive: isActive !== false,
    });

    res.status(201).json({
      message: "Goal created successfully",
      goal,
    });
  } catch (error) {
    console.error(error);
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

module.exports = {
  createGoal,
  getActiveGoal,
  getAllGoals,
};
