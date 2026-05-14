import Groq from "groq-sdk";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/apiResponse.js";
import { Expense } from "../models/Expense.models.js";
import mongoose from "mongoose";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { PDFParse } from "pdf-parse";
import { parse } from "csv-parse/sync";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

const extractJsonFromAI = (text) => {
  const jsonMatch = text.match(/\[[\s\S]*\]/);
  if (jsonMatch) {
    try {
      return JSON.parse(jsonMatch[0]);
    } catch {}
  }
  return null;
};

const parseFile = async (filePath, mimetype) => {
  const buffer = fs.readFileSync(filePath);
  const ext = path.extname(filePath).toLowerCase();

  if (ext === ".pdf") {
    const parser = new PDFParse({ data: buffer });
    await parser.load();
    const result = await parser.getText();
    return result.text || "";
  }

  if (ext === ".csv") {
    const records = parse(buffer.toString(), {
      columns: true,
      skip_empty_lines: true,
      relax_column_count: true,
    });
    return JSON.stringify(records, null, 2);
  }

  if ([".png", ".jpg", ".jpeg", ".webp"].includes(ext)) {
    return null;
  }

  if ([".txt", ".text"].includes(ext)) {
    return buffer.toString("utf-8");
  }

  return buffer.toString("utf-8");
};

const uploadBankStatement = asyncHandler(async (req, res) => {
  const file = req.file;
  if (!file) {
    throw new ApiError(400, "No file uploaded. Upload a PDF, CSV, or image of your bank statement.");
  }

  const userId = new mongoose.Types.ObjectId(req.user._id);
  const filePath = file.path;

  let extractedText;
  try {
    extractedText = await parseFile(filePath, file.mimetype);
  } catch (err) {
    fs.unlink(filePath, () => {});
    throw new ApiError(422, `Failed to read file: ${err.message}`);
  }

  if (extractedText === null) {
    fs.unlink(filePath, () => {});
    throw new ApiError(422, "Image-based PDFs are not supported yet. Upload a text PDF or CSV.");
  }

  if (!extractedText.trim()) {
    fs.unlink(filePath, () => {});
    throw new ApiError(422, "No text could be extracted from the file. Make sure it is a text-based PDF or CSV.");
  }

  const systemPrompt = `You are a financial data extraction AI. Extract all transactions from the provided bank statement text.

Return a JSON array of objects with this exact structure:
{
  "date": "YYYY-MM-DD",
  "description": "transaction narration",
  "amount": number (positive number, always positive),
  "type": "debit" or "credit",
  "category": one of: "Food", "Transport", "Shopping", "Bills & Utilities", "Entertainment", "Healthcare", "Education", "Rent", "Salary", "Investment", "Transfer", "Other Income", "Other Expense",
  "modeofpayment": one of: "upi", "credit card", "debit card", "cash", "cheque", "netbanking", "neft", "rtgs", "neft/rtgs", "imps", "atm", "mobile wallet", "paytm", "google pay", "phonepe", "bank transfer", "other"
}

Rules:
1. Return ONLY the JSON array, no other text
2. Amount must be a positive number
3. For debits (money going out), type = "debit"
4. For credits (money coming in), type = "credit"
5. Infer category from the description/narration
6. Infer modeofpayment from the description
7. Skip internal transfers, bank charges less than ₹10, and GST entries
8. If date has no year, assume current year
9. Return empty array [] if no transactions found`;

  try {
    const completion = await groq.chat.completions.create({
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: extractedText.slice(0, 30000) },
      ],
      model: "llama-3.3-70b-versatile",
      temperature: 0.1,
      max_tokens: 4096,
    });

    const aiReply = completion.choices[0]?.message?.content || "";
    const transactions = extractJsonFromAI(aiReply);

    if (!transactions || !Array.isArray(transactions)) {
      fs.unlink(filePath, () => {});
      throw new ApiError(502, "AI could not parse the statement. Try a different format.");
    }

    fs.unlink(filePath, () => {});

    return res.status(200).json(new ApiResponse(200, {
      fileName: file.originalname,
      totalTransactions: transactions.length,
      debits: transactions.filter((t) => t.type === "debit").length,
      credits: transactions.filter((t) => t.type === "credit").length,
      transactions,
    }, "Statement parsed successfully"));
  } catch (error) {
    fs.unlink(filePath, () => {});
    if (error instanceof ApiError) throw error;
    console.error("Groq AI error:", error.message);
    throw new ApiError(502, "AI processing failed. Please try again.");
  }
});

const saveTransactions = asyncHandler(async (req, res) => {
  const { transactions } = req.body;
  if (!transactions || !Array.isArray(transactions) || !transactions.length) {
    throw new ApiError(400, "No transactions to save");
  }

  const userId = new mongoose.Types.ObjectId(req.user._id);
  const now = new Date();
  const expenses = [];

  const normalizeMode = (mode) => {
    if (!mode) return "other";
    const m = mode.toLowerCase().trim();
    const map = {
      "upi": "upi", "paytm": "paytm", "google pay": "google pay", "gpay": "google pay", "phonepe": "phonepe",
      "credit card": "credit card", "creditcard": "credit card", "cc": "credit card",
      "debit card": "debit card", "debitcard": "debit card", "dc": "debit card",
      "cash": "cash", "atm": "atm",
      "cheque": "cheque", "check": "cheque",
      "netbanking": "netbanking", "net banking": "netbanking", "online": "netbanking",
      "neft": "neft", "rtgs": "rtgs", "neft/rtgs": "neft/rtgs", "neft\\rtgs": "neft/rtgs", "imps": "imps",
      "bank transfer": "bank transfer", "transfer": "bank transfer", "wallet": "mobile wallet", "mobile wallet": "mobile wallet",
    };
    return map[m] || "other";
  };

  for (const t of transactions) {
    if (t.type !== "debit") continue;

    const expenseDate = t.date ? new Date(t.date) : now;
    if (isNaN(expenseDate.getTime())) continue;

    expenses.push({
      user: userId,
      category: t.category || "Other Expense",
      amount: Number(t.amount),
      date: expenseDate,
      notes: t.description || "",
      modeofpayment: normalizeMode(t.modeofpayment),
      tags: [],
      recurring: false,
    });
  }

  if (!expenses.length) {
    throw new ApiError(400, "No debit transactions found to save");
  }

  await Expense.insertMany(expenses);

  return res.status(201).json(new ApiResponse(201, {
    saved: expenses.length,
    totalAmount: expenses.reduce((sum, e) => sum + e.amount, 0),
  }, `${expenses.length} expenses saved successfully`));
});

export { uploadBankStatement, saveTransactions };
