const mongoose = require("mongoose");
require("dotenv").config({ path: "./backend/.env" });
const DailyPlan = require("./backend/models/DailyPlan");

async function checkPlan() {
    try {
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

        const task = plan.tasks.id(taskId);
        if (task) {
            console.log("Task found:", task.task);
            console.log("Task current status:", task.isCompleted);
        } else {
            console.log("Task NOT found in plan");
        }

        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}

checkPlan();
