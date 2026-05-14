import { useState, useEffect } from "react";
import React from "react";
import Home from "./pages/Home/Home";
import {
  Navigate,
  Route,
  Routes,
  useNavigate,
  useLocation,
} from "react-router-dom";
import Login from "./pages/Login/Login";
import useAuthUser from "./hooks/useAuthUser";
import Features from "./pages/Features/Features";
import About from "./pages/About/About";
import Signup from "./pages/Signup/Signup";
import ForgotPassword from "./pages/ForgotPassword/ForgotPassword";
import ResetPassword from "./pages/ResetPassword/ResetPassword";
import DashBoard from "./pages/DashBoard/DashBoard";
import SIPDashboard from "./pages/SIPDashboard/SIPDashboard";
import SIPDetails from "./pages/SIPDetails/SIPDetails";
import BillsDashboard from "./pages/BillsDashboard/BillsDashboard";
import FinancialBot from "./pages/FinancialBot/FinancialBot";
import MutualFunds from "./pages/MutualFunds/MutualFunds";
import Stocks from "./pages/Stocks/Stocks";
import BankStatement from "./pages/BankStatement/BankStatement";
import Portfolio from "./pages/Portfolio/Portfolio";
import NetWorth from "./pages/NetWorth/NetWorth";
import SpendingAnalytics from "./pages/SpendingAnalytics/SpendingAnalytics";
import Alerts from "./pages/Alerts/Alerts";
import ReceiptScanner from "./pages/ReceiptScanner/ReceiptScanner";
import BudgetManagement from "./pages/BudgetManagement/BudgetManagement";
import { ErrorToaster } from "./components/errordisplay/ErrorDisplay";
import Cursor from "./components/cursor/Cursor";
import Loader from "./components/Loading/Loading";

const App = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { isLoading, authUser, error, isAuthenticated } = useAuthUser();

  useEffect(() => {
    const protectedPaths = ["/dashboard", "/bills", "/sip-dashboard", "/financial-bot", "/mutual-funds", "/stocks", "/bank-statement", "/portfolio", "/net-worth", "/analytics", "/alerts", "/receipt-scanner", "/budgets"];
    const isProtected = protectedPaths.some(
      (p) => location.pathname === p || location.pathname.startsWith("/sip/")
    );
    if (!isLoading && !isAuthenticated && isProtected) {
      navigate("/login");
    }
  }, [isAuthenticated, isLoading, location.pathname, navigate]);

  if (isLoading) {
    return (
      <div className="loading-spinner">
        <Loader />
        Loading...
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ color: "red" }}>
        Error: {error.message || "Failed to load user."}
      </div>
    );
  }

  return (
    <div className="app-wrapper">
      <Cursor />
      <ErrorToaster /> {/* This enables toast notifications */}
      <div className="app-container">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route
            path="/dashboard"
            element={isAuthenticated ? <DashBoard /> : <Navigate to="/login" />}
          />
          <Route
            path="/bills"
            element={isAuthenticated ? <BillsDashboard /> : <Navigate to="/login" />}
          />
          <Route
            path="/financial-bot"
            element={isAuthenticated ? <FinancialBot /> : <Navigate to="/login" />}
          />
          <Route
            path="/mutual-funds"
            element={isAuthenticated ? <MutualFunds /> : <Navigate to="/login" />}
          />
          <Route
            path="/stocks"
            element={isAuthenticated ? <Stocks /> : <Navigate to="/login" />}
          />
          <Route
            path="/bank-statement"
            element={isAuthenticated ? <BankStatement /> : <Navigate to="/login" />}
          />
          <Route
            path="/sip-dashboard"
            element={isAuthenticated ? <SIPDashboard /> : <Navigate to="/login" />}
          />
          <Route
            path="/sip/:sipId"
            element={isAuthenticated ? <SIPDetails /> : <Navigate to="/login" />}
          />
          <Route
            path="/portfolio"
            element={isAuthenticated ? <Portfolio /> : <Navigate to="/login" />}
          />
          <Route
            path="/net-worth"
            element={isAuthenticated ? <NetWorth /> : <Navigate to="/login" />}
          />
          <Route
            path="/analytics"
            element={isAuthenticated ? <SpendingAnalytics /> : <Navigate to="/login" />}
          />
          <Route
            path="/alerts"
            element={isAuthenticated ? <Alerts /> : <Navigate to="/login" />}
          />
          <Route
            path="/receipt-scanner"
            element={isAuthenticated ? <ReceiptScanner /> : <Navigate to="/login" />}
          />
          <Route
            path="/budgets"
            element={isAuthenticated ? <BudgetManagement /> : <Navigate to="/login" />}
          />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password" element={<ResetPassword />} />
          <Route path="/features" element={<Features />} />
          <Route path="/about" element={<About />} />
          <Route
            path="/login"
            element={!isAuthenticated ? <Login /> : <Navigate to="/dashboard" />}
          />
          <Route
            path="/signup"
            element={!isAuthenticated ? <Signup /> : <Navigate to="/" />}
          />
        </Routes>
      </div>
    </div>
  );
};

export default App;
