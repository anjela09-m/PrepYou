const mongoose = require("mongoose");
const Goal = require("../models/Goal");
require("dotenv").config();
mongoose.connect(process.env.MONGO_URI).then(async () => {
    const goals = await Goal.find();
    goals.forEach(g => {
        console.log(`G:${g.title}|S:${g.status}|P:${g.summaryPlan ? "Y" : "N"}`);
    });
    process.exit(0);
});
