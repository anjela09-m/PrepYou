const mongoose = require("mongoose");
const Goal = require("../models/Goal");
const { generateSummaryPlanWithAI } = require("../services/aiService");
const path = require("path");
require("dotenv").config({ path: path.join(__dirname, "../.env") });

async function fixGoalSummary() {
    try {
        if (!process.env.MONGO_URI) {
            throw new Error("MONGO_URI is not defined in .env file");
        }
        await mongoose.connect(process.env.MONGO_URI);
        console.log("✅ Connected to MongoDB");

        // Find all goals with potentially malformed summary plans
        const goals = await Goal.find({});
        console.log(`📊 Found ${goals.length} goal(s)`);

        for (const goal of goals) {
            console.log(`\n🔍 Checking goal: ${goal.title}`);

            // Check if summary plan has issues
            const hasIssues =
                !goal.summaryPlan ||
                !goal.summaryPlan.strategy ||
                goal.summaryPlan.strategy.includes('"""') ||
                !goal.summaryPlan.weeklyStructure ||
                goal.summaryPlan.weeklyStructure.length === 0;

            if (hasIssues) {
                console.log(`⚠️  Found issues with summary plan. Regenerating...`);

                // Calculate duration if missing
                let duration = goal.duration;
                if (!duration && goal.deadline) {
                    const days = Math.ceil((new Date(goal.deadline) - new Date(goal.createdAt)) / (1000 * 60 * 60 * 24));
                    const weeks = Math.ceil(days / 7);
                    duration = `${weeks} weeks`;
                }

                // Regenerate summary plan
                const newSummaryPlan = await generateSummaryPlanWithAI({
                    goalTitle: goal.title,
                    target: goal.target,
                    preparationMode: goal.preparationMode,
                    level: goal.level,
                    duration: duration || "4 weeks",
                    skills: goal.skills,
                });

                goal.summaryPlan = newSummaryPlan;
                goal.duration = duration || "4 weeks";
                await goal.save();

                console.log(`✅ Successfully regenerated summary plan for: ${goal.title}`);
                console.log(`   Strategy: ${newSummaryPlan.strategy.substring(0, 100)}...`);
            } else {
                console.log(`✅ Summary plan looks good for: ${goal.title}`);
            }
        }

        console.log("\n🎉 All goals checked and fixed!");
        process.exit(0);
    } catch (error) {
        console.error("❌ Error:", error);
        process.exit(1);
    }
}

fixGoalSummary();
