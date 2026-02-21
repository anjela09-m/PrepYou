const mongoose = require("mongoose");
const dotenv = require("dotenv");
const path = require("path");
const Progress = require("../models/Progress");
const Goal = require("../models/Goal");
const User = require("../models/User");

// Load backend .env
dotenv.config({ path: path.join(__dirname, "../.env") });

const seedProgress = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log("✅ Connected to MongoDB");

        // 1. Find a target user & goal
        // Try to find the first user with an active goal
        const goals = await Goal.find({ isActive: true }).populate("user");

        if (goals.length === 0) {
            console.error("❌ No active goals found in the database. Please create a goal first via the dashboard.");
            process.exit(1);
        }

        // Use the first found active goal
        const targetGoal = goals[0];
        const targetUser = targetGoal.user;

        if (!targetUser) {
            console.error("❌ Found a goal but no associated user?");
            process.exit(1);
        }

        console.log(`🎯 Seeding progress for User: ${targetUser.name} (${targetUser.email})`);
        console.log(`🎯 Goal: ${targetGoal.title}`);

        // 2. Generate last 7 days of data
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        console.log("🔄 Clearing existing progress for the last 7 days...");

        // Clear recent history to avoid conflicts
        await Progress.deleteMany({
            user: targetUser._id,
            goal: targetGoal._id,
            date: { $gt: new Date(today.getTime() - 8 * 24 * 60 * 60 * 1000) }
        });

        const progressEntries = [];

        // Generate for Day -7 to Day -1 (Yesterday)
        // We leave "Today" empty or let the app handle it
        for (let i = 7; i >= 1; i--) {
            const date = new Date(today);
            date.setDate(today.getDate() - i);
            date.setHours(0, 0, 0, 0);

            // Randomize performance
            // High randomness to show graph variation
            const totalTasks = Math.floor(Math.random() * 3) + 4; // 4 to 6 tasks
            // Random completion % between 20% and 100%
            const completionPercentage = Math.floor(Math.random() * 80) + 20;
            const completedTasks = Math.round((completionPercentage / 100) * totalTasks);
            const pendingTasks = Math.max(0, totalTasks - completedTasks); // Simplified
            const rolledOverTasks = Math.floor(Math.random() * 2);

            progressEntries.push({
                user: targetUser._id,
                goal: targetGoal._id,
                date: date,
                totalTasks,
                completedTasks,
                pendingTasks,
                rolledOverTasks,
                completionPercentage,
                overloadDetected: completionPercentage < 40
            });
        }

        await Progress.insertMany(progressEntries);

        console.log("✨ Successfully planted 7 days of fake history!");
        console.log("📊 Go to your Dashboard > Progress View to see the new graph.");

        process.exit(0);

    } catch (error) {
        console.error("❌ Error seeding progress:", error);
        process.exit(1);
    }
};

seedProgress();
