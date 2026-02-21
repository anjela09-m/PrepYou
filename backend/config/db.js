const mongoose = require("mongoose");

const connectDB = async () => {
  try {
    // Attempt to connect with IPv4 forced (common fix for EREFUSED on some networks)
    await mongoose.connect(process.env.MONGO_URI, {
      serverSelectionTimeoutMS: 60000, // Increase timeout to 60s
      connectTimeoutMS: 60000,
      socketTimeoutMS: 60000,
      family: 4 // Force IPv4 to avoid some network resolution issues
    });
    console.log("MongoDB connected");
  } catch (error) {
    console.error("MongoDB connection failed", error.message);
    process.exit(1);
  }
};

module.exports = connectDB;
