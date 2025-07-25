import dotenv from "dotenv";
dotenv.config();

import express from "express";
import { app } from "./app.js";
import { connectDB } from "./db/index.js";
import { startRecurringExpenseJob } from "./cronJobs/cronJobs.js";
import "./cronJobs/sipScheduler.js"; // Import SIP reminder cron jobs

const PORT = process.env.PORT || 3001;

connectDB()
  .then(() => {
    startRecurringExpenseJob();

    app.on("error", (error) => {
      console.log("Express app error: ", error);
      throw error;
    });

    app.listen(PORT, () => {
      console.log(`⚙️ Server is running at port: ${PORT}`);
      console.log(
        `🌐 CORS enabled for: ${
          process.env.CORS_ORIGIN || "http://localhost:5173"
        }`
      );
    });
  })
  .catch((err) => {
    console.log("MONGO db connection failed !!! ", err);
    process.exit(1);
  });
