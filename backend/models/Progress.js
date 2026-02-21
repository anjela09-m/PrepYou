const mongoose = require("mongoose");

const progressSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    goal: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Goal",
      required: true,
    },

    date: {
      type: Date,
      required: true,
    },

    totalTasks: {
      type: Number,
      default: 0,
    },

    completedTasks: {
      type: Number,
      default: 0,
    },

    pendingTasks: {
      type: Number,
      default: 0,
    },

    rolledOverTasks: {
      type: Number,
      default: 0,
    },

    completionPercentage: {
      type: Number, // percentage
      default: 0,
    },

    streak: {
      type: Number,
      default: 0,
    },

    overloadDetected: {
      type: Boolean,
      default: false,
    },

    levelSuggestion: {
      type: String,
      enum: ["upgrade", "downgrade", "none"],
      default: "none",
    },

    sentimentScore: {
      type: Number, // optional
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Progress", progressSchema);
