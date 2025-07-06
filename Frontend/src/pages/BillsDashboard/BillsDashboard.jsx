import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { toast } from "react-hot-toast";
import {
  FaPlus,
  FaFilter,
  FaSearch,
  FaCalendar,
  FaRupeeSign,
  FaExclamationTriangle,
  FaCheckCircle,
  FaEdit,
  FaTrash,
  FaEye,
  FaCreditCard,
  FaChartBar,
  FaCalendarAlt,
  FaClock,
  FaMoneyBillWave,
} from "react-icons/fa";
import { getBills, deleteBill, markBillAsPaid, getBillsSummary } from "../../lib/api";
import AddBill from "../../components/bills/AddBill";
import EditBill from "../../components/bills/EditBill";
import BillDetails from "../../components/bills/BillDetails";
import Loading from "../../components/Loading/Loading";
import "./BillsDashboard.css";

const BillsDashboard = () => {
  const [bills, setBills] = useState([]);
  const [filteredBills, setFilteredBills] = useState([]);
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(false);
  const [showAddBill, setShowAddBill] = useState(false);
  const [showEditBill, setShowEditBill] = useState(false);
  const [showBillDetails, setShowBillDetails] = useState(false);
  const [selectedBill, setSelectedBill] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // Filters
  const [filters, setFilters] = useState({
    search: "",
    status: "all",
    frequency: "all",
    category: "all",
    sortBy: "dueDate",
    order: "asc",
  });

  const [showFilters, setShowFilters] = useState(false);

  // Fetch bills and summary
  const fetchBills = async () => {
    setLoading(true);
    try {
      const params = {
        page: currentPage,
        limit: 10,
        ...filters,
      };

      // Remove 'all' values from params
      Object.keys(params).forEach((key) => {
        if (params[key] === "all") {
          delete params[key];
        }
      });

      const response = await getBills(params);
      setBills(response.data.bills);
      setFilteredBills(response.data.bills);
      setTotalPages(response.data.pagination.totalPages);
    } catch (error) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchSummary = async () => {
    try {
      const summaryData = await getBillsSummary();
      setSummary(summaryData);
    } catch (error) {
      console.error("Error fetching summary:", error);
    }
  };

  useEffect(() => {
    fetchBills();
    fetchSummary();
  }, [currentPage, filters]);

  // Filter bills by search
  useEffect(() => {
    if (filters.search) {
      const filtered = bills.filter(
        (bill) =>
          bill.billName.toLowerCase().includes(filters.search.toLowerCase()) ||
          bill.category.toLowerCase().includes(filters.search.toLowerCase())
      );
      setFilteredBills(filtered);
    } else {
      setFilteredBills(bills);
    }
  }, [bills, filters.search]);

  const handleFilterChange = (key, value) => {
    setFilters({ ...filters, [key]: value });
    setCurrentPage(1);
  };

  const handleDelete = async (billId) => {
    if (window.confirm("Are you sure you want to delete this bill?")) {
      try {
        await deleteBill(billId);
        toast.success("Bill deleted successfully");
        fetchBills();
        fetchSummary();
      } catch (error) {
        toast.error(error.message);
      }
    }
  };

  const handleMarkAsPaid = async (billId) => {
    try {
      await markBillAsPaid(billId);
      toast.success("Bill marked as paid");
      fetchBills();
      fetchSummary();
    } catch (error) {
      toast.error(error.message);
    }
  };

  const handleEdit = (bill) => {
    setSelectedBill(bill);
    setShowEditBill(true);
  };

  const handleViewDetails = (bill) => {
    setSelectedBill(bill);
    setShowBillDetails(true);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "paid":
        return "text-green-600";
      case "overdue":
        return "text-red-600";
      case "pending":
        return "text-yellow-600";
      default:
        return "text-gray-600";
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case "paid":
        return <FaCheckCircle className="text-green-500" />;
      case "overdue":
        return <FaExclamationTriangle className="text-red-500" />;
      case "pending":
        return <FaClock className="text-yellow-500" />;
      default:
        return <FaClock className="text-gray-500" />;
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-IN", {
      year: "numeric",
      month: "short",
      day: "numeric",
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

  if (loading && bills.length === 0) {
    return <Loading />;
  }

  return (
    <div className="bills-dashboard">
      <div className="dashboard-header">
        <div className="header-content">
          <h1 className="dashboard-title">
            <FaMoneyBillWave className="title-icon" />
            Bills & Subscriptions
          </h1>
          <button
            className="add-bill-btn"
            onClick={() => setShowAddBill(true)}
          >
            <FaPlus />
            Add Bill
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      {summary && (
        <div className="summary-cards">
          <motion.div
            className="summary-card pending"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <div className="card-icon">
              <FaClock />
            </div>
            <div className="card-content">
              <h3>Pending Bills</h3>
              <p className="amount">{formatCurrency(summary.summary.pending.totalAmount)}</p>
              <p className="count">{summary.summary.pending.count} bills</p>
            </div>
          </motion.div>

          <motion.div
            className="summary-card paid"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <div className="card-icon">
              <FaCheckCircle />
            </div>
            <div className="card-content">
              <h3>Paid Bills</h3>
              <p className="amount">{formatCurrency(summary.summary.paid.totalAmount)}</p>
              <p className="count">{summary.summary.paid.count} bills</p>
            </div>
          </motion.div>

          <motion.div
            className="summary-card overdue"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <div className="card-icon">
              <FaExclamationTriangle />
            </div>
            <div className="card-content">
              <h3>Overdue Bills</h3>
              <p className="amount">{formatCurrency(summary.summary.overdue.totalAmount)}</p>
              <p className="count">{summary.summary.overdue.count} bills</p>
            </div>
          </motion.div>

          <motion.div
            className="summary-card upcoming"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <div className="card-icon">
              <FaCalendarAlt />
            </div>
            <div className="card-content">
              <h3>Upcoming Bills</h3>
              <p className="count">{summary.upcomingBills.length} bills</p>
              <p className="text-sm text-gray-600">Next 7 days</p>
            </div>
          </motion.div>
        </div>
      )}

      {/* Filters and Search */}
      <div className="filters-section">
        <div className="search-bar">
          <FaSearch className="search-icon" />
          <input
            type="text"
            placeholder="Search bills..."
            value={filters.search}
            onChange={(e) => handleFilterChange("search", e.target.value)}
            className="search-input"
          />
        </div>

        <div className="filter-controls">
          <button
            className={`filter-toggle ${showFilters ? "active" : ""}`}
            onClick={() => setShowFilters(!showFilters)}
          >
            <FaFilter />
            Filters
          </button>
        </div>

        {showFilters && (
          <motion.div
            className="filters-panel"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
          >
            <div className="filter-group">
              <label>Status:</label>
              <select
                value={filters.status}
                onChange={(e) => handleFilterChange("status", e.target.value)}
              >
                <option value="all">All Status</option>
                <option value="pending">Pending</option>
                <option value="paid">Paid</option>
                <option value="overdue">Overdue</option>
              </select>
            </div>

            <div className="filter-group">
              <label>Frequency:</label>
              <select
                value={filters.frequency}
                onChange={(e) => handleFilterChange("frequency", e.target.value)}
              >
                <option value="all">All Frequencies</option>
                <option value="one-time">One Time</option>
                <option value="weekly">Weekly</option>
                <option value="monthly">Monthly</option>
                <option value="3months">3 Months</option>
                <option value="quaterly">Quarterly</option>
                <option value="6months">6 Months</option>
                <option value="yearly">Yearly</option>
              </select>
            </div>

            <div className="filter-group">
              <label>Sort By:</label>
              <select
                value={filters.sortBy}
                onChange={(e) => handleFilterChange("sortBy", e.target.value)}
              >
                <option value="dueDate">Due Date</option>
                <option value="amount">Amount</option>
                <option value="billName">Bill Name</option>
                <option value="createdAt">Created Date</option>
              </select>
            </div>

            <div className="filter-group">
              <label>Order:</label>
              <select
                value={filters.order}
                onChange={(e) => handleFilterChange("order", e.target.value)}
              >
                <option value="asc">Ascending</option>
                <option value="desc">Descending</option>
              </select>
            </div>
          </motion.div>
        )}
      </div>

      {/* Bills List */}
      <div className="bills-list">
        {loading ? (
          <Loading />
        ) : filteredBills.length > 0 ? (
          filteredBills.map((bill) => {
            const daysUntilDue = getDaysUntilDue(bill.dueDate);
            
            return (
              <motion.div
                key={bill._id}
                className={`bill-card ${bill.status}`}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                whileHover={{ scale: 1.02 }}
              >
                <div className="bill-header">
                  <div className="bill-info">
                    <h3 className="bill-name">{bill.billName}</h3>
                    <span className="bill-category">{bill.category}</span>
                  </div>
                  <div className="bill-status">
                    {getStatusIcon(bill.status)}
                    <span className={`status-text ${getStatusColor(bill.status)}`}>
                      {bill.status.charAt(0).toUpperCase() + bill.status.slice(1)}
                    </span>
                  </div>
                </div>

                <div className="bill-details">
                  <div className="detail-item">
                    <FaRupeeSign className="detail-icon" />
                    <span className="amount">{formatCurrency(bill.amount)}</span>
                  </div>
                  <div className="detail-item">
                    <FaCalendar className="detail-icon" />
                    <span>Due: {formatDate(bill.dueDate)}</span>
                  </div>
                  <div className="detail-item">
                    <FaCreditCard className="detail-icon" />
                    <span className="frequency">{bill.frequency}</span>
                  </div>
                </div>

                {daysUntilDue >= 0 && daysUntilDue <= 7 && bill.status === "pending" && (
                  <div className="due-soon-badge">
                    <FaExclamationTriangle />
                    {daysUntilDue === 0 ? "Due Today" : `Due in ${daysUntilDue} day${daysUntilDue > 1 ? 's' : ''}`}
                  </div>
                )}

                <div className="bill-actions">
                  <button
                    className="action-btn view"
                    onClick={() => handleViewDetails(bill)}
                    title="View Details"
                  >
                    <FaEye />
                  </button>
                  <button
                    className="action-btn edit"
                    onClick={() => handleEdit(bill)}
                    title="Edit Bill"
                  >
                    <FaEdit />
                  </button>
                  {bill.status === "pending" && (
                    <button
                      className="action-btn pay"
                      onClick={() => handleMarkAsPaid(bill._id)}
                      title="Mark as Paid"
                    >
                      <FaCheckCircle />
                    </button>
                  )}
                  <button
                    className="action-btn delete"
                    onClick={() => handleDelete(bill._id)}
                    title="Delete Bill"
                  >
                    <FaTrash />
                  </button>
                </div>
              </motion.div>
            );
          })
        ) : (
          <div className="empty-state">
            <FaMoneyBillWave className="empty-icon" />
            <h3>No bills found</h3>
            <p>Start by adding your first bill or adjust your filters</p>
            <button
              className="add-bill-btn"
              onClick={() => setShowAddBill(true)}
            >
              <FaPlus />
              Add Your First Bill
            </button>
          </div>
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="pagination">
          <button
            onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
            disabled={currentPage === 1}
            className="pagination-btn"
          >
            Previous
          </button>
          <span className="pagination-info">
            Page {currentPage} of {totalPages}
          </span>
          <button
            onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
            disabled={currentPage === totalPages}
            className="pagination-btn"
          >
            Next
          </button>
        </div>
      )}

      {/* Modals */}
      {showAddBill && (
        <AddBill
          onClose={() => setShowAddBill(false)}
          onSuccess={() => {
            setShowAddBill(false);
            fetchBills();
            fetchSummary();
          }}
        />
      )}

      {showEditBill && selectedBill && (
        <EditBill
          bill={selectedBill}
          onClose={() => {
            setShowEditBill(false);
            setSelectedBill(null);
          }}
          onSuccess={() => {
            setShowEditBill(false);
            setSelectedBill(null);
            fetchBills();
            fetchSummary();
          }}
        />
      )}

      {showBillDetails && selectedBill && (
        <BillDetails
          bill={selectedBill}
          onClose={() => {
            setShowBillDetails(false);
            setSelectedBill(null);
          }}
          onEdit={() => {
            setShowBillDetails(false);
            setShowEditBill(true);
          }}
          onDelete={() => {
            setShowBillDetails(false);
            setSelectedBill(null);
            handleDelete(selectedBill._id);
          }}
          onMarkPaid={() => {
            setShowBillDetails(false);
            setSelectedBill(null);
            handleMarkAsPaid(selectedBill._id);
          }}
        />
      )}
    </div>
  );
};

export default BillsDashboard;
