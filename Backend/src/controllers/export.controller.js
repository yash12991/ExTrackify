import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiResponse } from "../utils/apiResponse.js";
import { Expense } from "../models/Expense.models.js";
import { SIP } from "../models/SIP.models.js";
import { Bills } from "../models/BILLS.js";

const generateCSV = (rows, headers) => {
  const headerLine = headers.join(",");
  const dataLines = rows.map((row) =>
    headers.map((h) => {
      const val = row[h] ?? "";
      const str = String(val).replace(/"/g, '""');
      return str.includes(",") || str.includes('"') ? `"${str}"` : str;
    }).join(",")
  );
  return [headerLine, ...dataLines].join("\n");
};

const exportExpenses = asyncHandler(async (req, res) => {
  const { startDate, endDate, category } = req.query;
  const filter = { user: req.user._id };
  if (startDate || endDate) {
    filter.date = {};
    if (startDate) filter.date.$gte = new Date(startDate);
    if (endDate) filter.date.$lte = new Date(endDate);
  }
  if (category) filter.category = category;

  const expenses = await Expense.find(filter).sort({ date: -1 }).lean();
  const headers = ["date", "category", "amount", "notes", "modeofpayment", "tags"];
  const csv = generateCSV(expenses, headers);

  res.setHeader("Content-Type", "text/csv");
  res.setHeader("Content-Disposition", `attachment; filename=expenses_${Date.now()}.csv`);
  return res.status(200).send(csv);
});

const exportSIPs = asyncHandler(async (req, res) => {
  const sips = await SIP.find({ user: req.user._id }).lean();
  const headers = ["sipName", "amount", "startDate", "durationInMonths", "frequency", "schemeName", "goal", "totalInvested", "isActive"];
  const csv = generateCSV(sips, headers);

  res.setHeader("Content-Type", "text/csv");
  res.setHeader("Content-Disposition", `attachment; filename=sips_${Date.now()}.csv`);
  return res.status(200).send(csv);
});

const exportBills = asyncHandler(async (req, res) => {
  const bills = await Bills.find({ userId: req.user._id }).lean();
  const headers = ["billName", "amount", "dueDate", "frequency", "category", "status", "notes"];
  const csv = generateCSV(bills, headers);

  res.setHeader("Content-Type", "text/csv");
  res.setHeader("Content-Disposition", `attachment; filename=bills_${Date.now()}.csv`);
  return res.status(200).send(csv);
});

export { exportExpenses, exportSIPs, exportBills };
