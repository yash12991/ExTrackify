import { Router } from "express";

const router = Router();

// Health check endpoint to verify environment variables
router.get("/health", (req, res) => {
  const envVars = {
    NODE_ENV: process.env.NODE_ENV,
    PORT: process.env.PORT,
    ACCESS_TOKEN_SECRET: process.env.ACCESS_TOKEN_SECRET ? "✅ Present" : "❌ Missing",
    REFRESH_TOKEN_SECRET: process.env.REFRESH_TOKEN_SECRET ? "✅ Present" : "❌ Missing",
    MONGODB_URI: process.env.MONGODB_URI ? "✅ Present" : "❌ Missing",
    FRONTEND_URL: process.env.FRONTEND_URL || "Not set",
  };

  res.json({
    status: "OK",
    timestamp: new Date().toISOString(),
    environment: envVars
  });
});

export default router;
