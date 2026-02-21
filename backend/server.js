const express = require("express"); // Server restart trigger
const dotenv = require("dotenv");
const cors = require("cors");
const connectDB = require("./config/db");

dotenv.config();
// console.log("OPENROUTER KEY:", process.env.OPENROUTER_API_KEY);
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
app.use("/api/progress", require("./routes/progressRoutes"));
app.use("/api/admin", require("./routes/adminRoutes"));
app.use("/api/journals", require("./routes/journalRoutes"));
app.use("/api/subscription", require("./routes/subscriptionRoutes"));


// test route
app.get("/", (req, res) => {
  res.send("PrepYou backend running");
});

// global error handler
app.use((err, req, res, next) => {
  console.error("Global Error Handler:", err.stack);
  res.status(500).json({
    message: "Something went wrong on the server",
    error: err.message,
    stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
  });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
