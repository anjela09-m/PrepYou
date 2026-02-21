const mongoose = require("mongoose");

const taskSchema = new mongoose.Schema({
  skill: { type: String, required: true, default: "General" },
  task: { type: String, required: true, default: "Study Session" },
  duration: { type: Number, required: true, default: 60 },
  priority: { type: Number, required: true, default: 1 },
  isCompleted: { type: Boolean, default: false },
  originalDate: { type: Date }, // For roll-over tracking
  isRolledOver: { type: Boolean, default: false }
});

const dailyPlanSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    goal: { type: mongoose.Schema.Types.ObjectId, ref: "Goal", required: true },
    date: { type: Date, required: true },
    tasks: [taskSchema],
    status: {
      type: String,
      enum: ["PLANNED", "IN_PROGRESS", "SUBMITTED"],
      default: "PLANNED",
    },
    submittedAt: {
      type: Date,
    },
    completionPercentage: {
      type: Number,
      default: 0,
    },
    feedback: {
      type: String,
      default: "",
    },
    isAccepted: {
      type: Boolean,
      default: false,
    },
    acceptedAt: {
      type: Date,
    },
    dailyMotivation: {
      type: String,
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model("DailyPlan", dailyPlanSchema);
