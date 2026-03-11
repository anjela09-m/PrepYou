const Razorpay = require("razorpay");
const crypto = require("crypto");
const Subscription = require("../models/Subscription");

require("dotenv").config();

const razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET,
});

// @desc    Create Razorpay Order
// @route   POST /api/subscription/create-order
// @access  Private
// @desc    Create Razorpay Order
// @route   POST /api/subscription/create-order
// @access  Private
const createOrder = async (req, res) => {
    try {
        // Debug logging
        console.log("createOrder called");
        console.log("User:", req.user ? req.user._id : "No User");
        console.log("Razorpay Key ID present:", !!process.env.RAZORPAY_KEY_ID);

        if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) {
            throw new Error("Razorpay keys are missing in environment variables");
        }

        if (!req.user) {
            throw new Error("User not authenticated found in request");
        }

        const { planDuration } = req.body;
        let amount = 19900; // Default Monthly: 199 INR

        if (planDuration === "yearly") {
            amount = 159900; // Yearly: 1599 INR
            console.log("Plan Duration: Yearly");
        } else {
            console.log("Plan Duration: Monthly");
        }

        const options = {
            amount: amount,
            currency: "INR",
            // Razorpay receipt max length is 40 chars.
            // "receipt_" (8) + user_id slice (6) + "_" (1) + timestamp (13) = 28 chars
            receipt: `receipt_${req.user._id.toString().slice(-6)}_${Date.now()}`,
            notes: {
                planDuration: planDuration || "monthly"
            }
        };

        console.log("Creating Razorpay order with options:", options);

        const order = await razorpay.orders.create(options);

        if (!order) {
            throw new Error("Razorpay returned no order object");
        }

        console.log("Order created successfully:", order.id);
        res.json(order);
    } catch (error) {
        console.error("Create Order Runtime Error:", error);

        // Detailed logging for non-Error objects
        const errorDetails = JSON.stringify(error, null, 2);
        const errorMessage = error.message || (error.error && error.error.description) || "Unknown Error";

        const fs = require('fs');
        fs.appendFileSync('razorpay_error.log', `${new Date().toISOString()} - ${errorMessage}\nFull Error: ${errorDetails}\n\n`);

        // Handle Razorpay specific error structure
        const responseError = error.error ? error.error.description : error.message;

        res.status(500).json({
            success: false,
            message: "Order creation failed",
            error: responseError,
            details: error
        });
    }
};

// @desc    Verify Payment and Upgrade Subscription
// @route   POST /api/subscription/verify-payment
// @access  Private
const verifyPayment = async (req, res) => {
    try {
        const { razorpay_order_id, razorpay_payment_id, razorpay_signature, planDuration } = req.body;

        const body = razorpay_order_id + "|" + razorpay_payment_id;
        const expectedSignature = crypto
            .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
            .update(body.toString())
            .digest("hex");

        if (expectedSignature === razorpay_signature) {
            // Payment Verified
            let subscription = await Subscription.findOne({ user: req.user.id });
            if (!subscription) {
                subscription = new Subscription({ user: req.user.id });
            }

            const startDate = new Date();
            const endDate = new Date();

            if (planDuration === "yearly") {
                endDate.setFullYear(startDate.getFullYear() + 1); // 1 Year Validity
                subscription.planDuration = "yearly";
                subscription.amountPaid = 1599;
            } else {
                endDate.setDate(startDate.getDate() + 30); // 30 Days Validity (Monthly)
                subscription.planDuration = "monthly";
                subscription.amountPaid = 199;
            }

            subscription.planType = "pro";
            subscription.status = "active";
            subscription.startDate = startDate;
            subscription.endDate = endDate;
            subscription.paymentId = razorpay_payment_id;
            subscription.orderId = razorpay_order_id;
            subscription.usageLimit = null; // Unlimited
            subscription.usageCount = 0;
            subscription.lastResetDate = startDate;

            await subscription.save();

            res.json({ message: "Payment verified. You are now a Pro user!", subscription });
        } else {
            res.status(400).json({ message: "Invalid signature. Payment verification failed." });
        }
    } catch (error) {
        console.error("Verify Payment Error:", error);
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get Subscription Status
// @route   GET /api/subscription/status
// @access  Private
const getSubscriptionStatus = async (req, res) => {
    try {
        let subscription = await Subscription.findOne({ user: req.user.id });
        if (!subscription) {
            // Create default if missing
            subscription = await Subscription.create({
                user: req.user.id,
                planType: "free",
                status: "active",
                usageLimit: 5
            });
        }
        res.json(subscription);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
    createOrder,
    verifyPayment,
    getSubscriptionStatus
};
