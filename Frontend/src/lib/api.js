import toast from "react-hot-toast";
import { axiosInstance } from "./axios.js";

export const sendOtp = async (email) => {
  try {
    const response = await axiosInstance.post("/otp/send", { email });
    return response.data;
  } catch (error) {
    console.error("Send OTP API error:", error);
    const errorMessage = error.response?.data?.message || "Failed to send OTP";
    throw new Error(errorMessage);
  }
};

export const verifyOtp = async (email, otp) => {
  try {
    const response = await axiosInstance.post("/otp/verify", { email, otp });
    return response.data;
  } catch (error) {
    console.error("Verify OTP API error:", error);
    const errorMessage =
      error.response?.data?.message || "Failed to verify OTP";
    throw new Error(errorMessage);
  }
};

export const register = async (signupData) => {
  const response = await axiosInstance.post("/users/register", signupData);
  return response.data;
};

export const login = async ({ email, password }) => {
  try {
    const response = await axiosInstance.post("/users/login", {
      email,
      password,
    });

    return response.data;
  } catch (error) {
    throw error;
  }
};

export const logout = async () => {
  try {
    const response = await axiosInstance.post("/users/logout");
    axiosInstance.defaults.headers.common["Authorization"] = "";
    // Clear localStorage token (if it was used as fallback)
    localStorage.removeItem("accessToken");
    console.log("🧹 Cleared localStorage token");
    return response.data;
  } catch (error) {
    console.error("Logout error:", error);
    throw error;
  }
};

export const getAuthUser = async () => {
  try {
    const res = await axiosInstance.get("/users/me"); // Changed from /users/get-currentUser
    return res.data;
  } catch (err) {
    console.error("Auth error:", err);
    return null;
  }
};

export const getExpenseSummary = async (period = "monthly") => {
  try {
    const response = await axiosInstance.get(
      `/expenses/summary?period=${period}`
    );
    console.log("API Response:", response.data); // Debug log
    return response.data;
  } catch (error) {
    console.error(
      "Error fetching expense summary:",
      error.response?.data || error.message
    );
    throw error;
  }
};

export const getCategoryWiseSummary = async () => {
  const response = await axiosInstance.get("/expenses/chart/category-summary");
  return response.data;
};

export const getLast7DaysSummary = async () => {
  const response = await axiosInstance.get("/expenses/chart/weekly-summary");
  console.log(response.data);
  return response.data;
};

export const addExpense = async (expenseData) => {
  const response = await axiosInstance.post("/expenses", expenseData);
  return response.data;
};

export const updateExpense = async (id, expenseData) => {
  const response = await axiosInstance.put(`/expenses/${id}`, expenseData);
  return response.data;
};

export const deleteExpense = async (id) => {
  try {
    const response = await axiosInstance.delete(`/expenses/${id}`);
    return response.data;
  } catch (error) {
    console.log("Error while deleting");
    toast.error("ERROR WHILE DELETING");
  }
};

export const getExpenses = async (
  page = 1,
  limit = 10,
  sortBy = "date",
  sortOrder = "desc",
  category = "",
  startDate = "",
  endDate = "",
  minAmount = "",
  maxAmount = ""
) => {
  try {
    const response = await axiosInstance.get("/expenses", {
      params: {
        page,
        limit,
        sortBy,
        sortOrder,
        category,
        startDate,
        endDate,
        minAmount,
        maxAmount,
      },
    });
    return response.data;
  } catch (error) {
    console.error("Error fetching expenses:", error);
    throw new Error(
      error.response?.data?.message || "Failed to fetch expenses"
    );
  }
};

export const getSubscriptions = async () => {
  const response = await axiosInstance.get("/subscriptions");
  return response.data;
};

export const getInvestments = async () => {
  const response = await axiosInstance.get("/investments");
  return response.data;
};

export const setGoal = async (goalData) => {
  const response = await axiosInstance.post("/goals", goalData);
  return response.data;
};

// Goal API functions - Updated to use axiosInstance
export const estimateGoal = async (goalData) => {
  try {
    const response = await axiosInstance.post("/goals/estimate", goalData);
    return response.data.data;
  } catch (error) {
    console.error("Error estimating goal:", error);
    throw new Error(error.response?.data?.message || "Failed to estimate goal");
  }
};

