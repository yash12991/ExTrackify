import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  FaArrowLeft,
  FaEdit,
  FaTrash,
  FaCalendarAlt,
  FaCreditCard,
  FaChartLine,
  FaBullseye,
  FaRupeeSign,
  FaBell,
  FaCheckCircle,
  FaExclamationTriangle,
  FaClock,
  FaHistory,
  FaPlus,
  FaPause,
  FaPlay,
  FaFileInvoiceDollar,
  FaArrowUp,
  FaEnvelope,
  FaCalculator,
  FaSave,
  FaTimes,
} from "react-icons/fa";
import { Line, Doughnut, Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  BarElement,
} from "chart.js";
import toast from "react-hot-toast";
import {
  getSIPAnalytics,
  updateSIP,
  deleteSIP,
  createPayment,
  getSIPProjection,
  getSIPById,
  getAllPayments,
} from "../../lib/api";
import Loader from "../../components/Loading/Loading";
import "./SIPDetails.css";

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  BarElement
);

const SIPDetails = () => {
  const { sipId } = useParams();
  const navigate = useNavigate();

  // State management
  const [sip, setSip] = useState(null);
  const [analytics, setAnalytics] = useState(null);
  const [projection, setProjection] = useState(null);
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("overview");

  // Modal states
  const [showEditModal, setShowEditModal] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [showProjectionModal, setShowProjectionModal] = useState(false);

  // Form states
  const [editFormData, setEditFormData] = useState({});
  const [paymentFormData, setPaymentFormData] = useState({
    amount: "",
    paymentDate: new Date().toISOString().split("T")[0],
    notes: "",
  });
  const [projectionRate, setProjectionRate] = useState(12);

  // Loading states
  const [submitting, setSubmitting] = useState(false);
  const [deleting, setDeleting] = useState(false);

  // Fetch all SIP data
  const fetchSIPData = async () => {
    try {
      setLoading(true);
      const [sipData, analyticsData, paymentsData] = await Promise.all([
        getSIPById(sipId),
        getSIPAnalytics(sipId),
        getAllPayments(),
      ]);

      setSip(sipData);
      setAnalytics(analyticsData);
      setPayments(paymentsData.filter((payment) => payment.sip === sipId));
      setEditFormData(sipData);

      // Set default payment amount to SIP amount
      setPaymentFormData((prev) => ({
        ...prev,
        amount: sipData.amount.toString(),
      }));
    } catch (error) {
      console.error("Error fetching SIP data:", error);
      toast.error("Failed to load SIP details");
    } finally {
      setLoading(false);
    }
  };

  // Fetch projection data
  const fetchProjection = async (rate = 12) => {
    try {
      const projectionData = await getSIPProjection(sipId, rate);
      setProjection(projectionData);
    } catch (error) {
      console.error("Error fetching projection:", error);
      toast.error("Failed to load projection");
    }
  };

  useEffect(() => {
    if (sipId) {
      fetchSIPData();
      fetchProjection();
    }
  }, [sipId]);

  // Handle SIP edit
  const handleEditSIP = async (e) => {
    e.preventDefault();
    try {
      setSubmitting(true);
      await updateSIP(sipId, editFormData);
      toast.success("SIP updated successfully!");
      setShowEditModal(false);
      fetchSIPData();
    } catch (error) {
      console.error("Error updating SIP:", error);
      toast.error("Failed to update SIP");
    } finally {
      setSubmitting(false);
    }
  };

  // Handle SIP deletion
  const handleDeleteSIP = async () => {
    if (
      !window.confirm(
        "Are you sure you want to delete this SIP? This action cannot be undone."
      )
    ) {
      return;
    }

    try {
      setDeleting(true);
      await deleteSIP(sipId);
      toast.success("SIP deleted successfully!");
      navigate("/sip-dashboard");
    } catch (error) {
      console.error("Error deleting SIP:", error);
      toast.error("Failed to delete SIP");
    } finally {
      setDeleting(false);
    }
  };

  // Handle payment creation
  const handleCreatePayment = async (e) => {
    e.preventDefault();
    try {
      setSubmitting(true);
      await createPayment({
        ...paymentFormData,
        sip: sipId,
        amount: parseFloat(paymentFormData.amount),
        paymentType: "SIP",
      });
      toast.success("Payment recorded successfully!");
      setShowPaymentModal(false);
      setPaymentFormData({
        amount: sip?.amount.toString() || "",
        paymentDate: new Date().toISOString().split("T")[0],
        notes: "",
      });
      fetchSIPData();
    } catch (error) {
      console.error("Error creating payment:", error);
      toast.error("Failed to record payment");
    } finally {
      setSubmitting(false);
    }
  };

  // Handle projection calculation
  const handleCalculateProjection = async () => {
    await fetchProjection(projectionRate);
    setShowProjectionModal(true);
  };

  // Toggle SIP active status
  const toggleSIPStatus = async () => {
    try {
      const updatedSIP = { ...sip, isActive: !sip.isActive };
      await updateSIP(sipId, updatedSIP);
      setSip(updatedSIP);
      toast.success(
        `SIP ${updatedSIP.isActive ? "activated" : "paused"} successfully!`
      );
    } catch (error) {
      console.error("Error toggling SIP status:", error);
      toast.error("Failed to update SIP status");
    }
  };

  // Calculate next payment urgency
  const getPaymentUrgency = () => {
    if (!analytics?.daysUntilNextPayment) return null;

    const days = analytics.daysUntilNextPayment;
    if (days < 0)
      return {
        level: "overdue",
        message: `${Math.abs(days)} days overdue`,
        color: "#e74c3c",
      };
    if (days === 0)
      return { level: "today", message: "Due today", color: "#f39c12" };
    if (days === 1)
      return { level: "tomorrow", message: "Due tomorrow", color: "#f39c12" };
    if (days <= 3)
      return {
        level: "soon",
        message: `Due in ${days} days`,
        color: "#e67e22",
      };
    if (days <= 7)
      return {
        level: "week",
        message: `Due in ${days} days`,
        color: "#3498db",
      };
    return {
      level: "future",
      message: `Due in ${days} days`,
      color: "#27ae60",
    };
  };

  // Add this line to get the urgency
  const urgency = getPaymentUrgency();

  // Chart data configurations
  const getProgressChartData = () => {
    if (!analytics?.monthlyProgress) return null;

    const labels = analytics.monthlyProgress.map((m) => `Month ${m.month}`);
    const paidData = analytics.monthlyProgress.map((m) => m.paid);
    const expectedData = analytics.monthlyProgress.map((m) => m.expected);

    return {
      labels,
      datasets: [
        {
          label: "Paid Amount",
          data: paidData,
          backgroundColor: "rgba(46, 204, 113, 0.8)",
          borderColor: "rgba(46, 204, 113, 1)",
          borderWidth: 2,
        },
        {
          label: "Expected Amount",
          data: expectedData,
          backgroundColor: "rgba(52, 152, 219, 0.3)",
          borderColor: "rgba(52, 152, 219, 1)",
          borderWidth: 2,
        },
      ],
    };
  };

  const getCompletionChartData = () => {
    if (!analytics) return null;

    const completed = analytics.completionPercentage;
    const remaining = 100 - completed;

    return {
      labels: ["Completed", "Remaining"],
      datasets: [
        {
          data: [completed, remaining],
          backgroundColor: ["#27ae60", "#ecf0f1"],
          borderColor: ["#27ae60", "#bdc3c7"],
          borderWidth: 2,
        },
      ],
    };
  };

  const getProjectionChartData = () => {
    if (!analytics?.monthlyProgress) return null;

    const labels = analytics.monthlyProgress.map((m) => `Month ${m.month}`);
    const actualData = analytics.monthlyProgress.map((m) => m.paid);
    const projectedData = analytics.monthlyProgress.map((m) => m.expected);

    return {
      labels,
      datasets: [
        {
          label: "Actual Investment",
          data: actualData,
          borderColor: "#3498db",
          backgroundColor: "rgba(52, 152, 219, 0.1)",
          tension: 0.4,
        },
        {
          label: "Projected Returns",
          data: projectedData.map(
            (val, idx) => val * (1 + 0.12 / 12) ** (idx + 1)
          ),
          borderColor: "#e74c3c",
          backgroundColor: "rgba(231, 76, 60, 0.1)",
          tension: 0.4,
        },
      ],
    };
  };

  if (loading) {
    return (
      <div className="sip-details-container">
        <Loader />
      </div>
    );
  }

  if (!sip) {
    return (
      <div className="sip-details-container">
        <div className="error-state">
          <FaExclamationTriangle size={48} />
          <h2>SIP Not Found</h2>
          <p>The requested SIP could not be found.</p>
          <button
            onClick={() => navigate("/sip-dashboard")}
            className="btn-primary"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="sip-details-container">
      {/* Header */}
      <motion.div
        className="sip-header"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <div className="header-left">
          <button
            onClick={() => navigate("/sip-dashboard")}
            className="back-btn"
          >
            <FaArrowLeft /> Back to Dashboard
          </button>
          <div className="sip-title">
            <h1>{sip.sipName}</h1>
            <div className="sip-status">
              <span
                className={`status-badge ${
                  sip.isActive ? "active" : "inactive"
                }`}
              >
                {sip.isActive ? "Active" : "Inactive"}
              </span>
              <span className="sip-goal">{sip.goal}</span>
            </div>
          </div>
        </div>

        <div className="header-actions">
          <button
            onClick={toggleSIPStatus}
            className={`action-btn ${sip.isActive ? "pause" : "play"}`}
          >
            {sip.isActive ? <FaPause /> : <FaPlay />}
            {sip.isActive ? "Pause" : "Resume"}
          </button>
          <button
            onClick={() => setShowEditModal(true)}
            className="action-btn edit"
          >
            <FaEdit /> Edit
          </button>
          <button
            onClick={handleDeleteSIP}
            disabled={deleting}
            className="action-btn delete"
          >
            <FaTrash /> {deleting ? "Deleting..." : "Delete"}
          </button>
        </div>
      </motion.div>

      {/* Payment Urgency Alert */}
      {urgency && (
        <motion.div
          className={`urgency-alert ${urgency.level}`}
          style={{ borderColor: urgency.color }}
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
        >
          <div className="alert-content">
            <FaBell style={{ color: urgency.color }} />
            <div>
              <strong>Payment Reminder</strong>
              <p>{urgency.message}</p>
            </div>
          </div>
          <button
            onClick={() => setShowPaymentModal(true)}
            className="alert-action"
            style={{ backgroundColor: urgency.color }}
          >
            Record Payment
          </button>
        </motion.div>
      )}

      {/* Key Metrics Cards */}
      <motion.div
        className="metrics-grid"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.1 }}
      >
        <div className="metric-card amount">
          <div className="metric-icon">
            <FaRupeeSign />
          </div>
          <div className="metric-info">
            <h3>₹{sip.amount.toLocaleString()}</h3>
            <p>Monthly Investment</p>
          </div>
        </div>

        <div className="metric-card progress">
          <div className="metric-icon">
            <FaBullseye />
          </div>
          <div className="metric-info">
            <h3>{analytics?.completionPercentage || 0}%</h3>
            <p>Completion</p>
          </div>
        </div>

        <div className="metric-card invested">
          <div className="metric-icon">
            <FaArrowUp />
          </div>
          <div className="metric-info">
            <h3>₹{analytics?.totalPaid?.toLocaleString() || 0}</h3>
            <p>Total Invested</p>
          </div>
        </div>

        <div className="metric-card returns">
          <div className="metric-icon">
            <FaChartLine />
          </div>
          <div className="metric-info">
            <h3>₹{analytics?.projectedReturns?.toLocaleString() || 0}</h3>
            <p>Projected Returns</p>
          </div>
        </div>
      </motion.div>

      {/* Navigation Tabs */}
      <div className="tabs-container">
        <div className="tabs">
          {["overview", "analytics", "payments", "projections"].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`tab ${activeTab === tab ? "active" : ""}`}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Tab Content */}
      <motion.div
        className="tab-content"
        key={activeTab}
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.3 }}
      >
        {/* Overview Tab */}
        {activeTab === "overview" && (
          <div className="overview-tab">
            <div className="overview-grid">
              {/* SIP Details */}
              <div className="overview-section">
                <h3>SIP Details</h3>
                <div className="detail-item">
                  <label>Start Date:</label>
                  <span>{new Date(sip.startDate).toLocaleDateString()}</span>
                </div>
                <div className="detail-item">
                  <label>Duration:</label>
                  <span>{sip.durationInMonths} months</span>
                </div>
                <div className="detail-item">
                  <label>Frequency:</label>
                  <span>{sip.frequency}</span>
                </div>
                <div className="detail-item">
                  <label>Next Payment:</label>
                  <span>
                    {analytics?.nextPaymentDue
                      ? new Date(analytics.nextPaymentDue).toLocaleDateString()
                      : "N/A"}
                  </span>
                </div>
                {sip.notes && (
                  <div className="detail-item">
                    <label>Notes:</label>
                    <span>{sip.notes}</span>
                  </div>
                )}
              </div>

              {/* Progress Summary */}
              <div className="overview-section">
                <h3>Progress Summary</h3>
                <div className="progress-bars">
                  <div className="progress-item">
                    <label>Investment Progress</label>
                    <div className="progress-bar">
                      <div
                        className="progress-fill"
                        style={{
                          width: `${analytics?.completionPercentage || 0}%`,
                        }}
                      />
                    </div>
                    <span>{analytics?.completionPercentage || 0}%</span>
                  </div>

                  <div className="progress-item">
                    <label>Time Progress</label>
                    <div className="progress-bar">
                      <div
                        className="progress-fill time"
                        style={{
                          width: `${
                            analytics?.performanceMetrics
                              ? ((sip.durationInMonths -
                                  analytics.performanceMetrics.timeRemaining) /
                                  sip.durationInMonths) *
                                100
                              : 0
                          }%`,
                        }}
                      />
                    </div>
                    <span>
                      {analytics?.performanceMetrics
                        ? sip.durationInMonths -
                          analytics.performanceMetrics.timeRemaining
                        : 0}{" "}
                      / {sip.durationInMonths} months
                    </span>
                  </div>
                </div>
              </div>

              {/* Quick Actions */}
              <div className="overview-section">
                <h3>Quick Actions</h3>
                <div className="quick-actions">
                  <button
                    onClick={() => setShowPaymentModal(true)}
                    className="quick-action-btn primary"
                  >
                    <FaPlus /> Record Payment
                  </button>
                  <button
                    onClick={handleCalculateProjection}
                    className="quick-action-btn secondary"
                  >
                    <FaCalculator /> Calculate Returns
                  </button>
                  <button
                    onClick={() => setShowEditModal(true)}
                    className="quick-action-btn secondary"
                  >
                    <FaEdit /> Edit SIP
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Analytics Tab */}
        {activeTab === "analytics" && (
          <div className="analytics-tab">
            <div className="analytics-grid">
              {/* Completion Chart */}
              <div className="chart-section">
                <h3>Investment Progress</h3>
                {getCompletionChartData() && (
                  <div className="chart-container">
                    <Doughnut
                      data={getCompletionChartData()}
                      options={{
                        responsive: true,
                        maintainAspectRatio: false,
                        plugins: {
                          legend: {
                            position: "bottom",
                          },
                        },
                      }}
                    />
                  </div>
                )}
              </div>

              {/* Monthly Progress Chart */}
              <div className="chart-section">
                <h3>Monthly Investment Progress</h3>
                {getProgressChartData() && (
                  <div className="chart-container">
                    <Bar
                      data={getProgressChartData()}
                      options={{
                        responsive: true,
                        maintainAspectRatio: false,
                        plugins: {
                          legend: {
                            position: "top",
                          },
                        },
                      }}
                    />
                  </div>
                )}
              </div>

              {/* Performance Metrics */}
              <div className="metrics-section">
                <h3>Performance Metrics</h3>
                <div className="metrics-list">
                  <div className="metric-item">
                    <label>Consistency Score:</label>
                    <span>
                      {analytics?.performanceMetrics?.consistency || 0}%
                    </span>
                  </div>
                  <div className="metric-item">
                    <label>Average Payment:</label>
                    <span>
                      ₹{analytics?.performanceMetrics?.avgPaymentAmount || 0}
                    </span>
                  </div>
                  <div className="metric-item">
                    <label>Missed Payments:</label>
                    <span
                      className={
                        analytics?.missedPayments > 0 ? "missed" : "good"
                      }
                    >
                      {analytics?.missedPayments || 0}
                    </span>
                  </div>
                  <div className="metric-item">
                    <label>Remaining Amount:</label>
                    <span>
                      ₹{analytics?.remainingAmount?.toLocaleString() || 0}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Payments Tab */}
        {activeTab === "payments" && (
          <div className="payments-tab">
            <div className="payments-header">
              <h3>Payment History</h3>
              <button
                onClick={() => setShowPaymentModal(true)}
                className="btn-primary"
              >
                <FaPlus /> Add Payment
              </button>
            </div>

            <div className="payments-list">
              {payments.length > 0 ? (
                payments.map((payment, index) => (
                  <div key={payment._id || index} className="payment-item">
                    <div className="payment-info">
                      <div className="payment-amount">
                        ₹{payment.amount?.toLocaleString() || 0}
                      </div>
                      <div className="payment-date">
                        {payment.paymentDate
                          ? new Date(payment.paymentDate).toLocaleDateString()
                          : "N/A"}
                      </div>
                    </div>
                    <div className="payment-details">
                      <div className="payment-status success">
                        <FaCheckCircle /> Completed
                      </div>
                      {payment.notes && (
                        <div className="payment-notes">{payment.notes}</div>
                      )}
                    </div>
                  </div>
                ))
              ) : (
                <div className="empty-state">
                  <FaFileInvoiceDollar size={48} />
                  <h4>No payments recorded yet</h4>
                  <p>
                    Start recording your SIP payments to track your progress.
                  </p>
                  <button
                    onClick={() => setShowPaymentModal(true)}
                    className="btn-primary"
                  >
                    Record First Payment
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Projections Tab */}
        {activeTab === "projections" && (
          <div className="projections-tab">
            <div className="projection-controls">
              <h3>Investment Projections</h3>
              <div className="rate-selector">
                <label>Expected Annual Return:</label>
                <select
                  value={projectionRate}
                  onChange={(e) => setProjectionRate(Number(e.target.value))}
                >
                  <option value={8}>8% (Conservative)</option>
                  <option value={10}>10% (Moderate)</option>
                  <option value={12}>12% (Aggressive)</option>
                  <option value={15}>15% (High Risk)</option>
                </select>
                <button
                  onClick={handleCalculateProjection}
                  className="calculate-btn"
                >
                  Calculate
                </button>
              </div>
            </div>

            {projection && (
              <div className="projection-results">
                <div className="projection-summary">
                  <div className="projection-card">
                    <h4>Total Investment</h4>
                    <p>₹{projection.totalInvested?.toLocaleString() || 0}</p>
                  </div>
                  <div className="projection-card">
                    <h4>Projected Value</h4>
                    <p>₹{projection.projectedValue?.toLocaleString() || 0}</p>
                  </div>
                  <div className="projection-card">
                    <h4>Expected Gains</h4>
                    <p>
                      ₹
                      {(
                        (projection.projectedValue || 0) -
                        (projection.totalInvested || 0)
                      ).toLocaleString()}
                    </p>
                  </div>
                </div>

                {/* Projection Chart */}
                <div className="chart-section">
                  <h4>Investment Growth Projection</h4>
                  {getProjectionChartData() && (
                    <div className="chart-container">
                      <Line
                        data={getProjectionChartData()}
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
                              ticks: {
                                callback: function (value) {
                                  return "₹" + value.toLocaleString();
                                },
                              },
                            },
                          },
                        }}
                      />
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        )}
      </motion.div>

      {/* Edit SIP Modal */}
      {showEditModal && (
        <div className="modal-overlay" onClick={() => setShowEditModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Edit SIP</h3>
              <button
                onClick={() => setShowEditModal(false)}
                className="close-btn"
              >
                <FaTimes />
              </button>
            </div>
            <form onSubmit={handleEditSIP} className="modal-form">
              <div className="form-group">
                <label>SIP Name</label>
                <input
                  type="text"
                  value={editFormData.sipName || ""}
                  onChange={(e) =>
                    setEditFormData({
                      ...editFormData,
                      sipName: e.target.value,
                    })
                  }
                  required
                />
              </div>
              <div className="form-group">
                <label>Monthly Amount</label>
                <input
                  type="number"
                  value={editFormData.amount || ""}
                  onChange={(e) =>
                    setEditFormData({
                      ...editFormData,
                      amount: Number(e.target.value),
                    })
                  }
                  min="1000"
                  required
                />
              </div>
              <div className="form-group">
                <label>Duration (Months)</label>
                <input
                  type="number"
                  value={editFormData.durationInMonths || ""}
                  onChange={(e) =>
                    setEditFormData({
                      ...editFormData,
                      durationInMonths: Number(e.target.value),
                    })
                  }
                  min="1"
                  required
                />
              </div>
              <div className="form-group">
                <label>Goal</label>
                <input
                  type="text"
                  value={editFormData.goal || ""}
                  onChange={(e) =>
                    setEditFormData({ ...editFormData, goal: e.target.value })
                  }
                />
              </div>
              <div className="form-group">
                <label>Notes</label>
                <textarea
                  value={editFormData.notes || ""}
                  onChange={(e) =>
                    setEditFormData({ ...editFormData, notes: e.target.value })
                  }
                  rows="3"
                />
              </div>
              <div className="form-actions">
                <button
                  type="button"
                  onClick={() => setShowEditModal(false)}
                  className="btn-secondary"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="btn-primary"
                >
                  {submitting ? "Saving..." : "Save Changes"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Payment Modal */}
      {showPaymentModal && (
        <div
          className="modal-overlay"
          onClick={() => setShowPaymentModal(false)}
        >
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Record Payment</h3>
              <button
                onClick={() => setShowPaymentModal(false)}
                className="close-btn"
              >
                <FaTimes />
              </button>
            </div>
            <form onSubmit={handleCreatePayment} className="modal-form">
              <div className="form-group">
                <label>Payment Amount</label>
                <input
                  type="number"
                  value={paymentFormData.amount}
                  onChange={(e) =>
                    setPaymentFormData({
                      ...paymentFormData,
                      amount: e.target.value,
                    })
                  }
                  min="1"
                  step="0.01"
                  required
                />
              </div>
              <div className="form-group">
                <label>Payment Date</label>
                <input
                  type="date"
                  value={paymentFormData.paymentDate}
                  onChange={(e) =>
                    setPaymentFormData({
                      ...paymentFormData,
                      paymentDate: e.target.value,
                    })
                  }
                  required
                />
              </div>
              <div className="form-group">
                <label>Notes (Optional)</label>
                <textarea
                  value={paymentFormData.notes}
                  onChange={(e) =>
                    setPaymentFormData({
                      ...paymentFormData,
                      notes: e.target.value,
                    })
                  }
                  rows="3"
                  placeholder="Add any notes about this payment..."
                />
              </div>
              <div className="form-actions">
                <button
                  type="button"
                  onClick={() => setShowPaymentModal(false)}
                  className="btn-secondary"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="btn-primary"
                >
                  {submitting ? "Recording..." : "Record Payment"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Projection Modal */}
      {showProjectionModal && projection && (
        <div
          className="modal-overlay"
          onClick={() => setShowProjectionModal(false)}
        >
          <div
            className="modal-content large"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="modal-header">
              <h3>Investment Projection ({projectionRate}% Annual Return)</h3>
              <button
                onClick={() => setShowProjectionModal(false)}
                className="close-btn"
              >
                <FaTimes />
              </button>
            </div>
            <div className="projection-modal-content">
              <div className="projection-summary">
                <div className="summary-item">
                  <label>Total Investment:</label>
                  <value>
                    ₹{projection.totalInvested?.toLocaleString() || 0}
                  </value>
                </div>
                <div className="summary-item">
                  <label>Projected Value:</label>
                  <value>
                    ₹{projection.projectedValue?.toLocaleString() || 0}
                  </value>
                </div>
                <div className="summary-item gain">
                  <label>Expected Gains:</label>
                  <value>
                    ₹
                    {(
                      (projection.projectedValue || 0) -
                      (projection.totalInvested || 0)
                    ).toLocaleString()}
                  </value>
                </div>
              </div>
              <div className="projection-disclaimer">
                <p>
                  <strong>Disclaimer:</strong> This projection is based on the
                  assumed annual return rate of {projectionRate}%. Actual
                  returns may vary based on market conditions and fund
                  performance.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SIPDetails;
