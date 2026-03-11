const Journal = require("../models/Journal");
const Goal = require("../models/Goal");
const { generateSentimentWithAI, generatePersonalizedMotivationWithAI } = require("../services/aiService");
const Subscription = require("../models/Subscription");

// @desc    Create journal entry
// @route   POST /api/journals
// @access  Private
const createJournalEntry = async (req, res) => {
    try {
        const { content } = req.body;
        if (!content) return res.status(400).json({ message: "Content is required" });

        let sentiment = "neutral"; // Default sentiment if skipped
        let sentimentSkipped = false;

        // Check if AI is allowed (set by middleware)
        // If req.sentimentAllowed is undefined, assume true (e.g. for Pro users where it's not set explicitly false)
        // Actually, middleware sets it for Free users. For Pro, we need to ensure it runs.
        // Logic: 
        // If Pro -> always run
        // If Free -> run only if allowed

        const isPro = req.subscription && req.subscription.planType === "pro" && req.subscription.status === "active";
        const isFreeAllowed = req.subscription && req.subscription.planType === "free" && req.sentimentAllowed;

        // Safety: if subscription is missing (shouldn't happen due to middleware), default to allowed or blocked? 
        // Middleware ensures req.subscription exists.

        if (isPro || isFreeAllowed) {
            sentiment = await generateSentimentWithAI(content);

            // Increment usage ONLY if it was a Free user using the allowance
            if (!isPro && isFreeAllowed) {
                req.subscription.usageCount += 1;
                await req.subscription.save();
            }
        } else {
            sentimentSkipped = true;
            console.log(`⚠️ Sentiment analysis skipped for user ${req.user.id}: Limit Reached`);
        }

        const journal = await Journal.create({
            user: req.user.id,
            content,
            sentiment,
            date: new Date(),
        });

        // Generate motivational quote
        let motivationalQuote = "";
        try {
            const activeGoal = await Goal.findOne({ user: req.user.id, isActive: true });
            motivationalQuote = await generatePersonalizedMotivationWithAI({
                goalTitle: activeGoal ? activeGoal.title : "Your Journey",
                completedToday: 0, 
                totalToday: 0,
                sentiment: sentiment
            });
        } catch (err) {
            console.error("Motivation error", err);
            motivationalQuote = "Keep pushing forward, every step matters!";
        }

        res.status(201).json({
            ...journal.toObject(),
            sentimentSkipped,
            motivationalQuote,
            usageCount: req.subscription ? req.subscription.usageCount : 0,
            usageLimit: req.subscription ? req.subscription.usageLimit : 10
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get user journal entries
// @route   GET /api/journals
// @access  Private
const getJournalEntries = async (req, res) => {
    try {
        const journals = await Journal.find({ user: req.user.id }).sort({ date: -1 });
        res.json(journals);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get latest journal entry
// @route   GET /api/journals/latest
// @access  Private
const getLatestJournalEntry = async (req, res) => {
    try {
        const journal = await Journal.findOne({ user: req.user.id }).sort({ date: -1 });
        res.json(journal);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
    createJournalEntry,
    getJournalEntries,
    getLatestJournalEntry,
};