export const createGoal = async (goalData) => {
  try {
    const response = await axiosInstance.post("/goals", goalData);
    return response.data.data;
  } catch (error) {
    console.error("Error creating goal:", error);
    throw new Error(error.response?.data?.message || "Failed to create goal");
  }
};

export const getGoals = async (status = "") => {
  try {
    const params = status ? { status } : {};
    const response = await axiosInstance.get("/goals", { params });
    return response.data.data;
  } catch (error) {
    console.error("Error fetching goals:", error);
    throw new Error(error.response?.data?.message || "Failed to fetch goals");
  }
};

export const updateGoal = async (goalId, goalData) => {
  try {
    const response = await axiosInstance.put(`/goals/${goalId}`, goalData);
    return response.data.data;
  } catch (error) {
    console.error("Error updating goal:", error);
    throw new Error(error.response?.data?.message || "Failed to update goal");
  }
};

export const deleteGoal = async (goalId) => {
  try {
    const response = await axiosInstance.delete(`/goals/${goalId}`);
    return response.data;
  } catch (error) {
    console.error("Error deleting goal:", error);
    throw new Error(error.response?.data?.message || "Failed to delete goal");
  }
};

export const markGoalComplete = async (goalId) => {
  try {
    const response = await axiosInstance.patch(`/goals/${goalId}/complete`);
    return response.data.data;
  } catch (error) {
    console.error("Error completing goal:", error);
    throw new Error(error.response?.data?.message || "Failed to complete goal");
  }
};

export const getGoalAnalytics = async () => {
  try {
    const response = await axiosInstance.get("/goals/analytics");
    return response.data.data;
  } catch (error) {
    console.error("Error fetching goal analytics:", error);
    throw new Error(
      error.response?.data?.message || "Failed to fetch goal analytics"
    );
  }
};

export const getOverAllBudget = async () => {
  try {
    const response = await axiosInstance.get("/budgets/overall");
    return response?.data?.data?.amount ?? 0;
  } catch (error) {
    console.error("Error fetching overall budget:", error);
    return 0;
  }
};

export const updateOverallBudget = async (amount) => {
  const response = await axiosInstance.post("/budgets/overall", { amount });
  return response.data;
};

// SIP API functions
export const createSIP = async (sipData) => {
  try {
    const response = await axiosInstance.post("/sip", sipData);
    return response.data;
  } catch (error) {
    console.error("Error creating SIP:", error);
    throw new Error(error.response?.data?.message || "Failed to create SIP");
  }
};

export const getAllSIPs = async () => {
  try {
    const response = await axiosInstance.get("/sip");
    return response.data.data;
  } catch (error) {
    console.error("Error fetching SIPs:", error);
    throw new Error(error.response?.data?.message || "Failed to fetch SIPs");
  }
};

export const getSIPById = async (sipId) => {
  try {
    const response = await axiosInstance.get(`/sip/${sipId}`);
    return response.data.data;
  } catch (error) {
    console.error("Error fetching SIP:", error);
    throw new Error(error.response?.data?.message || "Failed to fetch SIP");
  }
};

export const updateSIP = async (sipId, sipData) => {
  try {
    const response = await axiosInstance.put(`/sip/${sipId}`, sipData);
    return response.data;
  } catch (error) {
    console.error("Error updating SIP:", error);
    throw new Error(error.response?.data?.message || "Failed to update SIP");
  }
};

export const deleteSIP = async (sipId) => {
  try {
    const response = await axiosInstance.delete(`/sip/${sipId}`);
    return response.data;
  } catch (error) {
    console.error("Error deleting SIP:", error);
    throw new Error(error.response?.data?.message || "Failed to delete SIP");
  }
};

export const getActiveSIPs = async () => {
  try {
    const response = await axiosInstance.get("/sip/active");
    return response.data.data;
  } catch (error) {
    console.error("Error fetching active SIPs:", error);
    throw new Error(
      error.response?.data?.message || "Failed to fetch active SIPs"
    );
  }
};

export const getSIPAnalytics = async (sipId) => {
  try {
    const response = await axiosInstance.get(`/sip/${sipId}/analytics`);
    return response.data.data;
  } catch (error) {
    console.error("Error fetching SIP analytics:", error);
    throw new Error(
      error.response?.data?.message || "Failed to fetch SIP analytics"
    );
  }
};

export const getSIPSummary = async () => {
  try {
    const response = await axiosInstance.get("/sip/summary");
    return response.data.data;
  } catch (error) {
    console.error("Error fetching SIP summary:", error);
    throw new Error(
      error.response?.data?.message || "Failed to fetch SIP summary"
    );
  }
};

