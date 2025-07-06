import toast from "react-hot-toast";
import { axiosInstance } from "./axios.js";

// Add OTP functions
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
    const response = await axiosInstance.get("/api/v1/goals/analytics");
    return response.data.data;
  } catch (error) {
    console.error("Error fetching goal analytics:", error);
    throw new Error(
      error.response?.data?.message || "Failed to fetch goal analytics"
    );
  }
};

export const getOverAllBudget = async () => {
  const response = await axiosInstance.get("/budgets/overall");
  console.log(response);
  return response.data.data.amount;
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
    throw new Error(error.response?.data?.message || "Failed to mark bill as paid");
  }
};

export const getBillsSummary = async () => {
  try {
    const response = await axiosInstance.get("/bills/summary");
    return response.data.data;
  } catch (error) {
    console.error("Error fetching bills summary:", error);
    throw new Error(error.response?.data?.message || "Failed to fetch bills summary");
  }
};

export const getBillsByCategory = async () => {
  try {
    const response = await axiosInstance.get("/bills/category");
    return response.data.data;
  } catch (error) {
    console.error("Error fetching bills by category:", error);
    throw new Error(error.response?.data?.message || "Failed to fetch bills by category");
  }
};

export const getMonthlyBillsTotal = async (year, month) => {
  try {
    const response = await axiosInstance.get("/bills/monthly-total", {
      params: { year, month }
    });
    return response.data.data;
  } catch (error) {
    console.error("Error fetching monthly bills total:", error);
    throw new Error(error.response?.data?.message || "Failed to fetch monthly bills total");
  }
};
