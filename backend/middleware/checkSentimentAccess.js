const Subscription = require("../models/Subscription");

const checkSentimentAccess = async (req, res, next) => {
    try {
        const subscription = await Subscription.findOne({ user: req.user.id });

        if (!subscription) {
            // If no subscription found (e.g. old user), create a default free one
            const newSub = await Subscription.create({
                user: req.user.id,
                planType: "free",
                status: "active",
                usageLimit: 5,
                usageCount: 0,
                lastResetDate: new Date()
            });
            req.subscription = newSub;
            return next();
        }

        // Check if Pro
        if (subscription.planType === "pro" && subscription.status === "active") {
            // Check for expiry logic here if needed, but for now Pro is unlimited
            // If expired, downgrade logic should be handled by a cron or on access
            if (subscription.endDate && new Date() > subscription.endDate) {
                subscription.planType = "free";
                subscription.status = "expired";
                subscription.usageLimit = 5;
                subscription.usageCount = 0; // Reset usage for the new free period
                subscription.lastResetDate = new Date();
                await subscription.save();
                // Continue to free checks
            } else {
                req.subscription = subscription;
                return next();
            }
        }

        // Free Plan Checks
        const now = new Date();
        const lastReset = new Date(subscription.lastResetDate);
        const LIMIT = 10; // Updated limit to 10 per month

        // Check if month changed
        if (now.getMonth() !== lastReset.getMonth() || now.getFullYear() !== lastReset.getFullYear()) {
            subscription.usageCount = 0;
            subscription.lastResetDate = now;
            await subscription.save();
        }

        // Check if limit reached
        if (subscription.usageCount >= LIMIT) {
            // Do NOT block. Just disable sentiment.
            req.sentimentAllowed = false;
            req.limitReached = true;
        } else {
            req.sentimentAllowed = true;
            req.limitReached = false;
        }

        req.subscription = subscription;
        next();
    } catch (error) {
        console.error("Subscription check error:", error);
        // Fail open or closed? Let's fail open but disable AI to be safe, or just 500.
        // Better to fail safe.
        res.status(500).json({ message: "Server error checking subscription status" });
    }
};

module.exports = checkSentimentAccess;
