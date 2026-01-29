const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const connectDB = require("./config/db");

dotenv.config();
connectDB();

const app = express();

// middleware
app.use(cors());
app.use(express.json());

// routes
app.use("/api/auth", require("./routes/authRoutes"));
app.use("/api/user", require("./routes/userRoutes"));
app.use("/api/goals", require("./routes/goalRoutes"));
app.use("/api/plans", require("./routes/planRoutes"));   
app.use("/api/progress", require("./routes/progressRoutes")); // later


// test route
app.get("/", (req, res) => {
  res.send("PrepYou backend running");
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
