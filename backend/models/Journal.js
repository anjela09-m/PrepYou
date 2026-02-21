const mongoose = require("mongoose");

const journalSchema = new mongoose.Schema(
    {
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
        date: {
            type: Date,
            required: true,
            default: Date.now,
        },
        content: {
            type: String,
            required: true,
        },
        sentiment: {
            type: String,
            enum: ["motivated", "neutral", "stressed", "demotivated"],
            default: "neutral",
        },
        sentimentScore: {
            type: Number,
        },
    },
    { timestamps: true }
);

module.exports = mongoose.model("Journal", journalSchema);
