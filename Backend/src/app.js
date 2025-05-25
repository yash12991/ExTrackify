import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
const app = express();

app.use(
  cors({
    origin: process.env.CORS_ORIGIN,
    credentials: true,
  })
);

app.use(express.json({ limit: "16kb" }));
app.use(express.urlencoded({ extended: true, limit: "16kb" }));
app.use(cookieParser());

// Routers
import userRouter from "./routes/user.routes.js";
import expensesRouter from "./routes/expense.routes.js";
import budgetRoutes from "./routes/budgetRoutes.js";
import sipRoutes from "./routes/sip.routes.js";
import paymentRoutes from "./routes/payment.routes.js"; // <-- Add this if you have payments
import adminRoutes from "./routes/admin.routes.js"; // <-- Add this for admin dashboard

app.use("/api/v1/users", userRouter);
app.use("/api/v1/expenses", expensesRouter);
app.use("/api/v1/budgets", budgetRoutes);
app.use("/api/v1/sip", sipRoutes);
app.use("/api/v1/payments", paymentRoutes); // <-- Add this if you have payments
app.use("/api/v1/admin", adminRoutes); // <-- Add this for admin dashboard

export { app };
