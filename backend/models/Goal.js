const mongoose = require("mongoose");

const goalSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    target: {
      type: String,
      required: true,
    },
    preparationMode: {
      type: String,
      enum: ["placement", "competitive", "skill-switch", "interview", "competitive-exam", "language-cert", "other"],
      required: true,
    },
    level: {
      type: String,
      enum: ["Beginner", "Intermediate", "Advanced"],
      required: true,
    },
    skills: [
      {
        name: { type: String, required: true },
        priority: { type: Number, required: true }
      }
    ]
    ,
    weekdayHours: {
      type: Number,
      required: true,
    },
    weekendHours: {
      type: Number,
      required: true,
    },
    dayEndTime: {
      type: String, // "21:00" format
      required: true,
      default: "21:00"
    },
    deadline: {
      type: Date,
      required: true,
    },
    duration: {
      type: String,
    },
    summaryPlan: {
      weeklyStructure: [Object],
      focusAreas: [String],
      skillDistribution: [Object],
      dailyEffort: String,
      strategy: String,
    },
    status: {
      type: String,
      enum: ["draft", "accepted"],
      default: "draft",
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    weakAreas: [String],
  },
  { timestamps: true }
);

goalSchema.index({ user: 1, isActive: -1 });
goalSchema.index({ preparationMode: 1 });

module.exports = mongoose.model("Goal", goalSchema);
