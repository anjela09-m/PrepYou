const mongoose = require("mongoose");

const subscriptionSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
        unique: true
    },
    planType: {
        type: String,
        enum: ["free", "pro"],
        default: "free"
    },
    status: {
        type: String,
        enum: ["active", "expired", "cancelled"],
        default: "active"
    },
    startDate: {
        type: Date,
        default: Date.now
    },
    endDate: {
        type: Date
    },
    planDuration: {
        type: String,
        enum: ["monthly", "yearly"],
        default: "monthly"
    },
    amountPaid: {
        type: Number,
        default: 0
    },
    paymentId: {
        type: String
    },
    orderId: {
        type: String
    },
    usageCount: {
        type: Number,
        default: 0
    },
    usageLimit: {
        type: Number,
        default: 10 // Default limit for free users
    },
    lastResetDate: {
        type: Date,
        default: Date.now
    }
}, { timestamps: true });

module.exports = mongoose.model("Subscription", subscriptionSchema);
