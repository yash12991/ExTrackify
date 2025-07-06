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
import Signup from "./pages/SignUp/SignUp";
import DashBoard from "./pages/DashBoard/DashBoard";
import SIPDashboard from "./pages/SIPDashboard/SIPDashboard";
import SIPDetails from "./pages/SIPDetails/SIPDetails";
import BillsDashboard from "./pages/BillsDashboard/BillsDashboard";
import { ErrorToaster } from "./components/errordisplay/ErrorDisplay";
import Cursor from "./components/cursor/Cursor";
import Loader from "./components/Loading/Loading";

const App = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { isLoading, authUser, error, isAuthenticated } = useAuthUser();

  useEffect(() => {
    // Redirect from protected routes when not authenticated
    if (!isLoading && !isAuthenticated && (location.pathname === "/dashboard" || location.pathname === "/bills")) {
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
            element={
              isAuthenticated ? <BillsDashboard /> : <Navigate to="/login" />
            }
          />
          <Route
            path="/sip-dashboard"
            element={
              isAuthenticated ? <SIPDashboard /> : <Navigate to="/login" />
            }
          />
          <Route
            path="/sip/:sipId"
            element={
              isAuthenticated ? <SIPDetails /> : <Navigate to="/login" />
            }
          />
          <Route path="/features" element={<Features />} />
          <Route path="/about" element={<About />} />
          <Route
            path="/login"
            element={
              !isAuthenticated ? <Login /> : <Navigate to="/dashboard" />
              //  <Login />
            }
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
