import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { toast } from "react-hot-toast";
import {
  FaTimes,
  FaRupeeSign,
  FaCalendarAlt,
  FaTag,
  FaStickyNote,
  FaExclamationTriangle,
  FaReceipt,
  FaWallet,
  FaRedoAlt,
} from "react-icons/fa";
import "./ExpenseForm.css";
import { addExpense } from "../../lib/api";

const AddExpense = ({ onSubmit, onClose, expense = null }) => {
  const [formData, setFormData] = useState(
    expense || {
      amount: "",
      category: "",
      notes: "",
      date: new Date().toISOString().split("T")[0],
      modeofpayment: "",
      tags: [],
      recurring: false,
      frequency: "monthly",
    }
  );

  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const categories = [
    { value: "food", label: "Food & Dining", icon: "🍔" },
    { value: "transport", label: "Transport", icon: "🚗" },
    { value: "housing", label: "Housing", icon: "🏠" },
    { value: "utilities", label: "Utilities", icon: "💡" },
    { value: "healthcare", label: "Healthcare", icon: "🏥" },
    { value: "entertainment", label: "Entertainment", icon: "🎬" },
    { value: "shopping", label: "Shopping", icon: "🛍️" },
    { value: "other", label: "Other", icon: "📦" },
  ];

  const paymentModes = [
    { value: "upi", label: "UPI", icon: "📱" },
    { value: "credit card", label: "Credit Card", icon: "💳" },
    { value: "debit card", label: "Debit Card", icon: "💳" },
    { value: "cash", label: "Cash", icon: "💵" },
    { value: "netbanking", label: "Net Banking", icon: "🏦" },
    { value: "cheque", label: "Cheque", icon: "📝" },
    { value: "other", label: "Other", icon: "💰" },
  ];

  const quickAmounts = [100, 500, 1000, 2000, 5000];

  const validateForm = () => {
    const newErrors = {};

    if (!formData.amount || Number(formData.amount) <= 0) {
      newErrors.amount = "Please enter a valid amount";
    }

    if (!formData.category.trim()) {
      newErrors.category = "Please select a category";
    }

    if (!formData.modeofpayment.trim()) {
      newErrors.modeofpayment = "Please select a payment mode";
    }

    if (!formData.date) {
      newErrors.date = "Please select a date";
    } else {
      const selectedDate = new Date(formData.date);
      const today = new Date();
      today.setHours(23, 59, 59, 999);

      if (selectedDate > today) {
        newErrors.date = "Date cannot be in the future";
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      toast.error("Please fix the errors before submitting");
      return;
    }

    setLoading(true);
    try {
      const expenseData = {
        category: formData.category,
        amount: Number(formData.amount),
        date: new Date(formData.date).toISOString(),
        notes: formData.notes,
        modeofpayment: formData.modeofpayment,
        tags: formData.tags,
        recurring: formData.recurring,
      };

      const res = await addExpense(expenseData);
      toast.success("Expense added successfully!");
      onSubmit(expenseData);
      onClose();
    } catch (error) {
      console.error("Error adding expense:", error);
      toast.error("Failed to add expense. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field, value) => {
    setFormData({ ...formData, [field]: value });
    if (errors[field]) {
      setErrors({ ...errors, [field]: "" });
    }
  };

  const handleTagsChange = (e) => {
    const value = e.target.value;
    const tags = value
      .split(",")
      .map((tag) => tag.trim())
      .filter((tag) => tag);
    handleInputChange("tags", tags);
  };

  const handleQuickAmount = (amount) => {
    handleInputChange("amount", amount.toString());
  };

  useEffect(() => {
    document.body.classList.add("expense-modal-open");
    return () => {
      document.body.classList.remove("expense-modal-open");
    };
  }, []);

  return (
    <motion.div
      className="expense-form-modal"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <motion.form
        onSubmit={handleSubmit}
        className="expense-form"
        initial={{ scale: 0.95, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        transition={{ duration: 0.3, ease: "easeOut" }}
      >
        <div className="form-header">
          <div className="form-header-content">
            <div className="form-icon-wrapper">
              <FaReceipt />
            </div>
            <div>
              <h2>{expense ? "Edit Expense" : "Add Expense"}</h2>
              <p className="subtitle">
                {expense ? "Update your expense details" : "Track your spending"}
              </p>
            </div>
          </div>
          <button type="button" className="close-btn" onClick={onClose}>
            <FaTimes />
          </button>
        </div>

        <div className="form-content">
          {/* Amount Field */}
          <div className={`form-group ${errors.amount ? "error" : ""}`}>
            <label>
              <FaRupeeSign className="label-icon" />
              Amount <span className="required">*</span>
            </label>
            <div className="input-wrapper">
              <FaRupeeSign className="input-icon" />
              <input
                type="number"
                min="0"
                step="0.01"
                value={formData.amount}
                onChange={(e) => handleInputChange("amount", e.target.value)}
                placeholder="0.00"
              />
            </div>
            {errors.amount && (
              <div className="validation-error">
                <FaExclamationTriangle />
                {errors.amount}
              </div>
            )}
            <div className="quick-amounts">
              {quickAmounts.map((amount) => (
                <button
                  key={amount}
                  type="button"
                  className="quick-amount-btn"
                  onClick={() => handleQuickAmount(amount)}
                >
                  ₹{amount}
                </button>
              ))}
            </div>
          </div>

          <div className="form-row">
            {/* Category Field */}
            <div className={`form-group ${errors.category ? "error" : ""}`}>
              <label>
                <FaTag className="label-icon" />
                Category <span className="required">*</span>
              </label>
              <div className="category-grid">
                {categories.map((cat) => (
                  <button
                    key={cat.value}
                    type="button"
                    className={`category-btn ${
                      formData.category === cat.value ? "selected" : ""
                    }`}
                    onClick={() => handleInputChange("category", cat.value)}
                  >
                    <span className="category-icon">{cat.icon}</span>
                    <span className="category-label">{cat.label}</span>
                  </button>
                ))}
              </div>
              {errors.category && (
                <div className="validation-error">
                  <FaExclamationTriangle />
                  {errors.category}
                </div>
              )}
            </div>
          </div>

          <div className="form-row">
            {/* Payment Mode Field */}
            <div className={`form-group ${errors.modeofpayment ? "error" : ""}`}>
              <label>
                <FaWallet className="label-icon" />
                Payment Mode <span className="required">*</span>
              </label>
              <select
                value={formData.modeofpayment}
                onChange={(e) =>
                  handleInputChange("modeofpayment", e.target.value)
                }
                className="form-select"
              >
                <option value="">Select Mode</option>
                {paymentModes.map((mode) => (
                  <option key={mode.value} value={mode.value}>
                    {mode.icon} {mode.label}
                  </option>
                ))}
              </select>
              {errors.modeofpayment && (
                <div className="validation-error">
                  <FaExclamationTriangle />
                  {errors.modeofpayment}
                </div>
              )}
            </div>

            {/* Date Field */}
            <div className={`form-group ${errors.date ? "error" : ""}`}>
              <label>
                <FaCalendarAlt className="label-icon" />
                Date <span className="required">*</span>
              </label>
              <div className="input-wrapper">
                <FaCalendarAlt className="input-icon" />
                <input
                  type="date"
                  value={formData.date}
                  onChange={(e) => handleInputChange("date", e.target.value)}
                  max={new Date().toISOString().split("T")[0]}
                />
              </div>
              {errors.date && (
                <div className="validation-error">
                  <FaExclamationTriangle />
                  {errors.date}
                </div>
              )}
            </div>
          </div>

          {/* Tags Field */}
          <div className="form-group">
            <label>
              <FaTag className="label-icon" />
              Tags
            </label>
            <div className="input-wrapper">
              <FaTag className="input-icon" />
              <input
                type="text"
                value={formData.tags.join(", ")}
                onChange={handleTagsChange}
                placeholder="lunch, work, friends..."
                className="tags-input"
              />
            </div>
            <small className="form-hint">Separate with commas</small>
          </div>

          {/* Recurring Checkbox */}
          <div className="checkbox-group">
            <label className="checkbox-label">
              <input
                type="checkbox"
                checked={formData.recurring}
                onChange={(e) =>
                  handleInputChange("recurring", e.target.checked)
                }
              />
              <span className="checkmark">
                  <FaRedoAlt />
              </span>
              <span>Recurring expense</span>
            </label>
            {formData.recurring && (
              <select
                value={formData.frequency || "monthly"}
                onChange={(e) => handleInputChange("frequency", e.target.value)}
                className="form-select frequency-select"
                style={{ marginLeft: "36px", marginTop: "8px" }}
              >
                <option value="daily">Daily</option>
                <option value="weekly">Weekly</option>
                <option value="monthly">Monthly</option>
              </select>
            )}
          </div>

          {/* Notes Field */}
          <div className="form-group">
            <label>
              <FaStickyNote className="label-icon" />
              Description
            </label>
            <div className="input-wrapper">
              <FaStickyNote className="input-icon textarea-icon" />
              <textarea
                value={formData.notes}
                onChange={(e) => handleInputChange("notes", e.target.value)}
                placeholder="Add notes about this expense..."
                rows="3"
              />
            </div>
          </div>
        </div>

        <div className="form-actions">
          <button type="button" className="cancel-btn" onClick={onClose}>
            Cancel
          </button>
          <button type="submit" className="submit-btn" disabled={loading}>
            {loading ? (
              <>
                <div className="loading-spinner" />
                {expense ? "Updating..." : "Adding..."}
              </>
            ) : (
              <>
                {expense ? "Update Expense" : "Add Expense"}
              </>
            )}
          </button>
        </div>
      </motion.form>
    </motion.div>
  );
};

export default AddExpense;