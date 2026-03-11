const User = require("../models/User");
const Goal = require("../models/Goal");
const DailyPlan = require("../models/DailyPlan");
const Progress = require("../models/Progress");
const Subscription = require("../models/Subscription");
const Journal = require("../models/Journal");

const getAllUsers = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 20;
        const skip = (page - 1) * limit;

        const [users, total] = await Promise.all([
            User.find({})
                .select("name email role isBlocked lastActiveAt createdAt")
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(limit)
                .lean(),
            User.countDocuments({})
        ]);

        res.json({ users, total, page, totalPages: Math.ceil(total / limit) });
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
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 20;
        const skip = (page - 1) * limit;

        const [goals, total] = await Promise.all([
            Goal.find({})
                .populate("user", "name email")
                .select("user preparationMode level status createdAt title")
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(limit)
                .lean(),
            Goal.countDocuments({})
        ]);

        res.json({ goals, total, page, totalPages: Math.ceil(total / limit) });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const getStats = async (req, res) => {
    try {
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

        const [
            totalUsers,
            activeUsers,
            totalGoals,
            activeGoals,
            completedGoals,
            progressStats,
            goalTypeStats,
            freeUsers,
            proUsers,
            positiveSentiment,
            negativeSentiment,
            totalJournals,
            proUsersList,
            freeUsersList,
            activeUsersList,
            activeGoalsList,
            failedPlansCount,
            recentRegistrations
        ] = await Promise.all([
            User.countDocuments({}),
            User.countDocuments({ lastActiveAt: { $gte: sevenDaysAgo } }),
            Goal.countDocuments({}),
            Goal.countDocuments({ isActive: true }),
            Goal.countDocuments({ isActive: false }),
            Progress.aggregate([
                {
                    $group: {
                        _id: null,
                        avgCompletion: { $avg: "$completionPercentage" }
                    }
                }
            ]),
            Goal.aggregate([
                {
                    $group: {
                        _id: "$preparationMode",
                        count: { $sum: 1 }
                    }
                },
                { $sort: { count: -1 } },
                { $limit: 1 }
            ]),
            Subscription.countDocuments({ planType: "free" }),
            Subscription.countDocuments({ planType: "pro" }),
            Journal.countDocuments({ sentiment: "motivated" }),
            Journal.countDocuments({ sentiment: { $in: ["stressed", "demotivated"] } }),
            Journal.countDocuments({}),
            Subscription.find({ planType: "pro" }).populate("user", "name email").lean(),
            Subscription.find({ planType: "free" }).populate("user", "name email").lean(),
            User.find({ lastActiveAt: { $gte: sevenDaysAgo } }).select("name email lastActiveAt").lean(),
            Goal.find({ isActive: true }).populate("user", "name email").select("title preparationMode user status text").lean(),
            DailyPlan.countDocuments({ date: { $gte: sevenDaysAgo }, completionPercentage: 0 }),
            User.countDocuments({ createdAt: { $gte: sevenDaysAgo } })
        ]);

        const averageCompletionRate = progressStats.length > 0 ? Math.round(progressStats[0].avgCompletion) : 0;
        const mostPopularGoalType = goalTypeStats.length > 0 ? goalTypeStats[0]._id : "N/A";
        
        // Calculate dynamic revenue based on total amount paid by pro users
        // For backwards compatibility, assume older pro subs paid 199
        let revenue = 0;
        proUsersList.forEach(sub => {
            if (sub.amountPaid) {
                revenue += sub.amountPaid;
            } else {
                revenue += 199; // Default fallback for old subscriptions
            }
        });

        const systemAlerts = [];
        if (failedPlansCount > 5) systemAlerts.push({ id: 1, type: "warning", title: "Low Engagement", text: `${failedPlansCount} daily plans were abandoned with 0% completion this week.` });
        if (recentRegistrations > 0) systemAlerts.push({ id: 2, type: "success", title: "New Signups", text: `${recentRegistrations} new users registered in the last 7 days.` });
        if (negativeSentiment > 0 && negativeSentiment >= positiveSentiment) systemAlerts.push({ id: 3, type: "error", title: "High Burnout", text: `Platform sentiment is dipping. ${negativeSentiment} negative journal entries logged recently.` });
        if (systemAlerts.length === 0) systemAlerts.push({ id: 4, type: "info", title: "System OK", text: "All systems are operating normally. No critical issues to report." });

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
            positiveSentiment,
            negativeSentiment,
            totalJournals,
            proUsersList,
            freeUsersList,
            activeUsersList,
            activeGoalsList,
            systemAlerts
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const getAllDailyPlans = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 20;
        const skip = (page - 1) * limit;

        const [plans, total] = await Promise.all([
            DailyPlan.find({})
                .populate("user", "name email")
                .populate("goal", "title")
                .select("user goal date completionPercentage status createdAt")
                .sort({ date: -1 })
                .skip(skip)
                .limit(limit)
                .lean(),
            DailyPlan.countDocuments({})
        ]);

        res.json({ plans, total, page, totalPages: Math.ceil(total / limit) });
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
