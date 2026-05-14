import React from "react";
import { motion } from "framer-motion";
import { useNavigate, useLocation } from "react-router-dom";
import {
  FaWallet,
  FaFileInvoiceDollar,
  FaPiggyBank,
  FaQuestionCircle,
  FaRobot,
  FaChartLine,
  FaChartBar,
  FaFileUpload,
  FaBriefcase,
  FaBalanceScale,
  FaChartPie,
  FaBell,
  FaCamera,
  FaMoneyCheckAlt,
} from "react-icons/fa";
import logo from "../../assets/image.png";

const navItems = [
  { path: "/dashboard", label: "All Expenses", icon: <FaWallet /> },
  { path: "/bills", label: "Bills & Subscriptions", icon: <FaFileInvoiceDollar /> },
  { path: "/budgets", label: "Budgets", icon: <FaMoneyCheckAlt /> },
  { path: "/sip-dashboard", label: "SIP Details", icon: <FaPiggyBank /> },
  { path: "/mutual-funds", label: "Mutual Funds", icon: <FaChartLine /> },
  { path: "/stocks", label: "Stock Explorer", icon: <FaChartBar /> },
  { path: "/portfolio", label: "Portfolio", icon: <FaBriefcase /> },
  { path: "/net-worth", label: "Net Worth", icon: <FaBalanceScale /> },
  { path: "/analytics", label: "Analytics", icon: <FaChartPie /> },
  { path: "/alerts", label: "Alerts", icon: <FaBell /> },
  { path: "/receipt-scanner", label: "Receipt Scanner", icon: <FaCamera /> },
  { path: "/bank-statement", label: "Bank Statement", icon: <FaFileUpload /> },
  { path: "/financial-bot", label: "Financial AI", icon: <FaRobot /> },
  { path: null, label: "Help", icon: <FaQuestionCircle /> },
];

const Sidebar = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const isActiveRoute = (path) => {
    if (!path) return false;
    if (location.pathname === path) return true;
    if (path === "/sip-dashboard" && location.pathname.startsWith("/sip/")) {
      return true;
    }
    return false;
  };

  return (
    <aside className="layout-sidebar">
      <button type="button" className="layout-brand" onClick={() => navigate("/")}> 
        <img src={logo} alt="ExTrackify" className="layout-logo" />
        <span className="layout-brand-name">ExTrackify</span>
      </button>
      <div className="layout-divider" />
      <div className="layout-sidebar-header">
        <h2>Tools</h2>
      </div>
      <nav className="layout-sidebar-nav">
        {navItems.map((item) => (
          <motion.button
            key={item.label}
            className={`layout-nav-item${isActiveRoute(item.path) ? " active" : ""}`}
            onClick={() => item.path && navigate(item.path)}
            whileTap={{ scale: 0.97 }}
            whileHover={{ x: 4 }}
            transition={{ type: "spring", stiffness: 500, damping: 32 }}
          >
            {item.icon} {item.label}
          </motion.button>
        ))}
      </nav>
    </aside>
  );
};

export default Sidebar;