export const getSIPProjection = async (sipId, rate = 12) => {
  try {
    const response = await axiosInstance.get(
      `/sip/${sipId}/projection?rate=${rate}`
    );
    return response.data.data;
  } catch (error) {
    console.error("Error fetching SIP projection:", error);
    throw new Error(
      error.response?.data?.message || "Failed to fetch SIP projection"
    );
  }
};

export const getSIPChartData = async () => {
  try {
    const response = await axiosInstance.get("/sip/chart");
    return response.data.data;
  } catch (error) {
    console.error("Error fetching SIP chart data:", error);
    throw new Error(
      error.response?.data?.message || "Failed to fetch SIP chart data"
    );
  }
};

export const getUpcomingPayments = async (days = 30) => {
  try {
    const response = await axiosInstance.get(
      `/sip/upcoming-payments?days=${days}`
    );
    return response.data.data;
  } catch (error) {
    console.error("Error fetching upcoming payments:", error);
    throw new Error(
      error.response?.data?.message || "Failed to fetch upcoming payments"
    );
  }
};

// Payment API functions
export const createPayment = async (paymentData) => {
  try {
    const response = await axiosInstance.post("/payments", paymentData);
    return response.data;
  } catch (error) {
    console.error("Error creating payment:", error);
    throw new Error(
      error.response?.data?.message || "Failed to create payment"
    );
  }
};

export const getAllPayments = async () => {
  try {
    const response = await axiosInstance.get("/payments");
    return response.data.data;
  } catch (error) {
    console.error("Error fetching payments:", error);
    throw new Error(
      error.response?.data?.message || "Failed to fetch payments"
    );
  }
};

export const getPaymentById = async (paymentId) => {
  try {
    const response = await axiosInstance.get(`/payments/${paymentId}`);
    return response.data.data;
  } catch (error) {
    console.error("Error fetching payment:", error);
    throw new Error(error.response?.data?.message || "Failed to fetch payment");
  }
};

export const updatePayment = async (paymentId, paymentData) => {
  try {
    const response = await axiosInstance.put(
      `/payments/${paymentId}`,
      paymentData
    );
    return response.data;
  } catch (error) {
    console.error("Error updating payment:", error);
    throw new Error(
      error.response?.data?.message || "Failed to update payment"
    );
  }
};

export const deletePayment = async (paymentId) => {
  try {
    const response = await axiosInstance.delete(`/payments/${paymentId}`);
    return response.data;
  } catch (error) {
    console.error("Error deleting payment:", error);
    throw new Error(
      error.response?.data?.message || "Failed to delete payment"
    );
  }
};

// Bills API functions
export const createBill = async (billData) => {
  try {
    const response = await axiosInstance.post("/bills", billData);
    return response.data;
  } catch (error) {
    console.error("Error creating bill:", error);
    throw new Error(error.response?.data?.message || "Failed to create bill");
  }
};

export const getBills = async (params = {}) => {
  try {
    const response = await axiosInstance.get("/bills", { params });
    return response.data;
  } catch (error) {
    console.error("Error fetching bills:", error);
    throw new Error(error.response?.data?.message || "Failed to fetch bills");
  }
};

export const getBillById = async (billId) => {
  try {
    const response = await axiosInstance.get(`/bills/${billId}`);
    return response.data.data;
  } catch (error) {
    console.error("Error fetching bill:", error);
    throw new Error(error.response?.data?.message || "Failed to fetch bill");
  }
};

export const updateBill = async (billId, billData) => {
  try {
    const response = await axiosInstance.put(`/bills/${billId}`, billData);
    return response.data;
  } catch (error) {
    console.error("Error updating bill:", error);
    throw new Error(error.response?.data?.message || "Failed to update bill");
  }
};

export const deleteBill = async (billId) => {
  try {
    const response = await axiosInstance.delete(`/bills/${billId}`);
    return response.data;
  } catch (error) {
    console.error("Error deleting bill:", error);
    throw new Error(error.response?.data?.message || "Failed to delete bill");
  }
};

export const markBillAsPaid = async (billId) => {
  try {
    const response = await axiosInstance.patch(`/bills/${billId}/pay`);
    return response.data;
  } catch (error) {
    console.error("Error marking bill as paid:", error);
    throw new Error(
      error.response?.data?.message || "Failed to mark bill as paid"
    );
  }
};

