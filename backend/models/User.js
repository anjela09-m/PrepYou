const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },

    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
    },

    password: {
      type: String,
      required: true,
    },

    role: {
      type: String,
      enum: ["user", "admin"],
      default: "user",
    },
    preferredStudyTime: {
      type: String,
      enum: ["morning", "evening", "any"],
    },
    targetType: {
      type: String,
      enum: ["placements", "exams", "both"],
    },
    isBlocked: {
      type: Boolean,
      default: false,
    },
    lastActiveAt: {
      type: Date,
      default: Date.now,
    },
    preferences: {
      reminderTime: { type: String, default: "20:00" },
      aiEnabled: { type: Boolean, default: true }
    },
    stats: {
      tasksCompleted: { type: Number, default: 0 },
      daysActive: { type: Number, default: 0 }
    },
    reminders: [{
      id: { type: String, required: true }, // Ideally client-generated ID
      title: { type: String, required: true },
      time: { type: String, required: true }, // Format "09:00 AM"
      type: { type: String, enum: ['academic', 'revision', 'mindset', 'custom'], default: 'academic' },
      active: { type: Boolean, default: true }
    }]
  },
  { timestamps: true }
);

userSchema.index({ role: 1 });
userSchema.index({ lastActiveAt: -1 });

module.exports = mongoose.model("User", userSchema);
