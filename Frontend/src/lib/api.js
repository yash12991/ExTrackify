import { axiosInstance } from "./axios.js";

export const signup = async (signupData) => {
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
    const res = await axiosInstance.get("/users/me");
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
  const response = await axiosInstance.delete(`/expenses/${id}`);
  return response.data;
};

export const getExpenses = async (period = "monthly") => {
  const response = await axiosInstance.get(`/expenses?period=${period}`);
  return response.data;
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

export const getGoals = async () => {
  const response = await axiosInstance.get("/goals");
  return response.data;
};
