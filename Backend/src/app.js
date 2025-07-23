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

// Configure CORS for production and development
const corsOptions = {
  origin: function (origin, callback) {
    console.log("🔍 CORS Request from origin:", origin);
    
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) {
      console.log("✅ CORS: Allowing request with no origin");
      return callback(null, true);
    }

    const allowedOrigins = [
      "http://localhost:5173", // Vite dev server
      "http://localhost:3000", // Alternative dev port
      "https://ex-trackify.vercel.app", // Your Vercel deployment
      "https://expense-tracker-frontend.vercel.app", // Alternative Vercel URL
      process.env.CORS_ORIGIN, // Custom origin from env
    ].filter(Boolean); // Remove null/undefined values

    console.log("🔍 CORS: Allowed origins:", allowedOrigins);

    if (allowedOrigins.includes(origin)) {
      console.log("✅ CORS: Origin allowed");
      callback(null, true);
    } else {
      console.log("❌ CORS: Origin blocked:", origin);
      // In production, be more permissive for now
      if (process.env.NODE_ENV === 'production') {
        console.log("🚨 Production mode: Allowing origin temporarily");
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    }
  },
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
  allowedHeaders: [
    "Content-Type", 
    "Authorization", 
    "X-Requested-With",
    "Accept",
    "Origin",
    "Access-Control-Request-Method",
    "Access-Control-Request-Headers"
  ],
  exposedHeaders: ["Set-Cookie"],
};

app.use(cors(corsOptions));

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
import healthRoutes from "./routes/health.routes.js";

// Health check route (should be first)
app.use("/api/v1/health", healthRoutes);
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
