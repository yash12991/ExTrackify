import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  FaPlus,
  FaEye,
  FaEdit,
  FaTrash,
  FaChartLine,
  FaRupeeSign,
  FaCalendarAlt,
  FaBullseye,
  FaBell,
  FaPlay,
  FaPause,
  FaArrowUp,
  FaArrowRight,
  FaPiggyBank,
  FaClock,
} from "react-icons/fa";
import { Line, Doughnut } from "react-chartjs-2";
import toast from "react-hot-toast";
import {
  getAllSIPs,
  deleteSIP,
  createSIP,
  updateSIP,
  getSIPSummary,
  getSIPChartData,
  getUpcomingPayments,
} from "../../lib/api";
import "./SIPDashboard.css";

const SIPDashboard = () => {
  const navigate = useNavigate();
  const [sips, setSips] = useState([]);
  const [summary, setSummary] = useState(null);
  const [chartData, setChartData] = useState(null);
  const [upcomingPayments, setUpcomingPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingSIP, setEditingSIP] = useState(null);
  const [filter, setFilter] = useState("all"); // all, active, inactive

  const [createFormData, setCreateFormData] = useState({
    sipName: "",
    amount: "",
    startDate: new Date().toISOString().split("T")[0],
    durationInMonths: 12,
    frequency: "monthly",
    goal: "",
    notes: "",
    expectedRate: 12,
  });

  const [editFormData, setEditFormData] = useState({
    sipName: "",
    amount: "",
    startDate: "",
    durationInMonths: 12,
    frequency: "monthly",
    goal: "",
    notes: "",
    expectedRate: 12,
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [sipsData, summaryData, chartDataResult, upcomingData] =
        await Promise.all([
          getAllSIPs(),
          getSIPSummary(),
          getSIPChartData(),
          getUpcomingPayments(30),
        ]);
      setSips(sipsData);
      setSummary(summaryData);
      setChartData(chartDataResult);
      setUpcomingPayments(upcomingData);
    } catch (error) {
      console.error("Error fetching SIP data:", error);
      toast.error("Failed to fetch SIP data");
    } finally {
      setLoading(false);
    }
  };

  // Intersection Observer for scroll animations
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("visible");
          }
        });
      },
      {
        threshold: 0.1,
        rootMargin: "0px 0px -50px 0px",
      }
    );

    // Observe all SIP cards
    const cards = document.querySelectorAll(".sip-card");
    cards.forEach((card) => observer.observe(card));

    return () => {
      cards.forEach((card) => observer.unobserve(card));
    };
  }, [sips]); // Re-run when SIPs change

  // Calculate expected maturity value for preview
  const calculateExpectedMaturity = () => {
    const amount = parseFloat(createFormData.amount) || 0;
    const rate = parseFloat(createFormData.expectedRate) || 0;
    const duration = parseInt(createFormData.durationInMonths) || 0;
    const frequency = createFormData.frequency;

    if (!amount || !rate || !duration) return 0;

    const monthlyRate = rate / 12 / 100;
    let maturityValue = 0;

    switch (frequency) {
      case "monthly":
        maturityValue =
          amount *
          (((Math.pow(1 + monthlyRate, duration) - 1) / monthlyRate) *
            (1 + monthlyRate));
        break;
      case "quarterly":
        const quarterlyRate = rate / 4 / 100;
        const quarterlyDuration = Math.ceil(duration / 3);
        maturityValue =
          amount *
          (((Math.pow(1 + quarterlyRate, quarterlyDuration) - 1) /
            quarterlyRate) *
            (1 + quarterlyRate));
        break;
      case "yearly":
        const annualRate = rate / 100;
        const yearlyDuration = Math.ceil(duration / 12);
        maturityValue =
          amount *
          (((Math.pow(1 + annualRate, yearlyDuration) - 1) / annualRate) *
            (1 + annualRate));
        break;
      default:
        maturityValue =
          amount *
          (((Math.pow(1 + monthlyRate, duration) - 1) / monthlyRate) *
            (1 + monthlyRate));
    }

    return maturityValue;
  };

  const handleCreateSIP = async (e) => {
    e.preventDefault();
    try {
      await createSIP({
        ...createFormData,
        amount: Number(createFormData.amount),
        durationInMonths: Number(createFormData.durationInMonths),
      });
      toast.success("SIP created successfully!");
      setShowCreateModal(false);
      setCreateFormData({
        sipName: "",
        amount: "",
        startDate: new Date().toISOString().split("T")[0],
        durationInMonths: 12,
        frequency: "monthly",
        goal: "",
        notes: "",
        expectedRate: 12,
      });
      fetchData();
    } catch (error) {
      toast.error("Failed to create SIP");
    }
  };

  const handleEditSIP = (sip) => {
    setEditingSIP(sip);
    setEditFormData({
      sipName: sip.sipName,
      amount: sip.amount.toString(),
      startDate: new Date(sip.startDate).toISOString().split("T")[0],
      durationInMonths: sip.durationInMonths,
      frequency: sip.frequency,
      goal: sip.goal || "",
      notes: sip.notes || "",
      expectedRate: sip.expectedRate || 12,
    });
    setShowEditModal(true);
  };

  const handleUpdateSIP = async (e) => {
    e.preventDefault();
    try {
      await updateSIP(editingSIP._id, {
        ...editFormData,
        amount: Number(editFormData.amount),
        durationInMonths: Number(editFormData.durationInMonths),
        expectedRate: Number(editFormData.expectedRate),
      });
      toast.success("SIP updated successfully!");
      setShowEditModal(false);
      setEditingSIP(null);
      fetchData();
    } catch (error) {
      toast.error("Failed to update SIP");
    }
  };

  const calculateEditExpectedMaturity = () => {
    const amount = parseFloat(editFormData.amount) || 0;
    const rate = parseFloat(editFormData.expectedRate) || 0;
    const duration = parseInt(editFormData.durationInMonths) || 0;
    const frequency = editFormData.frequency;

    if (!amount || !rate || !duration) return 0;

    const monthlyRate = rate / 12 / 100;
    let maturityValue = 0;

    switch (frequency) {
      case "monthly":
        maturityValue =
          amount *
          (((Math.pow(1 + monthlyRate, duration) - 1) / monthlyRate) *
            (1 + monthlyRate));
        break;
      case "quarterly":
        const quarterlyRate = rate / 4 / 100;
        const quarterlyDuration = Math.ceil(duration / 3);
        maturityValue =
          amount *
          (((Math.pow(1 + quarterlyRate, quarterlyDuration) - 1) /
            quarterlyRate) *
            (1 + quarterlyRate));
        break;
      case "yearly":
        const annualRate = rate / 100;
        const yearlyDuration = Math.ceil(duration / 12);
        maturityValue =
          amount *
          (((Math.pow(1 + annualRate, yearlyDuration) - 1) / annualRate) *
            (1 + annualRate));
        break;
      default:
        maturityValue =
          amount *
          (((Math.pow(1 + monthlyRate, duration) - 1) / monthlyRate) *
            (1 + monthlyRate));
    }

    return maturityValue;
  };

  const handleDeleteSIP = async (sipId, sipName) => {
    if (window.confirm(`Are you sure you want to delete "${sipName}"?`)) {
      try {
        await deleteSIP(sipId);
        toast.success("SIP deleted successfully!");
        fetchData();
      } catch (error) {
        toast.error("Failed to delete SIP");
      }
    }
  };

  const filteredSIPs = sips.filter((sip) => {
    if (filter === "active") return sip.isActive;
    if (filter === "inactive") return !sip.isActive;
    return true;
  });

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <div className="loading-text">
          Loading your SIP portfolio
          <div className="loading-dots">
            <span></span>
            <span></span>
            <span></span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="sip-dashboard">
      {/* Header */}
      <div className="dashboard-header">
        <div className="header-content">
          <h1>SIP Portfolio</h1>
          <p>Systematic Investment Plans Dashboard</p>
        </div>
        <button
          className="create-sip-btn"
          onClick={() => setShowCreateModal(true)}
        >
          <FaPlus /> Create New SIP
        </button>
      </div>

      {/* Summary Cards */}
      {summary && (
        <div className="summary-grid">
          <motion.div
            className="summary-card total"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="card-icon">
              <FaPiggyBank />
            </div>
            <div className="card-content">
              <h3>Total SIPs</h3>
              <div className="card-value">{summary.totalSIPs}</div>
              <div className="card-subtitle">{summary.activeSIPs} active</div>
            </div>
          </motion.div>

          <motion.div
            className="summary-card investment"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
          >
            <div className="card-icon">
              <FaRupeeSign />
            </div>
            <div className="card-content">
              <h3>Total Investment</h3>
              <div className="card-value">
                ₹{summary.totalInvestment.toLocaleString()}
              </div>
              <div className="card-subtitle">
                ₹{summary.totalPaid.toLocaleString()} paid
              </div>
            </div>
          </motion.div>

          <motion.div
            className="summary-card monthly"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <div className="card-icon">
              <FaCalendarAlt />
            </div>
            <div className="card-content">
              <h3>Monthly Commitment</h3>
              <div className="card-value">
                ₹{summary.monthlyCommitment.toLocaleString()}
              </div>
              <div className="card-subtitle">per month</div>
            </div>
          </motion.div>

          <motion.div
            className="summary-card upcoming"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
          >
            <div className="card-icon">
              <FaBell />
            </div>
            <div className="card-content">
              <h3>Upcoming Payments</h3>
              <div className="card-value">
                {summary.upcomingPayments.length}
              </div>
              <div className="card-subtitle">in next 30 days</div>
            </div>
          </motion.div>
        </div>
      )}

      {/* Charts Section */}
      {chartData && (
        <div className="charts-section">
          <motion.div
            className="chart-card"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
          >
            <h3>Investment Growth Projection</h3>
            <div className="chart-container">
              <Line
                data={chartData}
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  plugins: {
                    legend: {
                      position: "top",
                    },
                  },
                  scales: {
                    y: {
                      beginAtZero: true,
                    },
                  },
                }}
              />
            </div>
          </motion.div>
        </div>
      )}

      {/* Upcoming Payments Alert */}
      {upcomingPayments && upcomingPayments.length > 0 && (
        <motion.div
          className="upcoming-payments-alert"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.5 }}
        >
          <div className="alert-header">
            <FaBell />
            <h3>Upcoming Payments ({upcomingPayments.length})</h3>
          </div>
          <div className="upcoming-payments-list">
            {upcomingPayments.slice(0, 5).map((payment) => (
              <div key={payment.sipId} className="upcoming-payment-item">
                <div className="payment-info">
                  <div className="payment-name">{payment.sipName}</div>
                  <div className="payment-details">
                    <span className="payment-amount">
                      ₹{payment.amount.toLocaleString()}
                    </span>
                    <span className="payment-frequency">
                      ({payment.frequency})
                    </span>
                  </div>
                  <div className="payment-maturity">
                    Target: ₹{payment.expectedMaturityValue?.toLocaleString()}
                    at {payment.expectedRate}% p.a.
                  </div>
                </div>
                <div className="payment-due">
                  <div
                    className={`due-days ${
                      payment.daysUntil <= 3
                        ? "urgent"
                        : payment.daysUntil <= 7
                        ? "warning"
                        : ""
                    }`}
                  >
                    {payment.daysUntil === 0
                      ? "Due Today"
                      : payment.daysUntil < 0
                      ? `${Math.abs(payment.daysUntil)} days overdue`
                      : `${payment.daysUntil} days`}
                  </div>
                  <div className="due-date">
                    {new Date(payment.dueDate).toLocaleDateString("en-IN")}
                  </div>
                </div>
              </div>
            ))}
          </div>
          {upcomingPayments.length > 5 && (
            <div className="view-all-payments">
              <button onClick={() => navigate("/sip-dashboard")}>
                View All {upcomingPayments.length} Upcoming Payments
              </button>
            </div>
          )}
        </motion.div>
      )}

      {/* Filter and SIP List */}
      <div className="sips-section">
        <div className="section-header">
          <h2>Your SIPs</h2>
          <div className="filter-tabs">
            <button
              className={filter === "all" ? "active" : ""}
              onClick={() => setFilter("all")}
            >
              All ({sips.length})
            </button>
            <button
              className={filter === "active" ? "active" : ""}
              onClick={() => setFilter("active")}
            >
              Active ({sips.filter((s) => s.isActive).length})
            </button>
            <button
              className={filter === "inactive" ? "active" : ""}
              onClick={() => setFilter("inactive")}
            >
              Inactive ({sips.filter((s) => !s.isActive).length})
            </button>
          </div>
        </div>

        {filteredSIPs.length === 0 ? (
          <div className="no-sips">
            <FaPiggyBank />
            <h3>No SIPs found</h3>
            <p>Start your investment journey by creating your first SIP</p>
            <button
              className="create-first-sip-btn"
              onClick={() => setShowCreateModal(true)}
            >
              <FaPlus /> Create Your First SIP
            </button>
          </div>
        ) : (
          <div className="sips-grid">
            {filteredSIPs.map((sip, index) => (
              <motion.div
                key={sip._id}
                className="sip-card"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
              >
                <div className="sip-header">
                  <div className="sip-info">
                    <h3>{sip.sipName}</h3>
                    <p className="sip-goal">{sip.goal}</p>
                  </div>
                  <div className="sip-status">
                    <span
                      className={`status-badge ${
                        sip.isActive ? "active" : "inactive"
                      }`}
                    >
                      {sip.isActive ? <FaPlay /> : <FaPause />}
                      {sip.isActive ? "Active" : "Paused"}
                    </span>
                  </div>
                </div>

                <div className="sip-details">
                  <div className="detail-item">
                    <FaRupeeSign />
                    <span>₹{sip.amount.toLocaleString()}</span>
                    <small>/{sip.frequency}</small>
                  </div>
                  <div className="detail-item">
                    <FaCalendarAlt />
                    <span>{sip.durationInMonths} months</span>
                  </div>
                  <div className="detail-item">
                    <FaClock />
                    <span>
                      {new Date(sip.nextPaymentDate).toLocaleDateString(
                        "en-IN"
                      )}
                    </span>
                    <small>next payment</small>
                  </div>
                  {sip.expectedMaturityValue && (
                    <div className="detail-item maturity">
                      <FaBullseye />
                      <span>₹{sip.expectedMaturityValue.toLocaleString()}</span>
                      <small>expected @ {sip.expectedRate}%</small>
                    </div>
                  )}
                </div>

                <div className="sip-progress">
                  <div className="progress-info">
                    <span>Progress</span>
                    <span>₹{sip.totalInvested.toLocaleString()}</span>
                  </div>
                  <div className="progress-bar">
                    <div
                      className="progress-fill"
                      style={{
                        width: `${Math.min(
                          (sip.totalInvested /
                            (sip.amount * sip.durationInMonths)) *
                            100,
                          100
                        )}%`,
                      }}
                    />
                  </div>
                </div>

                <div className="sip-actions">
                  <button
                    className="action-btn view"
                    onClick={() => navigate(`/sip/${sip._id}`)}
                  >
                    <FaEye /> View
                  </button>
                  <button
                    className="action-btn edit"
                    onClick={() => handleEditSIP(sip)}
                  >
                    <FaEdit /> Edit
                  </button>
                  <button
                    className="action-btn delete"
                    onClick={() => handleDeleteSIP(sip._id, sip.sipName)}
                  >
                    <FaTrash />
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* Create SIP Modal */}
      {showCreateModal && (
        <div
          className="modal-overlay"
          onClick={() => setShowCreateModal(false)}
        >
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Create New SIP</h3>
              <button onClick={() => setShowCreateModal(false)}>×</button>
            </div>
            <form onSubmit={handleCreateSIP}>
              <div className="form-row">
                <div className="form-group">
                  <label>SIP Name *</label>
                  <input
                    type="text"
                    value={createFormData.sipName}
                    onChange={(e) =>
                      setCreateFormData({
                        ...createFormData,
                        sipName: e.target.value,
                      })
                    }
                    placeholder="e.g., Retirement Fund"
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Monthly Amount *</label>
                  <input
                    type="number"
                    value={createFormData.amount}
                    onChange={(e) =>
                      setCreateFormData({
                        ...createFormData,
                        amount: e.target.value,
                      })
                    }
                    placeholder="5000"
                    min="1000"
                    required
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Start Date *</label>
                  <input
                    type="date"
                    value={createFormData.startDate}
                    onChange={(e) =>
                      setCreateFormData({
                        ...createFormData,
                        startDate: e.target.value,
                      })
                    }
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Duration (Months) *</label>
                  <select
                    value={createFormData.durationInMonths}
                    onChange={(e) =>
                      setCreateFormData({
                        ...createFormData,
                        durationInMonths: e.target.value,
                      })
                    }
                  >
                    <option value={6}>6 Months</option>
                    <option value={12}>1 Year</option>
                    <option value={24}>2 Years</option>
                    <option value={36}>3 Years</option>
                    <option value={60}>5 Years</option>
                    <option value={120}>10 Years</option>
                  </select>
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Frequency</label>
                  <select
                    value={createFormData.frequency}
                    onChange={(e) =>
                      setCreateFormData({
                        ...createFormData,
                        frequency: e.target.value,
                      })
                    }
                  >
                    <option value="monthly">Monthly</option>
                    <option value="quarterly">Quarterly</option>
                    <option value="yearly">Yearly</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>Expected Rate of Return (% p.a.) *</label>
                  <input
                    type="number"
                    value={createFormData.expectedRate}
                    onChange={(e) =>
                      setCreateFormData({
                        ...createFormData,
                        expectedRate: e.target.value,
                      })
                    }
                    placeholder="12"
                    min="0"
                    max="50"
                    step="0.1"
                    required
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Investment Goal</label>
                  <input
                    type="text"
                    value={createFormData.goal}
                    onChange={(e) =>
                      setCreateFormData({
                        ...createFormData,
                        goal: e.target.value,
                      })
                    }
                    placeholder="e.g., Retirement, House Down Payment"
                  />
                </div>
                <div className="form-group expected-maturity">
                  <label>Expected Maturity Value</label>
                  <div className="maturity-display">
                    ₹
                    {createFormData.amount &&
                    createFormData.expectedRate &&
                    createFormData.durationInMonths
                      ? Math.round(calculateExpectedMaturity()).toLocaleString(
                          "en-IN"
                        )
                      : "0"}
                  </div>
                  <small>
                    Based on {createFormData.expectedRate}% annual return
                  </small>
                </div>
              </div>

              <div className="form-group">
                <label>Notes (Optional)</label>
                <textarea
                  value={createFormData.notes}
                  onChange={(e) =>
                    setCreateFormData({
                      ...createFormData,
                      notes: e.target.value,
                    })
                  }
                  rows="3"
                  placeholder="Add any additional notes..."
                />
              </div>

              <div className="modal-actions">
                <button type="button" onClick={() => setShowCreateModal(false)}>
                  Cancel
                </button>
                <button type="submit">Create SIP</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit SIP Modal */}
      {showEditModal && editingSIP && (
        <div className="modal-overlay" onClick={() => setShowEditModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Edit SIP</h3>
              <button onClick={() => setShowEditModal(false)}>×</button>
            </div>
            <form onSubmit={handleUpdateSIP}>
              <div className="form-row">
                <div className="form-group">
                  <label>SIP Name *</label>
                  <input
                    type="text"
                    value={editFormData.sipName}
                    onChange={(e) =>
                      setEditFormData({
                        ...editFormData,
                        sipName: e.target.value,
                      })
                    }
                    placeholder="e.g., Retirement Fund"
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Monthly Amount *</label>
                  <input
                    type="number"
                    value={editFormData.amount}
                    onChange={(e) =>
                      setEditFormData({
                        ...editFormData,
                        amount: e.target.value,
                      })
                    }
                    placeholder="5000"
                    min="1000"
                    required
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Start Date *</label>
                  <input
                    type="date"
                    value={editFormData.startDate}
                    onChange={(e) =>
                      setEditFormData({
                        ...editFormData,
                        startDate: e.target.value,
                      })
                    }
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Duration (Months) *</label>
                  <select
                    value={editFormData.durationInMonths}
                    onChange={(e) =>
                      setEditFormData({
                        ...editFormData,
                        durationInMonths: e.target.value,
                      })
                    }
                  >
                    <option value={6}>6 Months</option>
                    <option value={12}>1 Year</option>
                    <option value={24}>2 Years</option>
                    <option value={36}>3 Years</option>
                    <option value={60}>5 Years</option>
                    <option value={120}>10 Years</option>
                  </select>
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Frequency</label>
                  <select
                    value={editFormData.frequency}
                    onChange={(e) =>
                      setEditFormData({
                        ...editFormData,
                        frequency: e.target.value,
                      })
                    }
                  >
                    <option value="monthly">Monthly</option>
                    <option value="quarterly">Quarterly</option>
                    <option value="yearly">Yearly</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>Expected Rate of Return (% p.a.) *</label>
                  <input
                    type="number"
                    value={editFormData.expectedRate}
                    onChange={(e) =>
                      setEditFormData({
                        ...editFormData,
                        expectedRate: e.target.value,
                      })
                    }
                    placeholder="12"
                    min="0"
                    max="50"
                    step="0.1"
                    required
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Investment Goal</label>
                  <input
                    type="text"
                    value={editFormData.goal}
                    onChange={(e) =>
                      setEditFormData({
                        ...editFormData,
                        goal: e.target.value,
                      })
                    }
                    placeholder="e.g., Retirement, House Down Payment"
                  />
                </div>
                <div className="form-group expected-maturity">
                  <label>Expected Maturity Value</label>
                  <div className="maturity-display">
                    ₹
                    {editFormData.amount &&
                    editFormData.expectedRate &&
                    editFormData.durationInMonths
                      ? Math.round(
                          calculateEditExpectedMaturity()
                        ).toLocaleString("en-IN")
                      : "0"}
                  </div>
                  <small>
                    Based on {editFormData.expectedRate}% annual return
                  </small>
                </div>
              </div>

              <div className="form-group">
                <label>Notes (Optional)</label>
                <textarea
                  value={editFormData.notes}
                  onChange={(e) =>
                    setEditFormData({
                      ...editFormData,
                      notes: e.target.value,
                    })
                  }
                  rows="3"
                  placeholder="Add any additional notes..."
                />
              </div>

              <div className="modal-actions">
                <button type="button" onClick={() => setShowEditModal(false)}>
                  Cancel
                </button>
                <button type="submit">Update SIP</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default SIPDashboard;