export const getBillsSummary = async () => {
  try {
    const response = await axiosInstance.get("/bills/summary");
    return response.data.data;
  } catch (error) {
    console.error("Error fetching bills summary:", error);
    throw new Error(
      error.response?.data?.message || "Failed to fetch bills summary"
    );
  }
};

export const getBillsByCategory = async () => {
  try {
    const response = await axiosInstance.get("/bills/category");
    return response.data.data;
  } catch (error) {
    console.error("Error fetching bills by category:", error);
    throw new Error(
      error.response?.data?.message || "Failed to fetch bills by category"
    );
  }
};

export const getTrendingFunds = async () => {
  try {
    const response = await axiosInstance.get("/mf/trending");
    return response.data;
  } catch (error) {
    console.error("Trending funds error:", error);
    throw new Error(
      error.response?.data?.message || "Failed to fetch trending funds"
    );
  }
};

export const searchMutualFunds = async (query) => {
  try {
    const response = await axiosInstance.get("/mf/search", {
      params: { q: query },
    });
    return response.data;
  } catch (error) {
    console.error("MF search error:", error);
    throw new Error(
      error.response?.data?.message || "Failed to search mutual funds"
    );
  }
};

export const getFundDetails = async (schemeCode) => {
  try {
    const response = await axiosInstance.get(`/mf/${schemeCode}/details`);
    return response.data;
  } catch (error) {
    console.error("MF details error:", error);
    throw new Error(
      error.response?.data?.message || "Failed to fetch fund details"
    );
  }
};

export const getFundNavHistory = async (schemeCode) => {
  try {
    const response = await axiosInstance.get(`/mf/${schemeCode}/nav-history`);
    return response.data;
  } catch (error) {
    console.error("MF NAV history error:", error);
    throw new Error(
      error.response?.data?.message || "Failed to fetch NAV history"
    );
  }
};

export const getTrendingStocks = async () => {
  try {
    const response = await axiosInstance.get("/stocks/trending");
    return response.data;
  } catch (error) {
    console.error("Trending stocks error:", error);
    throw new Error(
      error.response?.data?.message || "Failed to fetch trending stocks"
    );
  }
};

export const searchStocks = async (query) => {
  try {
    const response = await axiosInstance.get("/stocks/search", {
      params: { q: query },
    });
    return response.data;
  } catch (error) {
    console.error("Stock search error:", error);
    throw new Error(
      error.response?.data?.message || "Failed to search stocks"
    );
  }
};

export const getStockQuote = async (symbol) => {
  try {
    const response = await axiosInstance.get(`/stocks/${symbol}`);
    return response.data;
  } catch (error) {
    console.error("Stock quote error:", error);
    throw new Error(
      error.response?.data?.message || "Failed to fetch stock quote"
    );
  }
};

export const getStockHistory = async (symbol, period = "1mo", interval = "1d") => {
  try {
    const response = await axiosInstance.get(`/stocks/${symbol}/history`, {
      params: { period, interval },
    });
    return response.data;
  } catch (error) {
    console.error("Stock history error:", error);
    throw new Error(
      error.response?.data?.message || "Failed to fetch stock history"
    );
  }
};

export const getMarketIndices = async () => {
  try {
    const response = await axiosInstance.get("/stocks/indices");
    return response.data;
  } catch (error) {
    console.error("Market indices error:", error);
    throw new Error(
      error.response?.data?.message || "Failed to fetch market indices"
    );
  }
};

export const getCompanyProfile = async (symbol) => {
  try {
    const response = await axiosInstance.get(`/stocks/${symbol}/profile`);
    return response.data;
  } catch (error) {
    console.error("Company profile error:", error);
    throw new Error(
      error.response?.data?.message || "Failed to fetch company profile"
    );
  }
};

export const getStockNews = async (symbol) => {
  try {
    const response = await axiosInstance.get(`/stocks/${symbol}/news`);
    return response.data;
  } catch (error) {
    console.error("Stock news error:", error);
    throw new Error(
      error.response?.data?.message || "Failed to fetch stock news"
    );
  }
};

export const analyzeStock = async (symbol, stockData) => {
  try {
    const response = await axiosInstance.post("/bot/analyze-stock", { symbol, stockData });
    return response.data;
  } catch (error) {
    console.error("Stock analysis error:", error);
    throw new Error(
      error.response?.data?.message || "Failed to analyze stock"
    );
  }
};

