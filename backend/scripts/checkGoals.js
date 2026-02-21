const mongoose = require("mongoose");
const Goal = require("../models/Goal");
const User = require("../models/User");
require("dotenv").config();

const checkGoals = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log("Connected to MongoDB");

        const goals = await Goal.find().populate("user", "name email");
        console.log(`\nFound ${goals.length} total goals in database:\n`);

        goals.forEach(g => {
            console.log(`Goal: ${g.title}`);
            console.log(`User: ${g.user?.email || "UNKNOWN"}`);
            console.log(`IsActive: ${g.isActive}`);
            console.log(`Status: ${g.status}`);
            console.log(`SummaryPlan: ${g.summaryPlan ? "Exists" : "MISSING"}`);
            if (g.summaryPlan) {
                console.log(`First Week: ${g.summaryPlan.weeklyStructure?.[0]?.focus || "N/A"}`);
            }
            console.log("-------------------");
        });

        process.exit(0);
    } catch (error) {
        console.error("Error checking goals:", error);
        process.exit(1);
    }
};

checkGoals();
