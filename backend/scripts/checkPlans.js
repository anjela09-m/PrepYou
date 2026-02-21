const mongoose = require("mongoose");
const DailyPlan = require("../models/DailyPlan");
const Goal = require("../models/Goal");
require("dotenv").config();

const checkPlans = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log("Connected to MongoDB");

        const plans = await DailyPlan.find().populate("user", "email");
        console.log(`\nFound ${plans.length} total daily plans:\n`);

        plans.forEach(p => {
            console.log(`User: ${p.user?.email || "UNKNOWN"}`);
            console.log(`Date: ${p.date.toDateString()}`);
            console.log(`Tasks: ${p.tasks.length}`);
            console.log(`Accepted: ${p.isAccepted}`);
            console.log("-------------------");
        });

        process.exit(0);
    } catch (error) {
        console.error("Error checking plans:", error);
        process.exit(1);
    }
};

checkPlans();
