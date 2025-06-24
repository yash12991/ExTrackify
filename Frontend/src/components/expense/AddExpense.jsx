import React, { useState } from "react";
import { motion } from "framer-motion";
import "./ExpenseForm.css";

const AddExpense = ({ onSubmit, onClose, expense = null }) => {
  const [formData, setFormData] = useState(
    expense || {
      amount: "",
      category: "",
      description: "",
      date: new Date().toISOString().split("T")[0],
      modeofpayment: "",
      tags: [],
      recurring: false,
      frequency: "monthly",
    }
  );

  const categories = [
    "Food",
    "Transport",
    "Housing",
    "Utilities",
    "Healthcare",
    "Entertainment",
    "Shopping",
    "Other",
  ];

  const paymentModes = ["upi", "card", "cash", "cheque"];

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.amount || !formData.category || !formData.modeofpayment) {
      toast.error("Please fill in all required fields");
      return;
    }
    onSubmit({
      ...formData,
      amount: Number(formData.amount),
      date: new Date(formData.date).toISOString(),
    });
  };

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
      <form onSubmit={handleSubmit} className="expense-form">
        <h2 className="text-2xl font-bold mb-6">
          {expense ? "Edit Expense" : "Add New Expense"}
        </h2>

        <div className="form-group">
          <label>Amount (₹)*</label>
          <input
            type="number"
            min="0"
            step="0.01"
            value={formData.amount}
            onChange={(e) =>
              setFormData({ ...formData, amount: e.target.value })
            }
            required
          />
        </div>

        <div className="form-group">
          <label>Category*</label>
          <select
            value={formData.category}
            onChange={(e) =>
              setFormData({ ...formData, category: e.target.value })
            }
            required
          >
            <option value="">Select Category</option>
            {categories.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>
        </div>

        <div className="form-group">
          <label>Payment Mode*</label>
          <select
            value={formData.modeofpayment}
            onChange={(e) =>
              setFormData({ ...formData, modeofpayment: e.target.value })
            }
            required
          >
            <option value="">Select Payment Mode</option>
            {paymentModes.map((mode) => (
              <option key={mode} value={mode}>
                {mode.toUpperCase()}
              </option>
            ))}
          </select>
        </div>

        <div className="form-group">
          <label>Date</label>
          <input
            type="date"
            value={formData.date}
            onChange={(e) => setFormData({ ...formData, date: e.target.value })}
            max={new Date().toISOString().split("T")[0]}
            required
          />
        </div>

        <div className="form-group">
          <label>Description</label>
          <input
            type="text"
            value={formData.description}
            onChange={(e) =>
              setFormData({ ...formData, description: e.target.value })
            }
          />
        </div>

        <div className="form-actions">
          <button type="submit" className="submit-btn">
            {expense ? "Update" : "Add"} Expense
          </button>
          <button type="button" className="cancel-btn" onClick={onClose}>
            Cancel
          </button>
        </div>
      </form>
    </motion.div>
  );
};

export default AddExpense;