export const sendBotMessage = async (message) => {
  try {
    const response = await axiosInstance.post("/bot/chat", { message });
    return response.data;
  } catch (error) {
    console.error("Bot API error:", error);
    throw new Error(
      error.response?.data?.message || "Failed to get bot response"
    );
  }
};

export const uploadBankStatement = async (file) => {
  try {
    const formData = new FormData();
    formData.append("statement", file);
    const response = await axiosInstance.post("/bank-statement/upload", formData, {
      headers: { "Content-Type": "multipart/form-data" },
      timeout: 120000,
    });
    return response.data;
  } catch (error) {
    console.error("Bank statement upload error:", error);
    throw new Error(error.response?.data?.message || "Failed to process statement");
  }
};

export const saveBankTransactions = async (transactions) => {
  try {
    const response = await axiosInstance.post("/bank-statement/save", { transactions });
    return response.data;
  } catch (error) {
    console.error("Save transactions error:", error);
    throw new Error(error.response?.data?.message || "Failed to save transactions");
  }
};

export const getMonthlyBillsTotal = async (year, month) => {
  try {
    const response = await axiosInstance.get("/bills/monthly-total", {
      params: { year, month },
    });
    return response.data.data;
  } catch (error) {
    console.error("Error fetching monthly bills total:", error);
    throw new Error(
      error.response?.data?.message || "Failed to fetch monthly bills total"
    );
  }
};

// ─── Budget Alerts ──────────────────────────────────────────
export const getBudgetAlerts = async () => {
  try {
    const response = await axiosInstance.get("/budgets/alerts");
    return response.data;
  } catch (error) {
    console.error("Budget alerts error:", error);
    throw new Error(error.response?.data?.message || "Failed to fetch budget alerts");
  }
};

export const getBudget = async () => {
  try {
    const response = await axiosInstance.get("/budgets");
    return response.data;
  } catch (error) {
    console.error("Error fetching budgets:", error);
    throw new Error(error.response?.data?.message || "Failed to fetch budgets");
  }
};

export const setOrUpdateBudget = async (budgetData) => {
  try {
    const response = await axiosInstance.post("/budgets", budgetData);
    return response.data;
  } catch (error) {
    console.error("Error setting budget:", error);
    throw new Error(error.response?.data?.message || "Failed to set budget");
  }
};

export const getBudgetStatus = async () => {
  try {
    const response = await axiosInstance.get("/budgets/status");
    return response.data;
  } catch (error) {
    console.error("Error fetching budget status:", error);
    throw new Error(error.response?.data?.message || "Failed to fetch budget status");
  }
};

// ─── Portfolio ──────────────────────────────────────────────
export const getPortfolio = async () => {
  try {
    const response = await axiosInstance.get("/portfolio");
    return response.data;
  } catch (error) {
    console.error("Portfolio error:", error);
    throw new Error(error.response?.data?.message || "Failed to fetch portfolio");
  }
};

export const addHolding = async (holding) => {
  try {
    const response = await axiosInstance.post("/portfolio/holdings", holding);
    return response.data;
  } catch (error) {
    console.error("Add holding error:", error);
    throw new Error(error.response?.data?.message || "Failed to add holding");
  }
};

export const removeHolding = async (id) => {
  try {
    const response = await axiosInstance.delete(`/portfolio/holdings/${id}`);
    return response.data;
  } catch (error) {
    console.error("Remove holding error:", error);
    throw new Error(error.response?.data?.message || "Failed to remove holding");
  }
};

export const refreshPortfolio = async () => {
  try {
    const response = await axiosInstance.post("/portfolio/refresh");
    return response.data;
  } catch (error) {
    console.error("Portfolio refresh error:", error);
    throw new Error(error.response?.data?.message || "Failed to refresh portfolio");
  }
};

export const getPortfolioAnalytics = async () => {
  try {
    const response = await axiosInstance.get("/portfolio/analytics");
    return response.data;
  } catch (error) {
    console.error("Portfolio analytics error:", error);
    throw new Error(error.response?.data?.message || "Failed to fetch portfolio analytics");
  }
};

