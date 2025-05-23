//will use it later

import dotenv from "dotenv"
dotenv.config();
import express from "express"
import {app} from "./app.js"
import { connectDB } from "./db/index.js";
import { startRecurringExpenseJob } from "./cronJobs/cronJobs.js";
connectDB();
  startRecurringExpenseJob();
app.listen(process.env.PORT,()=>{
  console.log(`server is running on port ${process.env.PORT}`)
  
})



