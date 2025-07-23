import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";

// Alternative Express setup for deployment environments
async function createApp() {
  try {
    // Try standard Express creation
    const app = express();
    console.log("✅ Express app created successfully");
    return app;
  } catch (error) {
    console.error("❌ Standard Express creation failed:", error);

    // Try alternative approach for problematic environments
    try {
      console.log("🔄 Trying alternative Express initialization...");
      const expressModule = await import("express");
      const app = expressModule.default();
      console.log("✅ Alternative Express app created successfully");
      return app;
    } catch (altError) {
      console.error("❌ Alternative Express creation also failed:", altError);
      process.exit(1);
    }
  }
}

const app = await createApp();

app.use(express.json());
app.use(cors());

app.use(express.json({ limit: "16kb" }));
app.use(express.urlencoded({ extended: true, limit: "16kb" }));
app.use(cookieParser());

// Add request logging middleware for debugging
app.use((req, res, next) => {
  console.log(`${req.method} ${req.path} - ${new Date().toISOString()}`);
  next();
});

// Routers
import userRouter from "./routes/user.routes.js";
import expensesRouter from "./routes/expense.routes.js";
import budgetRoutes from "./routes/budgetRoutes.js";
import sipRoutes from "./routes/sip.routes.js";
import paymentRoutes from "./routes/payment.routes.js";
import adminRoutes from "./routes/admin.routes.js";
import goalRoutes from "./routes/goal.routes.js";
import otpRoutes from "./routes/otp.routes.js";
import billsRoutes from "./routes/bills.routes.js";

app.use("/api/v1/users", userRouter);
app.use("/api/v1/expenses", expensesRouter);
app.use("/api/v1/budgets", budgetRoutes);
app.use("/api/v1/sip", sipRoutes);
app.use("/api/v1/payments", paymentRoutes);
app.use("/api/v1/admin", adminRoutes);
app.use("/api/v1/goals", goalRoutes);
app.use("/api/v1/otp", otpRoutes);
app.use("/api/v1/bills", billsRoutes);

// Add error handling middleware
app.use((err, req, res, next) => {
  console.error("Unhandled error:", err);
  res.status(500).json({
    success: false,
    message: "Internal server error",
    error: process.env.NODE_ENV === "development" ? err.message : undefined,
  });
});

// Add 404 handler
app.use("*", (req, res) => {
  res.status(404).json({
    success: false,
    message: `Route ${req.originalUrl} not found`,
  });
});

export { app };
