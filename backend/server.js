const express = require("express");
const cors = require("cors");

require("dotenv").config();

const connectDB = require("./config/db");
const budgetRoutes = require("./routes/budgetRoutes");
const tempRoutes = require("./routes/tempRoutes");
const dashboardRoutes = require("./routes/dashboardRoutes");
const reportRoutes = require("./routes/reportRoutes");

const app = express();

// Connect to MongoDB
connectDB();


app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.json({
    message: "Expense Tracker API is running",
  });
});

//  routes
app.use("/api/budgets", budgetRoutes);
app.use("/api/temp", tempRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/reports", reportRoutes);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});