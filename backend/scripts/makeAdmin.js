const mongoose = require("mongoose");
const dotenv = require("dotenv");
const User = require("../models/User");
const path = require("path");

// Load backend .env
dotenv.config({ path: path.join(__dirname, "../.env") });

const makeAdmin = async () => {
    try {
        const emailArg = process.argv[2];

        if (!emailArg) {
            console.error("Please providing an email address.");
            console.error("Usage: node scripts/makeAdmin.js <email>");
            process.exit(1);
        }

        const email = emailArg.toLowerCase().trim();

        await mongoose.connect(process.env.MONGO_URI);
        console.log("Connected to MongoDB");

        const user = await User.findOne({ email });

        if (!user) {
            console.error(`User with email ${email} not found.`);
            process.exit(1);
        }

        user.role = "admin";
        await user.save();

        console.log(`✅ Success! User ${user.name} (${user.email}) is now an ADMIN.`);
        process.exit(0);
    } catch (error) {
        console.error("Error:", error.message);
        process.exit(1);
    }
};

makeAdmin();
