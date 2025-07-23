import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";

// Express application setup with error handling
let app;
try {
  app = express();
  console.log("✅ Express app created successfully");
} catch (error) {
  console.error("❌ Failed to create Express app:", error);
  process.exit(1);
}

app.use(express.json());
// app.use(
//   cors({
//     origin: process.env.CORS_ORIGIN || "http://localhost:5173"||"https://ex-trackify-vw3z.vercel.app",
//     credentials: true,
//   })
// );
// app.use(cors());
app.use(cors({
  origin: '*',         /
  methods: ['GET', 'POST', 'PUT', 'DELETE'],  
  allowedHeaders: ['Content-Type', 'Authorization'], 
}));

app.use(express.json({ limit: "16kb" }));
app.use(express.urlencoded({ extended: true, limit: "16kb" }));
app.use(cookieParser());

// Add request logging middleware for debugging
app.use((req, res, next) => {
  console.log(`${req.method} ${req.path} - ${new Date().toISOString()}`);
  next();
});


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
