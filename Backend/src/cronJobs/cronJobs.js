
import cron from "node-cron";
import mongoose from "mongoose";
import { Expense } from "../models/Expense.models.js";  // adjust the path as needed

export const addFrequency = (date, frequency) => {
  const newDate = new Date(date);
  switch (frequency) {
    case "daily":
      newDate.setDate(newDate.getDate() + 1);
      break;
    case "weekly":
      newDate.setDate(newDate.getDate() + 7);
      break;
    case "monthly":
      newDate.setMonth(newDate.getMonth() + 1);
      break;
  }
  return newDate;
};

export const startRecurringExpenseJob = () => {
  cron.schedule("0 0 * * *", async () => {
    console.log("Running recurring expenses check...");

    const now = new Date();

    try {
      const dueExpenses = await Expense.find({
        recurring: true,
        nextOccurrence: { $lte: now },
      });

      for (const expense of dueExpenses) {
        const newExpense = new Expense({
          category: expense.category,
          amount: expense.amount,
          date: now,
          user: expense.user,
          notes: expense.notes,
          modeofpayment: expense.modeofpayment,
          tags: expense.tags,
          recurring: expense.recurring,
          frequency: expense.frequency,
          nextOccurrence: addFrequency(now, expense.frequency),
        });

        await newExpense.save();

        expense.nextOccurrence = addFrequency(now, expense.frequency);
        await expense.save();
      }

      console.log("Recurring expenses processed.");
    } catch (error) {
      console.error("Error processing recurring expenses:", error);
    }
  });
};
