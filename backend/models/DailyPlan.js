const mongoose = require("mongoose");

const taskSchema = new mongoose.Schema({
  skill: { type: String, required: true },
  duration: { type: Number, required: true }, // HOURS
  priority: { type: Number, required: true }, // 1 = highest
  isCompleted: { type: Boolean, default: false },
});

const dailyPlanSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    goal: { type: mongoose.Schema.Types.ObjectId, ref: "Goal", required: true },
    date: { type: Date, required: true },
    tasks: [taskSchema],
    status: {
      type: String,
      enum: ["pending", "completed"],
      default: "pending",
    },
    feedback: {
      type: String,
      default: "",
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("DailyPlan", dailyPlanSchema);
