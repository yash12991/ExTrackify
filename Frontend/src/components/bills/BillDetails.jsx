import React from "react";
import { motion } from "framer-motion";
import {
  FaTimes,
  FaRupeeSign,
  FaCalendarAlt,
  FaFileInvoice,
  FaStickyNote,
  // FaRepeat,
  FaTag,
  FaEdit,
  FaTrash,
  FaCheckCircle,
  FaClock,
  FaExclamationTriangle,
  FaInfoCircle,
  FaHistory,
} from "react-icons/fa";
import "./BillDetails.css";
import { TbRepeat } from "react-icons/tb";

const BillDetails = ({ bill, onClose, onEdit, onDelete, onMarkPaid }) => {
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-IN", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const formatDateTime = (dateString) => {
    return new Date(dateString).toLocaleString("en-IN", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
    }).format(amount);
  };

  const getDaysUntilDue = (dueDate) => {
    const today = new Date();
    const due = new Date(dueDate);
    const diffTime = due - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "paid":
        return "status-paid";
      case "overdue":
        return "status-overdue";
      case "pending":
        return "status-pending";
      default:
        return "status-pending";
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case "paid":
        return <FaCheckCircle className="status-icon paid" />;
      case "overdue":
        return <FaExclamationTriangle className="status-icon overdue" />;
      case "pending":
        return <FaClock className="status-icon pending" />;
      default:
        return <FaClock className="status-icon pending" />;
    }
  };

  const getFrequencyLabel = (frequency) => {
    const frequencyMap = {
      "one-time": "One Time",
      weekly: "Weekly",
      monthly: "Monthly",
      "3months": "Every 3 Months",
      quaterly: "Quarterly",
      "6months": "Every 6 Months",
      yearly: "Yearly",
    };
    return frequencyMap[frequency] || frequency;
  };

  const daysUntilDue = getDaysUntilDue(bill.dueDate);

  return (
    <div className="modal-overlay">
      <motion.div
        className="modal-content bill-details-modal"
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        transition={{ duration: 0.3 }}
      >
        <div className="modal-header">
          <h2>
            <FaInfoCircle className="modal-icon" />
            Bill Details
          </h2>
          <button className="close-btn" onClick={onClose}>
            <FaTimes />
          </button>
        </div>

        <div className="bill-details-content">
          {/* Bill Header */}
          <div className="bill-header-section">
            <div className="bill-title-section">
              <h3 className="bill-title">{bill.billName}</h3>
              <div className={`bill-status ${getStatusColor(bill.status)}`}>
                {getStatusIcon(bill.status)}
                <span className="status-text">
                  {bill.status.charAt(0).toUpperCase() + bill.status.slice(1)}
                </span>
              </div>
            </div>
            <div className="bill-amount-section">
              <span className="amount-label">Amount</span>
              <span className="amount-value">
                {formatCurrency(bill.amount)}
              </span>
            </div>
          </div>

          {/* Due Date Alert */}
          {daysUntilDue >= 0 &&
            daysUntilDue <= 7 &&
            bill.status === "pending" && (
              <div className="due-alert">
                <FaExclamationTriangle className="alert-icon" />
                <div className="alert-content">
                  <strong>
                    {daysUntilDue === 0
                      ? "Due Today!"
                      : `Due in ${daysUntilDue} day${
                          daysUntilDue > 1 ? "s" : ""
                        }!`}
                  </strong>
                  <p>Don't forget to pay this bill on time.</p>
                </div>
              </div>
            )}

          {/* Bill Information */}
          <div className="bill-info-grid">
            <div className="info-item">
              <div className="info-label">
                <FaCalendarAlt className="info-icon" />
                Due Date
              </div>
              <div className="info-value">{formatDate(bill.dueDate)}</div>
            </div>

            <div className="info-item">
              <div className="info-label">
                <TbRepeat className="info-icon" />
                Frequency
              </div>
              <div className="info-value">
                <span className="frequency-badge">
                  {getFrequencyLabel(bill.frequency)}
                </span>
              </div>
            </div>

            <div className="info-item">
              <div className="info-label">
                <FaTag className="info-icon" />
                Category
              </div>
              <div className="info-value">
                <span className="category-badge">{bill.category}</span>
              </div>
            </div>

            <div className="info-item">
              <div className="info-label">
                <FaHistory className="info-icon" />
                Created
              </div>
              <div className="info-value">{formatDateTime(bill.createdAt)}</div>
            </div>

            <div className="info-item">
              <div className="info-label">
                <FaHistory className="info-icon" />
                Last Updated
              </div>
              <div className="info-value">{formatDateTime(bill.updatedAt)}</div>
            </div>
          </div>

          {/* Notes Section */}
          {bill.notes && (
            <div className="notes-section">
              <div className="notes-label">
                <FaStickyNote className="notes-icon" />
                Notes
              </div>
              <div className="notes-content">{bill.notes}</div>
            </div>
          )}

          {/* Next Due Date Calculation */}
          {bill.frequency !== "one-time" && (
            <div className="next-due-section">
              <div className="next-due-label">
                <FaCalendarAlt className="next-due-icon" />
                Recurring Bill Information
              </div>
              <div className="next-due-info">
                <p>
                  This bill repeats{" "}
                  <strong>
                    {getFrequencyLabel(bill.frequency).toLowerCase()}
                  </strong>
                  .
                </p>
                {bill.status === "paid" && (
                  <p className="next-due-note">
                    <FaInfoCircle className="note-icon" />
                    The next payment will be due based on the frequency
                    settings.
                  </p>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="bill-actions">
          <button className="action-btn edit-btn" onClick={onEdit}>
            <FaEdit />
            Edit Bill
          </button>

          {bill.status === "pending" && (
            <button className="action-btn pay-btn" onClick={onMarkPaid}>
              <FaCheckCircle />
              Mark as Paid
            </button>
          )}

          <button className="action-btn delete-btn" onClick={onDelete}>
            <FaTrash />
            Delete Bill
          </button>
        </div>
      </motion.div>
    </div>
  );
};

export default BillDetails;
