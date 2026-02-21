const User = require("../models/User");
const Goal = require("../models/Goal");
const DailyPlan = require("../models/DailyPlan");
const Progress = require("../models/Progress");
const Subscription = require("../models/Subscription");
const Journal = require("../models/Journal");

const getAllUsers = async (req, res) => {
    try {
        const users = await User.find({}).select("name email role isBlocked lastActiveAt createdAt");
        res.json(users);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const blockUser = async (req, res) => {
    try {
        const user = await User.findById(req.params.id);
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }
        user.isBlocked = true;
        await user.save();
        res.json({ message: "User blocked successfully", user });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const unblockUser = async (req, res) => {
    try {
        const user = await User.findById(req.params.id);
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }
        user.isBlocked = false;
        await user.save();
        res.json({ message: "User unblocked successfully", user });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const getAllGoals = async (req, res) => {
    try {
        const goals = await Goal.find({})
            .populate("user", "name email")
            .select("user preparationMode level status createdAt title");
        res.json(goals);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const getStats = async (req, res) => {
    try {
        const totalUsers = await User.countDocuments({});

        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

        const activeUsers = await User.countDocuments({
            lastActiveAt: { $gte: sevenDaysAgo }
        });

        const totalGoals = await Goal.countDocuments({});
        const activeGoals = await Goal.countDocuments({ isActive: true });
        const completedGoals = await Goal.countDocuments({ isActive: false });

        // Calculate average completion rate from Progress model
        const progressStats = await Progress.aggregate([
            {
                $group: {
                    _id: null,
                    avgCompletion: { $avg: "$completionPercentage" }
                }
            }
        ]);
        const averageCompletionRate = progressStats.length > 0 ? Math.round(progressStats[0].avgCompletion) : 0;

        // Most popular goal type
        const goalTypeStats = await Goal.aggregate([
            {
                $group: {
                    _id: "$preparationMode",
                    count: { $sum: 1 }
                }
            },
            { $sort: { count: -1 } },
            { $limit: 1 }
        ]);
        const mostPopularGoalType = goalTypeStats.length > 0 ? goalTypeStats[0]._id : "N/A";

        // Subscription Stats
        const freeUsers = await Subscription.countDocuments({ planType: "free" });
        const proUsers = await Subscription.countDocuments({ planType: "pro" });
        const revenue = (proUsers * 199); // Mock revenue based on active pro users * price

        res.json({
            totalUsers,
            activeUsers,
            totalGoals,
            activeGoals,
            completedGoals,
            averageCompletionRate,
            mostPopularGoalType,
            freeUsers,
            proUsers,
            revenue,
            totalAIAnalyses: await Journal.countDocuments({ sentiment: { $ne: "neutral" } }) // Approximate
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const getAllDailyPlans = async (req, res) => {
    try {
        const plans = await DailyPlan.find({})
            .populate("user", "name email")
            .populate("goal", "title")
            .sort({ date: -1 })
            .limit(100);
        res.json(plans);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
    getAllUsers,
    blockUser,
    unblockUser,
    getAllGoals,
    getAllDailyPlans,
    getStats,
};
