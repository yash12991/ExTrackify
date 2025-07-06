import React, { useState, useEffect } from "react";
import {
  FaTimes,
  FaRupeeSign,
  FaCalendarAlt,
  FaTag,
  FaCreditCard,
  FaStickyNote,
} from "react-icons/fa";
import toast from "react-hot-toast";
import "./ExpenseForm.css";

const EditExpense = ({ expense, onClose, onSubmit, isLoading }) => {
  const [formData, setFormData] = useState({
    amount: "",
    category: "",
    modeofpayment: "",
    notes: "",
    date: "",
  });

  // Populate form with existing expense data
  useEffect(() => {
    if (expense) {
      setFormData({
        amount: expense.amount.toString(),
        category: expense.category,
        modeofpayment: expense.modeofpayment,
        notes: expense.notes || "",
        date: expense.date
          ? new Date(expense.date).toISOString().split("T")[0]
          : "",
      });
    }
  }, [expense]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (
      !formData.amount ||
      !formData.category ||
      !formData.modeofpayment ||
      !formData.date
    ) {
      toast.error("Please fill in all required fields");
      return;
    }

    const updatedExpense = {
      ...formData,
      amount: parseFloat(formData.amount),
    };

    await onSubmit(updatedExpense);
  };

  return (
    <div className="expense-form-modal">
      <div className="expense-form">
        <div className="form-header">
          <h2>Edit Expense</h2>
          <button className="close-btn" onClick={onClose}>
            <FaTimes />
          </button>
        </div>

        <p className="subtitle">Update your expense details</p>

        <div className="form-content">
          <form onSubmit={handleSubmit}>
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="amount">
                  Amount <span className="required">*</span>
                </label>
                <div className="input-wrapper">
                  <FaRupeeSign className="input-icon" />
                  <input
                    type="number"
                    id="amount"
                    name="amount"
                    value={formData.amount}
                    onChange={handleChange}
                    placeholder="Enter amount"
                    min="0"
                    step="0.01"
                    required
                  />
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="category">
                  Category <span className="required">*</span>
                </label>
                <select
                  id="category"
                  name="category"
                  value={formData.category}
                  onChange={handleChange}
                  className="form-select"
                  required
                >
                  <option value="">Select Category</option>
                  <option value="Food">Food</option>
                  <option value="Transport">Transport</option>
                  <option value="Housing">Housing</option>
                  <option value="Utilities">Utilities</option>
                  <option value="Healthcare">Healthcare</option>
                  <option value="Entertainment">Entertainment</option>
                  <option value="Shopping">Shopping</option>
                  <option value="Other">Other</option>
                </select>
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="modeofpayment">
                  Payment Mode <span className="required">*</span>
                </label>
                <select
                  id="modeofpayment"
                  name="modeofpayment"
                  value={formData.modeofpayment}
                  onChange={handleChange}
                  className="form-select"
                  required
                >
                  <option value="">Select Payment Mode</option>
                  <option value="cash">Cash</option>
                  {/* <option value="credit card">Credit Card</option> */}
                  {/* <option value="cebit card">Debit Card</option> */}
                  <option value="card">Debit Card</option>
                  <option value="upi">UPI</option>
                  <option value="net banking">Net Banking</option>
                  <option value="other">Other</option>
                </select>
              </div>

              <div className="form-group">
                <label htmlFor="date">
                  Date <span className="required">*</span>
                </label>
                <div className="input-wrapper">
                  <FaCalendarAlt className="input-icon" />
                  <input
                    type="date"
                    id="date"
                    name="date"
                    value={formData.date}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="notes">Notes</label>
              <div className="input-wrapper">
                <FaStickyNote className="input-icon" />
                <textarea
                  id="notes"
                  name="notes"
                  value={formData.notes}
                  onChange={handleChange}
                  placeholder="Add any notes (optional)"
                  rows="3"
                />
              </div>
              <div className="form-hint">
                Optional: Add any additional details about this expense
              </div>
            </div>
          </form>
        </div>

        <div className="form-actions">
          <button
            type="button"
            className="cancel-btn"
            onClick={onClose}
            disabled={isLoading}
          >
            Cancel
          </button>
          <button
            type="submit"
            className="submit-btn"
            onClick={handleSubmit}
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <div className="loading-spinner" />
                Updating...
              </>
            ) : (
              "Update Expense"
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default EditExpense;
