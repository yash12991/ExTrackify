import { useState, useEffect } from "react";
import React from "react";
import Home from "./pages/Home/Home";
import { Navigate, Route, Routes, useNavigate, useLocation } from "react-router-dom";
import Login from "./pages/Login/Login";
import useAuthUser from "./hooks/useAuthUser";
import Features from "./pages/Features/Features";
import About from "./pages/About/About";
import Signup from "./pages/Signup/Signup";
import DashBoard from "./pages/DashBoard/DashBoard";
import { ErrorToaster } from "./components/errordisplay/ErrorDisplay";
import Cursor from "./components/cursor/Cursor";
import Loader from "./components/Loading/Loading";

const App = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { isLoading, authUser, error, isAuthenticated } = useAuthUser();

  useEffect(() => {
    // Redirect from protected routes when not authenticated
    if (!isLoading && !isAuthenticated && location.pathname === "/dashboard") {
      navigate("/login");
    }
  }, [isAuthenticated, isLoading, location.pathname, navigate]);

  if (isLoading) {
    return <div className="loading-spinner"><Loader/>Loading...</div>;
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
            element={
              isAuthenticated ? (
                <DashBoard />
              ) : (
                <Navigate to="/login"/>
              )
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
