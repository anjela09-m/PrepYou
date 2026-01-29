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
      enum: ["placement", "competitive", "skill-switch", "interview"],
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
    deadline: {
      type: Date,
      required: true,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Goal", goalSchema);
