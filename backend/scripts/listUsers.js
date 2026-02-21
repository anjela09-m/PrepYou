const mongoose = require("mongoose");
const dotenv = require("dotenv");
const User = require("../models/User");
const path = require("path");

dotenv.config({ path: path.join(__dirname, "../.env") });

const listUsers = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);

    const users = await User.find({});
    console.log("\n====== USER LIST ======");
    users.forEach((u) => {
      console.log(`Email: ${u.email}`);
      console.log(`Role:  '${u.role}'`); // quotes to see whitespace
      console.log(`ID:    ${u._id}`);
      console.log("-----------------------");
    });
    console.log("=======================\n");
    process.exit(0);
  } catch (error) {
    console.error("Error:", error.message);
    process.exit(1);
  }
};

listUsers();