// ─── Export ─────────────────────────────────────────────────
export const exportExpensesCSV = async (params = {}) => {
  try {
    const response = await axiosInstance.get("/export/expenses", { params, responseType: "blob" });
    const url = window.URL.createObjectURL(new Blob([response.data]));
    const a = document.createElement("a"); a.href = url; a.download = `expenses_${Date.now()}.csv`; a.click();
    window.URL.revokeObjectURL(url);
    return true;
  } catch (error) {
    console.error("Export error:", error);
    throw new Error("Failed to export expenses");
  }
};

export const exportSIPsCSV = async () => {
  try {
    const response = await axiosInstance.get("/export/sips", { responseType: "blob" });
    const url = window.URL.createObjectURL(new Blob([response.data]));
    const a = document.createElement("a"); a.href = url; a.download = `sips_${Date.now()}.csv`; a.click();
    window.URL.revokeObjectURL(url);
    return true;
  } catch (error) {
    console.error("Export error:", error);
    throw new Error("Failed to export SIPs");
  }
};

export const exportBillsCSV = async () => {
  try {
    const response = await axiosInstance.get("/export/bills", { responseType: "blob" });
    const url = window.URL.createObjectURL(new Blob([response.data]));
    const a = document.createElement("a"); a.href = url; a.download = `bills_${Date.now()}.csv`; a.click();
    window.URL.revokeObjectURL(url);
    return true;
  } catch (error) {
    console.error("Export error:", error);
    throw new Error("Failed to export bills");
  }
};

// ─── Spending Analytics ──────────────────────────────────────
export const getSpendingAnalytics = async (months = 6) => {
  try {
    const response = await axiosInstance.get("/analytics/spending", { params: { months } });
    return response.data;
  } catch (error) {
    console.error("Analytics error:", error);
    throw new Error(error.response?.data?.message || "Failed to fetch analytics");
  }
};

export const getMonthlyComparison = async () => {
  try {
    const response = await axiosInstance.get("/analytics/monthly-comparison");
    return response.data;
  } catch (error) {
    console.error("Monthly comparison error:", error);
    throw new Error(error.response?.data?.message || "Failed to fetch comparison");
  }
};

// ─── Net Worth ──────────────────────────────────────────────
export const calculateNetWorth = async () => {
  try {
    const response = await axiosInstance.post("/networth/calculate");
    return response.data;
  } catch (error) {
    console.error("Net worth error:", error);
    throw new Error(error.response?.data?.message || "Failed to calculate net worth");
  }
};

export const getNetWorthHistory = async (period = 30) => {
  try {
    const response = await axiosInstance.get("/networth/history", { params: { period } });
    return response.data;
  } catch (error) {
    console.error("Net worth history error:", error);
    throw new Error(error.response?.data?.message || "Failed to fetch net worth history");
  }
};

// ─── Price/NAV Alerts ────────────────────────────────────────
export const createAlert = async (alert) => {
  try {
    const response = await axiosInstance.post("/alerts", alert);
    return response.data;
  } catch (error) {
    console.error("Create alert error:", error);
    throw new Error(error.response?.data?.message || "Failed to create alert");
  }
};

export const getAlerts = async () => {
  try {
    const response = await axiosInstance.get("/alerts");
    return response.data;
  } catch (error) {
    console.error("Get alerts error:", error);
    throw new Error(error.response?.data?.message || "Failed to fetch alerts");
  }
};

export const updateAlert = async (id, data) => {
  try {
    const response = await axiosInstance.put(`/alerts/${id}`, data);
    return response.data;
  } catch (error) {
    console.error("Update alert error:", error);
    throw new Error(error.response?.data?.message || "Failed to update alert");
  }
};

export const deleteAlert = async (id) => {
  try {
    const response = await axiosInstance.delete(`/alerts/${id}`);
    return response.data;
  } catch (error) {
    console.error("Delete alert error:", error);
    throw new Error(error.response?.data?.message || "Failed to delete alert");
  }
};

export const checkAlerts = async () => {
  try {
    const response = await axiosInstance.get("/alerts/check");
    return response.data;
  } catch (error) {
    console.error("Check alerts error:", error);
    throw new Error(error.response?.data?.message || "Failed to check alerts");
  }
};

// ─── Receipt OCR ─────────────────────────────────────────────
export const processReceipt = async (file) => {
  try {
    const formData = new FormData();
    formData.append("receipt", file);
    const response = await axiosInstance.post("/receipts/process", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return response.data;
  } catch (error) {
    console.error("Receipt processing error:", error);
    throw new Error(error.response?.data?.message || "Failed to process receipt");
  }
};
