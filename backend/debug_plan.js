const mongoose = require("mongoose");
const path = require("path");
require("dotenv").config({ path: path.join(__dirname, ".env") });
const DailyPlan = require("./models/DailyPlan");

async function checkPlan() {
    try {
        console.log("Connecting to:", process.env.MONGO_URI);
        await mongoose.connect(process.env.MONGO_URI);
        const planId = "6982dca6eceabfbdd0298818";
        const taskId = "6982dca6eceabfbdd029881a";

        const plan = await DailyPlan.findById(planId);
        if (!plan) {
            console.log("Plan NOT found");
            process.exit(0);
        }

        console.log("Plan found. Date:", plan.date);
        console.log("Tasks count:", plan.tasks.length);

        const taskIndex = plan.tasks.findIndex(t => t._id.toString() === taskId);
        if (taskIndex !== -1) {
            const task = plan.tasks[taskIndex];
            console.log("Task found:", task.task);
            console.log("Task current status:", task.isCompleted);
        } else {
            console.log("Task NOT found in plan. Available task IDs:", plan.tasks.map(t => t._id.toString()));
        }

        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}

checkPlan();
