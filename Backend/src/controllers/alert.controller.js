import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/apiResponse.js";
import { Alert } from "../models/alert.model.js";
import YahooFinance from "yahoo-finance2";
const yahooFinance = new YahooFinance();
import axios from "axios";

const createAlert = asyncHandler(async (req, res) => {
  const { type, symbol, schemeCode, schemeName, name, targetPrice, targetNav, condition } = req.body;
  if (!type || !condition) throw new ApiError(400, "type and condition are required");

  const alert = await Alert.create({
    user: req.user._id, type, symbol, schemeCode, schemeName, name,
    targetPrice, targetNav, condition,
  });

  return res.status(201).json(new ApiResponse(201, alert, "Alert created"));
});

const getAlerts = asyncHandler(async (req, res) => {
  const alerts = await Alert.find({ user: req.user._id }).sort({ createdAt: -1 });
  return res.status(200).json(new ApiResponse(200, alerts, "OK"));
});

const updateAlert = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const alert = await Alert.findOneAndUpdate(
    { _id: id, user: req.user._id },
    { $set: req.body },
    { new: true }
  );
  if (!alert) throw new ApiError(404, "Alert not found");
  return res.status(200).json(new ApiResponse(200, alert, "Alert updated"));
});

const deleteAlert = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const alert = await Alert.findOneAndDelete({ _id: id, user: req.user._id });
  if (!alert) throw new ApiError(404, "Alert not found");
  return res.status(200).json(new ApiResponse(200, null, "Alert deleted"));
});

const checkAlerts = asyncHandler(async (req, res) => {
  const alerts = await Alert.find({ user: req.user._id, isActive: true, isTriggered: false });
  const triggered = [];

  for (const alert of alerts) {
    try {
      if (alert.type === "stock" && alert.symbol) {
        const quote = await yahooFinance.quote(alert.symbol.includes(".") ? alert.symbol : `${alert.symbol}.NS`);
        const price = quote.regularMarketPrice;
        alert.currentPrice = price;
        alert.lastChecked = new Date();

        if ((alert.condition === "above" && price >= alert.targetPrice) ||
            (alert.condition === "below" && price <= alert.targetPrice)) {
          alert.isTriggered = true;
          alert.triggeredAt = new Date();
          triggered.push(alert);
        }
      } else if (alert.type === "mutual_fund" && alert.schemeCode) {
        const { data } = await axios.get(`https://api.mfapi.in/mf/${alert.schemeCode}`, { timeout: 5000 });
        const nav = parseFloat(data.data?.[0]?.nav || 0);
        alert.currentNav = nav;
        alert.lastChecked = new Date();

        if ((alert.condition === "above" && nav >= alert.targetNav) ||
            (alert.condition === "below" && nav <= alert.targetNav)) {
          alert.isTriggered = true;
          alert.triggeredAt = new Date();
          triggered.push(alert);
        }
      }
      await alert.save();
    } catch {}
  }

  return res.status(200).json(new ApiResponse(200, { checked: alerts.length, triggered: triggered.length, triggered }, "Alerts checked"));
});

export { createAlert, getAlerts, updateAlert, deleteAlert, checkAlerts };
