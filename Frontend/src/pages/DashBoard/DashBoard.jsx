import React, { useState, useEffect, useCallback, useMemo } from "react";
import { motion } from "framer-motion";
import {
  FaWallet,
  FaChartPie,
  FaSignOutAlt,
  FaPlus,
  FaPiggyBank,
  FaChartLine,
  FaEllipsisV,
  FaEdit,
  FaTimes,
  FaRupeeSign,
  FaBullseye,
  FaCheckCircle,
  FaTrash,
  FaClock,
  FaCalendarAlt,
  FaArrowUp,
  FaArrowDown,
} from "react-icons/fa";
import AddExpense from "../../components/expense/AddExpense";
import EditExpense from "../../components/expense/EditExpense";
import BillsSummary from "../../components/bills/BillsSummary";
import "./DashBoard.css";
import {
  deleteExpense,
  getExpenses,
  getOverAllBudget,
  logout,
  updateOverallBudget,
  updateExpense,
  estimateGoal,
  createGoal,
  getGoals,
  updateGoal,
  deleteGoal,
  markGoalComplete,
  getAuthUser,
  getCategoryWiseSummary,
} from "../../lib/api.js";
import { Doughnut } from "react-chartjs-2";
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
} from "chart.js";

ChartJS.register(ArcElement, Tooltip, Legend);
import Loader from "../../components/Loading/Loading";
import { debounce } from "lodash";
import PropTypes from "prop-types";
import { useNavigate } from "react-router";
import { useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import DashboardLayout from "../../components/layout/DashboardLayout";

const DashBoard = () => {
  const navigate = useNavigate();
  const [selectedPeriod, setSelectedPeriod] = useState("monthly");
  const [showAddExpense, setShowAddExpense] = useState(false);
  const [userName, setUserName] = useState("");

  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [OverallBudget, setOverallbudget] = useState(0);
  const [showBudgetMenu, setShowBudgetMenu] = useState(false);
  const [showEditBudget, setShowEditBudget] = useState(false);
  const [newBudgetAmount, setNewBudgetAmount] = useState("");
  const [budgetUpdateLoading, setBudgetUpdateLoading] = useState(false);
  const [filters, setFilters] = useState({
    category: "",
    startDate: "",
    endDate: "",
    minAmount: "",
    maxAmount: "",
  });

  const [sortBy, setSortBy] = useState("date");
  const [sortOrder, setSortOrder] = useState("desc");

  // Add these state variables at the top with other state declarations
  const [deletingExpenseId, setDeletingExpenseId] = useState(null);
  const [showEditExpense, setShowEditExpense] = useState(false);
  const [expenseToEdit, setExpenseToEdit] = useState(null);
  const [editingExpenseId, setEditingExpenseId] = useState(null);

  // Category chart state
  const [categoryData, setCategoryData] = useState(null);

  // Goals state
  const [goals, setGoals] = useState([]);
  const [showGoalForm, setShowGoalForm] = useState(false);
  const [goalEstimate, setGoalEstimate] = useState(null);
  const [goalFormData, setGoalFormData] = useState({
    title: "",
    targetAmount: "",
    currentSaved: "",
    dailySavingRate: "",
    frequency: "daily",
  });
  const [goalFilter, setGoalFilter] = useState("all");
  const [editingGoal, setEditingGoal] = useState(null);
  const [goalsLoading, setGoalsLoading] = useState(false);
  const [goalError, setGoalError] = useState(null);

  // Memoize filter options to prevent unnecessary re-renders
  const categoryOptions = useMemo(
    () => [
      { value: "", label: "All Categories" },
      { value: "Food", label: "Food" },
      { value: "Transport", label: "Transport" },
      { value: "Housing", label: "Housing" },
      { value: "Utilities", label: "Utilities" },
      { value: "Healthcare", label: "Healthcare" },
      { value: "Entertainment", label: "Entertainment" },
      { value: "Shopping", label: "Shopping" },
      { value: "Other", label: "Other" },
    ],
    []
  );

  // Calculate totals from actual data instead of hardcoded values
  const totals = useMemo(() => {
    const totalExpense = expenses.reduce(
      (sum, expense) => sum + expense.amount,
      0
    );
    const remaining = OverallBudget - totalExpense;
    return { totalExpense, remaining };
  }, [expenses, OverallBudget]);

  const budgetUtilization = useMemo(() => {
    if (!OverallBudget || OverallBudget <= 0) return 0;
    return Math.min(100, Math.round((totals.totalExpense / OverallBudget) * 100));
  }, [totals.totalExpense, OverallBudget]);

  useEffect(() => {
    let isMounted = true;

    async function fetchExpense() {
      if (expenses.length === 0) setLoading(true);
      setError(null);
      try {
        const res = await getExpenses(
          1,
          9999,
          sortBy,
          sortOrder,
          filters.category,
          filters.startDate,
          filters.endDate,
          filters.minAmount,
          filters.maxAmount
        );

        if (!res || !res.data) {
          throw new Error("Network error: Failed to fetch expenses");
        }

        setExpenses(res.data);
      } catch (error) {
        setError(error.message || "An unknown error occurred");
        console.error("Failed to fetch expenses:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchExpense();

    const handleOverallBudget = async () => {
      const res = await getOverAllBudget();
      setOverallbudget(res);
    };
    handleOverallBudget();

    const fetchUserData = async () => {
      try {
        const userData = await getAuthUser();
        if (userData && userData.data) {
          // Extract username: use fullname first, then username, then email part
          const displayName = userData.data.fullname || 
                             userData.data.username || 
                             (userData.data.email ? userData.data.email.split('@')[0] : "User");
          setUserName(displayName);
        }
      } catch (error) {
        console.error("Failed to fetch user data:", error);
        setUserName("User"); // Fallback if fetch fails
      }
    };
    fetchUserData();

    const fetchCategoryData = async () => {
      try {
        const res = await getCategoryWiseSummary();
        if (res?.labels && res?.data) {
          setCategoryData(res.labels.map((label, i) => ({ _id: label, total: res.data[i] })));
        }
      } catch (err) {
        console.error("Failed to fetch category data:", err);
      }
    };
    fetchCategoryData();

    return () => {
      isMounted = false;
    };
  }, [filters, sortBy, sortOrder]);
  const [isloggedout, setIsLoggedout] = useState(false);

  const handleBudgetUpdate = async () => {
    if (!newBudgetAmount || isNaN(newBudgetAmount) || newBudgetAmount <= 0) {
      toast.error("Please enter a valid budget amount");
      // alert("Please enter a valid budget amount");

      return;
    }

    setBudgetUpdateLoading(true);
    try {
      await updateOverallBudget(Number(newBudgetAmount));
      setOverallbudget(Number(newBudgetAmount));
      setShowEditBudget(false);
      setNewBudgetAmount("");
      setShowBudgetMenu(false);
      // alert("Budget updated successfully!");
      toast.success("Budget updated successfully!");
    } catch (error) {
      console.error("Failed to update budget:", error);
      // alert("Failed to update budget. Please try again.");
      toast.error("Failed to update budget. Please try again.");
    } finally {
      setBudgetUpdateLoading(false);
    }
  };

  const queryClient2 = useQueryClient();

  const handleLogout = async () => {
    try {
      await logout();
      queryClient2.setQueryData(["auth"], null);
      navigate("/");
    } catch (error) {
      queryClient2.setQueryData(["auth"], null);
      navigate("/");
    }
  };

  // Add debounced filter updates to improve performance
  const debouncedUpdateFilters = useCallback(
    debounce((newFilters) => {
      setFilters(newFilters);
      setPage(1); // Reset to first page when filters change
    }, 300),
    []
  );

  const handleFilterChange = useCallback(
    (key, value) => {
      const newFilters = { ...filters, [key]: value };
      debouncedUpdateFilters(newFilters);
    },
    [filters, debouncedUpdateFilters]
  );

  const handleResetFilters = useCallback(() => {
    setFilters({
      category: "",
      startDate: "",
      endDate: "",
      minAmount: "",
      maxAmount: "",
    });
    setSortBy("date");
    setSortOrder("desc");
    setPage(1);
  }, []);

  // Add expense refresh function
  const refreshExpenses = useCallback(() => {
    setPage(1);
    // Trigger useEffect by updating a dependency
    setFilters((prev) => ({ ...prev }));
  }, []);

  // Replace the current deleteExpense button onClick with this improved function
  const handleDeleteExpense = async (expenseId) => {
    // Show confirmation dialog
    const isConfirmed = window.confirm(
      "Are you sure you want to delete this expense? This action cannot be undone."
    );

    if (!isConfirmed) return;

    setDeletingExpenseId(expenseId);

    try {
      await deleteExpense(expenseId);

      // Update local state to remove the deleted expense
      setExpenses((prevExpenses) =>
        prevExpenses.filter((expense) => expense._id !== expenseId)
      );

      toast.success("Expense deleted successfully!");

      // If we're on the last page and it becomes empty, go to previous page
      if (expenses.length === 1 && page > 1) {
        setPage((prevPage) => prevPage - 1);
      } else {
        // Refresh the current page to get updated data
        refreshExpenses();
      }
    } catch (error) {
      console.error("Failed to delete expense:", error);
      toast.error("Failed to delete expense. Please try again.");
    } finally {
      setDeletingExpenseId(null);
    }
  };

  // Add this function for handling edit expense
  const handleEditExpense = (expenseId) => {
    const expense = expenses.find((exp) => exp._id === expenseId);
    if (expense) {
      setExpenseToEdit(expense);
      setShowEditExpense(true);
    }
  };

  // Add function to handle expense update
  const handleUpdateExpense = async (updatedData) => {
    if (!expenseToEdit) return;

    setEditingExpenseId(expenseToEdit._id);

    try {
      // Call update API (you'll need to add this to your api.js)
      await updateExpense(expenseToEdit._id, updatedData);

      // Update local state
      setExpenses((prevExpenses) =>
        prevExpenses.map((expense) =>
          expense._id === expenseToEdit._id
            ? { ...expense, ...updatedData }
            : expense
        )
      );

      toast.success("Expense updated successfully!");
      setShowEditExpense(false);
      setExpenseToEdit(null);
    } catch (error) {
      console.error("Failed to update expense:", error);
      toast.error("Failed to update expense. Please try again.");
    } finally {
      setEditingExpenseId(null);
    }
  };

  // Goals functions
  const fetchGoals = useCallback(async () => {
    setGoalsLoading(true);
    setGoalError(null);
    try {
      const status = goalFilter === "all" ? "" : goalFilter;
      const goalsData = await getGoals(status);
      setGoals(goalsData || []);
    } catch (error) {
      console.error("Failed to fetch goals:", error);
      setGoalError(error.message || "Failed to fetch goals");
      toast.error("Failed to fetch goals");
      setGoals([]);
    } finally {
      setGoalsLoading(false);
    }
  }, [goalFilter]);

  const handleEstimateGoal = async () => {
    if (!goalFormData.targetAmount || !goalFormData.dailySavingRate) {
      toast.error("Please fill in target amount and saving rate");
      return;
    }

    try {
      const estimate = await estimateGoal({
        targetAmount: Number(goalFormData.targetAmount),
        currentSaved: Number(goalFormData.currentSaved) || 0,
        dailySavingRate: Number(goalFormData.dailySavingRate),
        frequency: goalFormData.frequency,
      });
      setGoalEstimate(estimate);
      toast.success("Goal estimation calculated!");
    } catch (error) {
      console.error("Error estimating goal:", error);
      toast.error("Failed to estimate goal");
    }
  };

  const handleSaveGoal = async () => {
    if (
      !goalFormData.title ||
      !goalFormData.targetAmount ||
      !goalFormData.dailySavingRate
    ) {
      toast.error("Please fill in all required fields");
      return;
    }

    try {
      await createGoal({
        title: goalFormData.title,
        targetAmount: Number(goalFormData.targetAmount),
        currentSaved: Number(goalFormData.currentSaved) || 0,
        dailySavingRate: Number(goalFormData.dailySavingRate),
        frequency: goalFormData.frequency,
      });
      toast.success("Goal created successfully!");
      setShowGoalForm(false);
      setGoalFormData({
        title: "",
        targetAmount: "",
        currentSaved: "",
        dailySavingRate: "",
        frequency: "daily",
      });
      setGoalEstimate(null);
      fetchGoals();
    } catch (error) {
      console.error("Error creating goal:", error);
      toast.error("Failed to create goal");
    }
  };

  const handleUpdateGoal = async (goalId, updates) => {
    try {
      await updateGoal(goalId, updates);
      toast.success("Goal updated successfully!");
      setEditingGoal(null);
      fetchGoals();
    } catch (error) {
      toast.error("Failed to update goal");
    }
  };

  const handleDeleteGoal = async (goalId) => {
    if (!window.confirm("Are you sure you want to delete this goal?")) return;

    try {
      await deleteGoal(goalId);
      toast.success("Goal deleted successfully!");
      fetchGoals();
    } catch (error) {
      toast.error("Failed to delete goal");
    }
  };

  const handleCompleteGoal = async (goalId) => {
    try {
      await markGoalComplete(goalId);
      toast.success("Goal marked as completed!");
      fetchGoals();
    } catch (error) {
      toast.error("Failed to complete goal");
    }
  };

  useEffect(() => {
    fetchGoals();
  }, [fetchGoals]);

  return (
    <DashboardLayout>
      <div className="dashboard-content-wrapper">
        <header className="dashboard-header">
          <div className="header-copy">
            <p className="eyebrow">Expense Overview</p>
            <h1>Hi {userName}, here is your financial snapshot</h1>
          </div>
          <button className="logout-btn" onClick={handleLogout}>
            <FaSignOutAlt /> Sign out
          </button>
        </header>

        <div className="dashboard-content-scroll">
        {/* Stats Cards */}
        <div className="stats-container">
          <motion.div className="stat-card" whileHover={{ scale: 1.02 }}>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "flex-start",
              }}
            >
              <h3>Budget</h3>
              <div style={{ position: "relative" }}>
                <button
                  className="budget-menu-trigger"
                  onClick={() => setShowBudgetMenu(!showBudgetMenu)}
                >
                  <FaEllipsisV size={12} />
                </button>
                {showBudgetMenu && (
                  <div className="budget-menu">
                    <button
                      onClick={() => {
                        setShowEditBudget(true);
                        setNewBudgetAmount(OverallBudget.toString());
                        setShowBudgetMenu(false);
                      }}
                    >
                      <FaEdit /> Edit Budget
                    </button>
                  </div>
                )}
              </div>
            </div>
            <div className="stat-value">₹{OverallBudget}</div>
            <div className="stat-label">Monthly Budget</div>
            <div className="budget-utilization">Used {budgetUtilization}%</div>
          </motion.div>

          <motion.div className="stat-card" whileHover={{ scale: 1.02 }}>
            <h3>Total Expense</h3>
            <div className="stat-value">
              ₹{totals.totalExpense.toLocaleString()}
            </div>
            <div className="stat-label">This Month</div>
          </motion.div>

          <motion.div className="stat-card" whileHover={{ scale: 1.02 }}>
            <h3>Goal</h3>
            <div className="stat-value">
              ₹{Math.max(0, totals.remaining).toLocaleString()}
            </div>
            <div className="stat-label">
              {totals.remaining >= 0 ? "Remaining" : "Over Budget"}
            </div>
          </motion.div>

          <motion.div
            className="stat-card add-expense"
            whileHover={{ scale: 1.02 }}
            onClick={() => setShowAddExpense(true)}
          >
            <FaPlus className="add-icon" />
            <h3>Add Expense</h3>
          </motion.div>
        </div>

        {/* Goals Section */}
        <section className="goals-section">
          <div className="section-header">
            <h2>
              <FaBullseye /> Savings Goals
            </h2>
            <div className="goal-controls">
              <select
                value={goalFilter}
                onChange={(e) => setGoalFilter(e.target.value)}
                className="goal-filter"
              >
                <option value="all">All Goals ({goals.length})</option>
                <option value="in-progress">
                  In Progress (
                  {goals.filter((g) => g.status === "in-progress").length})
                </option>
                <option value="completed">
                  Completed (
                  {goals.filter((g) => g.status === "completed").length})
                </option>
              </select>
              <button
                className="btn-primary add-goal-btn"
                onClick={() => setShowGoalForm(true)}
              >
                <FaPlus /> New Goal
              </button>
            </div>
          </div>

          {goalsLoading ? (
            <div className="goals-loading">
              <Loader />
              <p>Loading your goals...</p>
            </div>
          ) : goalError ? (
            <div className="error-container">
              <div className="error-message">
                Error loading goals: {goalError}
              </div>
              <button className="retry-btn" onClick={fetchGoals}>
                Retry
              </button>
            </div>
          ) : goals.length === 0 ? (
            <div className="empty-state goals-empty">
              <div className="empty-icon">
                <FaBullseye size={64} />
              </div>
              <h3>No savings goals yet</h3>
              <p>
                Start your financial journey by setting your first savings goal!
              </p>
              <div className="empty-suggestions">
                <div className="suggestion-item">
                  <FaPiggyBank />
                  <span>Emergency Fund</span>
                </div>
                <div className="suggestion-item">
                  <FaChartLine />
                  <span>Vacation Fund</span>
                </div>
                <div className="suggestion-item">
                  <FaWallet />
                  <span>New Gadget</span>
                </div>
              </div>
              <button
                className="btn-primary create-first-goal"
                onClick={() => setShowGoalForm(true)}
              >
                <FaPlus /> Create Your First Goal
              </button>
            </div>
          ) : (
            <div className="goals-grid">
              {goals.map((goal) => {
                const progress = Math.min(
                  (goal.currentSaved / goal.targetAmount) * 100,
                  100
                );
                const remainingAmount = Math.max(
                  goal.targetAmount - goal.currentSaved,
                  0
                );
                const daysRemaining =
                  remainingAmount > 0
                    ? Math.ceil(remainingAmount / goal.dailySavingRate)
                    : 0;
                const isCompleted = goal.status === "completed";
                const isNearCompletion = progress >= 90 && !isCompleted;

                return (
                  <motion.div
                    key={goal._id}
                    className={`goal-card ${goal.status} ${
                      isNearCompletion ? "near-completion" : ""
                    }`}
                    whileHover={{ scale: 1.02, y: -5 }}
                    transition={{ duration: 0.2 }}
                  >
                    <div className="goal-header">
                      <div className="goal-title-section">
                        <h3>{goal.title}</h3>
                        {isCompleted && (
                          <span className="completion-badge">
                            <FaCheckCircle /> Completed
                          </span>
                        )}
                        {isNearCompletion && (
                          <span className="near-completion-badge">
                            🎉 Almost there!
                          </span>
                        )}
                      </div>
                      <div className="goal-actions">
                        <button
                          onClick={() => setEditingGoal(goal)}
                          className="action-btn edit"
                          title="Edit goal"
                        >
                          <FaEdit />
                        </button>
                        {goal.status === "in-progress" && progress >= 100 && (
                          <button
                            onClick={() => handleCompleteGoal(goal._id)}
                            className="action-btn complete"
                            title="Mark as completed"
                          >
                            <FaCheckCircle />
                          </button>
                        )}
                        <button
                          onClick={() => handleDeleteGoal(goal._id)}
                          className="action-btn delete"
                          title="Delete goal"
                        >
                          <FaTrash />
                        </button>
                      </div>
                    </div>

                    <div className="goal-amount-section">
                      <div className="goal-amount">
                        <span className="saved">
                          ₹{goal.currentSaved.toLocaleString()}
                        </span>
                        <span className="separator">/</span>
                        <span className="target">
                          ₹{goal.targetAmount.toLocaleString()}
                        </span>
                      </div>
                      <div className="remaining-amount">
                        {remainingAmount > 0 ? (
                          <span>₹{remainingAmount.toLocaleString()} to go</span>
                        ) : (
                          <span className="goal-achieved">
                            🎯 Goal Achieved!
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="progress-section">
                      <div className="progress-bar">
                        <div
                          className={`progress-fill ${
                            isCompleted ? "completed" : ""
                          }`}
                          style={{ width: `${progress}%` }}
                        />
                        <span className="progress-text">
                          {progress.toFixed(1)}%
                        </span>
                      </div>
                    </div>

                    <div className="goal-stats">
                      <div className="stat-item">
                        <div className="stat-icon">
                          <FaRupeeSign />
                        </div>
                        <div className="stat-content">
                          <span className="stat-label">Daily Saving</span>
                          <span className="stat-value">
                            ₹{goal.dailySavingRate}
                          </span>
                        </div>
                      </div>

                      <div className="stat-item">
                        <div className="stat-icon">
                          <FaClock />
                        </div>
                        <div className="stat-content">
                          <span className="stat-label">Time Left</span>
                          <span className="stat-value">
                            {isCompleted ? (
                              <span className="completed-text">
                                <FaCheckCircle /> Done
                              </span>
                            ) : daysRemaining > 0 ? (
                              `${daysRemaining} days`
                            ) : (
                              "Ready to complete!"
                            )}
                          </span>
                        </div>
                      </div>

                      <div className="stat-item">
                        <div className="stat-icon">
                          <FaBullseye />
                        </div>
                        <div className="stat-content">
                          <span className="stat-label">Target Date</span>
                          <span className="stat-value">
                            {new Date(
                              goal.estimatedCompletionDate
                            ).toLocaleDateString("en-IN", {
                              day: "numeric",
                              month: "short",
                              year: "numeric",
                            })}
                          </span>
                        </div>
                      </div>
                    </div>

                    {!isCompleted &&
                      daysRemaining <= 7 &&
                      daysRemaining > 0 && (
                        <div className="urgency-indicator">
                          <FaClock /> Only {daysRemaining} days left!
                        </div>
                      )}
                  </motion.div>
                );
              })}
            </div>
          )}

          {goals.length > 0 && (
            <div className="goals-summary">
              <div className="summary-stat">
                <span className="summary-label">Total Goals:</span>
                <span className="summary-value">{goals.length}</span>
              </div>
              <div className="summary-stat">
                <span className="summary-label">Completed:</span>
                <span className="summary-value completed">
                  {goals.filter((g) => g.status === "completed").length}
                </span>
              </div>
              <div className="summary-stat">
                <span className="summary-label">In Progress:</span>
                <span className="summary-value in-progress">
                  {goals.filter((g) => g.status === "in-progress").length}
                </span>
              </div>
              <div className="summary-stat">
                <span className="summary-label">Total Target:</span>
                <span className="summary-value">
                  ₹
                  {goals
                    .reduce((sum, goal) => sum + goal.targetAmount, 0)
                    .toLocaleString()}
                </span>
              </div>
            </div>
          )}
        </section>

        {/* Bills Summary Section */}
        <section className="bills-summary-section">
          <BillsSummary />
        </section>

        {/* Analytics Section */}
        <section className="analytics-section">
          <div className="period-selector">
            <button
              className={`period-btn ${
                selectedPeriod === "daily" ? "active" : ""
              }`}
              onClick={() => setSelectedPeriod("daily")}
            >
              Daily
            </button>
            <button
              className={`period-btn ${
                selectedPeriod === "weekly" ? "active" : ""
              }`}
              onClick={() => setSelectedPeriod("weekly")}
            >
              Weekly
            </button>
            <button
              className={`period-btn ${
                selectedPeriod === "monthly" ? "active" : ""
              }`}
              onClick={() => setSelectedPeriod("monthly")}
            >
              Monthly
            </button>
          </div>

          <div className="charts-grid">
            <div className="chart-card">
              <h3>Expense Breakdown</h3>
              <div className="chart-wrapper">
                {categoryData && categoryData.length > 0 ? (
                  <Doughnut
                    data={{
                      labels: categoryData.map((c) => c._id),
                      datasets: [{
                        data: categoryData.map((c) => c.total),
                        backgroundColor: [
                          "#FF6384", "#36A2EB", "#FFCE56", "#4BC0C0",
                          "#9966FF", "#FF9F40", "#C9CBCF", "#7BC8A4",
                        ],
                        borderWidth: 0,
                      }],
                    }}
                    options={{
                      responsive: true,
                      maintainAspectRatio: true,
                      cutout: "65%",
                      plugins: {
                        legend: {
                          position: "bottom",
                          labels: {
                            padding: 12,
                            usePointStyle: true,
                            pointStyle: "circle",
                            font: { size: 11 },
                          },
                        },
                      },
                    }}
                  />
                ) : (
                  <div className="placeholder-chart">No expense data</div>
                )}
              </div>
            </div>
          </div>
        </section>



        {/* Recent Activity - Add better error handling */}
        <section className="recent-activity">
          <div className="section-header">
            <h2>Recent Expenses</h2>
            <button
              className="refresh-btn"
              onClick={refreshExpenses}
              disabled={loading}
            >
              Refresh
            </button>
          </div>
          {loading ? (
            <Loader />
          ) : error ? (
            <div className="error-container">
              <div className="error-message">
                Error loading expenses: {error}
              </div>
              <button className="retry-btn" onClick={refreshExpenses}>
                Retry
              </button>
            </div>
          ) : (
            <div className="table-container">
              <div className="table-filters-bar">
                <div className="tf-left">
                  <div className="tf-categories">
                    {categoryOptions.map((option) => (
                      <button
                        key={option.value}
                        type="button"
                        className={`tf-chip ${filters.category === option.value ? "active" : ""}`}
                        onClick={() => handleFilterChange("category", filters.category === option.value ? "" : option.value)}
                      >
                        {option.label}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="tf-right">
                  <div className="tf-group">
                    <input
                      type="date"
                      value={filters.startDate}
                      onChange={(e) => handleFilterChange("startDate", e.target.value)}
                      title="Start Date"
                    />
                    <span>—</span>
                    <input
                      type="date"
                      value={filters.endDate}
                      onChange={(e) => handleFilterChange("endDate", e.target.value)}
                      title="End Date"
                    />
                  </div>
                  <div className="tf-group">
                    <input
                      type="number"
                      value={filters.minAmount}
                      onChange={(e) => handleFilterChange("minAmount", e.target.value)}
                      placeholder="Min ₹"
                    />
                    <span>—</span>
                    <input
                      type="number"
                      value={filters.maxAmount}
                      onChange={(e) => handleFilterChange("maxAmount", e.target.value)}
                      placeholder="Max ₹"
                    />
                  </div>
                  <div className="tf-group">
                    <select value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
                      <option value="date">Date</option>
                      <option value="amount">Amount</option>
                      <option value="category">Category</option>
                    </select>
                    <button type="button" className="tf-sort-order" onClick={() => setSortOrder(sortOrder === "desc" ? "asc" : "desc")}>
                      {sortOrder === "desc" ? <FaArrowDown /> : <FaArrowUp />}
                    </button>
                  </div>
                  {(filters.category || filters.startDate || filters.endDate || filters.minAmount || filters.maxAmount || sortBy !== "date" || sortOrder !== "desc") && (
                    <button type="button" className="tf-clear" onClick={handleResetFilters}>Reset</button>
                  )}
                </div>
              </div>
              <table>
                <thead>
                  <tr>
                    <th>Category</th>
                    <th>Amount</th>
                    <th>Date & Time</th>
                    <th>Payment Mode</th>
                    <th>Notes</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                {Array.isArray(expenses) && expenses.length > 0 ? (
                  <tbody>
                    {expenses.map((expense) => (
                      <tr key={expense._id}>
                        <td>{expense.category}</td>
                        <td>₹{expense.amount}</td>
                        <td>
                          <div>
                            {new Date(expense.date).toLocaleDateString()}
                          </div>
                          <div style={{ fontSize: "0.8em", color: "#666" }}>
                            {expense.createdAt
                              ? new Date(expense.createdAt).toLocaleTimeString()
                              : "N/A"}
                          </div>
                        </td>
                        <td>{expense.modeofpayment}</td>
                        <td>{expense.notes || "No notes"}</td>
                        <td>
                          <div className="table-actions">
                            <button
                              className="table-action-btn edit"
                              onClick={() => handleEditExpense(expense._id)}
                              title="Edit expense"
                            >
                              <FaEdit />
                            </button>
                            <button
                              className="table-action-btn delete"
                              onClick={() => handleDeleteExpense(expense._id)}
                              disabled={deletingExpenseId === expense._id}
                              title="Delete expense"
                            >
                              {deletingExpenseId === expense._id ? (
                                <div className="loading-spinner" />
                              ) : (
                                <FaTrash />
                              )}
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                ) : (
                  <tbody>
                    <tr>
                      <td colSpan="6" className="text-center">
                        No expenses found
                      </td>
                    </tr>
                  </tbody>
                )}
              </table>
              {error && (
                <div className="error-message">
                  Error loading expenses: {error}
                </div>
              )}

            </div>
          )}
        </section>
      {/* Add Expense Modal */}
      {showAddExpense && (
        <AddExpense
          onClose={() => setShowAddExpense(false)}
          onSubmit={(data) => {
            console.log(data);
            setShowAddExpense(false);
            refreshExpenses(); // Refresh expenses after adding
          }}
        />
      )}

      {/* Edit Expense Modal */}
      {showEditExpense && expenseToEdit && (
        <EditExpense
          expense={expenseToEdit}
          onClose={() => {
            setShowEditExpense(false);
            setExpenseToEdit(null);
          }}
          onSubmit={handleUpdateExpense}
          isLoading={editingExpenseId === expenseToEdit._id}
        />
      )}

      {/* Edit Budget Modal */}
      {showEditBudget && (
        <div className="modal-overlay">
          <div className="modal-content">
            <button
              className="budget-close-btn"
              onClick={() => {
                setShowEditBudget(false);
                setNewBudgetAmount("");
              }}
            >
              <FaTimes />
            </button>

            <h3>Update Monthly Budget</h3>
            <p className="subtitle">
              Set your spending limit for better financial control
            </p>

            <div className="budget-input-group">
              <label>Budget Amount</label>
              <div className="input-wrapper">
                <FaRupeeSign className="budget-currency-icon" />
                <input
                  type="number"
                  value={newBudgetAmount}
                  onChange={(e) => setNewBudgetAmount(e.target.value)}
                  placeholder="Enter budget amount"
                  min="0"
                  step="0.01"
                />
              </div>
              <small className="input-hint">
                Current budget: ₹{OverallBudget.toLocaleString()}
              </small>
            </div>

            <div className="budget-actions">
              <button
                className="budget-btn cancel"
                onClick={() => {
                  setShowEditBudget(false);
                  setNewBudgetAmount("");
                }}
                disabled={budgetUpdateLoading}
              >
                Cancel
              </button>
              <button
                className="budget-btn update"
                onClick={handleBudgetUpdate}
                disabled={budgetUpdateLoading}
              >
                {budgetUpdateLoading ? (
                  <>
                    <div className="loading-spinner" />
                    Updating...
                  </>
                ) : (
                  <>
                    <FaRupeeSign />
                    Update Budget
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Goal Form Modal */}
      {showGoalForm && (
        <div className="modal-overlay">
          <div className="modal-content goal-modal">
            <div className="goal-modal-header">
              <div className="goal-header-content">
                <div className="goal-icon-wrapper">
                  <FaBullseye className="goal-icon" />
                </div>
                <div>
                  <h3>Create New Savings Goal</h3>
                  <p className="goal-subtitle">Set your target and watch your savings grow</p>
                </div>
              </div>
              <button
                className="close-btn"
                onClick={() => {
                  setShowGoalForm(false);
                  setGoalEstimate(null);
                  setGoalFormData({
                    title: "",
                    targetAmount: "",
                    currentSaved: "",
                    dailySavingRate: "",
                    frequency: "daily",
                  });
                }}
              >
                <FaTimes />
              </button>
            </div>

            <div className="goal-form">
              <div className="form-group full-width">
                <label>
                  <FaPiggyBank className="label-icon" />
                  Goal Title
                </label>
                <div className="input-with-icon">
                  <input
                    type="text"
                    value={goalFormData.title}
                    onChange={(e) =>
                      setGoalFormData({ ...goalFormData, title: e.target.value })
                    }
                    placeholder="e.g., Buy Laptop, Vacation Fund"
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>
                    <FaBullseye className="label-icon" />
                    Target Amount
                  </label>
                  <div className="input-with-icon">
                    <FaRupeeSign className="input-icon" />
                    <input
                      type="number"
                      value={goalFormData.targetAmount}
                      onChange={(e) =>
                        setGoalFormData({
                          ...goalFormData,
                          targetAmount: e.target.value,
                        })
                      }
                      placeholder="50000"
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label>
                    <FaWallet className="label-icon" />
                    Current Saved
                  </label>
                  <div className="input-with-icon">
                    <FaRupeeSign className="input-icon" />
                    <input
                      type="number"
                      value={goalFormData.currentSaved}
                      onChange={(e) =>
                        setGoalFormData({
                          ...goalFormData,
                          currentSaved: e.target.value,
                        })
                      }
                      placeholder="5000"
                    />
                  </div>
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>
                    <FaChartLine className="label-icon" />
                    Saving Rate
                  </label>
                  <div className="input-with-icon">
                    <FaRupeeSign className="input-icon" />
                    <input
                      type="number"
                      value={goalFormData.dailySavingRate}
                      onChange={(e) =>
                        setGoalFormData({
                          ...goalFormData,
                          dailySavingRate: e.target.value,
                        })
                      }
                      placeholder="500"
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label>
                    <FaClock className="label-icon" />
                    Frequency
                  </label>
                  <select
                    value={goalFormData.frequency}
                    onChange={(e) =>
                      setGoalFormData({
                        ...goalFormData,
                        frequency: e.target.value,
                      })
                    }
                  >
                    <option value="daily">Daily</option>
                    <option value="weekly">Weekly</option>
                  </select>
                </div>
              </div>

              <button
                className="estimate-btn"
                onClick={handleEstimateGoal}
                disabled={
                  !goalFormData.targetAmount || !goalFormData.dailySavingRate
                }
              >
                <FaClock />
                Calculate Timeline
              </button>

              {goalEstimate && (
                <div className="estimate-result">
                  <div className="estimate-header">
                    <FaCheckCircle className="estimate-icon" />
                    <h4>Timeline Calculated</h4>
                  </div>
                  <div className="estimate-details">
                    <div className="estimate-item">
                      <div className="estimate-label">
                        <FaClock /> Days Needed
                      </div>
                      <div className="estimate-value">{goalEstimate.daysNeeded} days</div>
                    </div>
                    <div className="estimate-item">
                      <div className="estimate-label">
                        <FaCalendarAlt /> Expected Date
                      </div>
                      <div className="estimate-value">
                        {new Date(
                          goalEstimate.estimatedCompletionDate
                        ).toLocaleDateString('en-IN', {
                          day: 'numeric',
                          month: 'long',
                          year: 'numeric'
                        })}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              <div className="form-actions">
                <button
                  className="btn-secondary"
                  onClick={() => {
                    setShowGoalForm(false);
                    setGoalEstimate(null);
                  }}
                >
                  Cancel
                </button>
                <button
                  className="btn-primary"
                  onClick={handleSaveGoal}
                  disabled={
                    !goalFormData.title ||
                    !goalFormData.targetAmount ||
                    !goalFormData.dailySavingRate
                  }
                >
                  <FaCheckCircle />
                  Create Goal
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Edit Goal Modal */}
      {editingGoal && (
        <div className="modal-overlay">
          <div className="modal-content goal-modal">
            <div className="goal-modal-header">
              <div className="goal-header-content">
                <div className="goal-icon-wrapper">
                  <FaEdit className="goal-icon" />
                </div>
                <div>
                  <h3>Edit Savings Goal</h3>
                  <p className="goal-subtitle">Update your progress for "{editingGoal.title}"</p>
                </div>
              </div>
              <button
                className="close-btn"
                onClick={() => setEditingGoal(null)}
              >
                <FaTimes />
              </button>
            </div>

            <div className="goal-form">
              <div className="form-row">
                <div className="form-group">
                  <label>
                    <FaWallet className="label-icon" />
                    Current Saved
                  </label>
                  <div className="input-with-icon">
                    <FaRupeeSign className="input-icon" />
                    <input
                      type="number"
                      defaultValue={editingGoal.currentSaved}
                      onChange={(e) =>
                        setEditingGoal({
                          ...editingGoal,
                          currentSaved: Number(e.target.value),
                        })
                      }
                      placeholder="Enter current amount"
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label>
                    <FaChartLine className="label-icon" />
                    Daily Saving Rate
                  </label>
                  <div className="input-with-icon">
                    <FaRupeeSign className="input-icon" />
                    <input
                      type="number"
                      defaultValue={editingGoal.dailySavingRate}
                      onChange={(e) =>
                        setEditingGoal({
                          ...editingGoal,
                          dailySavingRate: Number(e.target.value),
                        })
                      }
                      placeholder="Enter daily saving rate"
                    />
                  </div>
                </div>
              </div>

              <div className="form-actions">
                <button
                  className="btn-secondary"
                  onClick={() => setEditingGoal(null)}
                >
                  Cancel
                </button>
                <button
                  className="btn-primary"
                  onClick={() =>
                    handleUpdateGoal(editingGoal._id, {
                      currentSaved: editingGoal.currentSaved,
                      dailySavingRate: editingGoal.dailySavingRate,
                    })
                  }
                >
                  <FaCheckCircle />
                  Update Goal
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      </div>
      </div>
    </DashboardLayout>
  );
};

DashBoard.propTypes = {
  userName: PropTypes.string,
};

export default DashBoard;
