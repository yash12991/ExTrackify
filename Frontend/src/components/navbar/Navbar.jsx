import React, { useEffect, useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";
import useAuthUser from "../../hooks/useAuthUser";
import { logout } from "../../lib/api";
import Loading from "../Loading/Loading";
import "./Navbar.css";
import logo from "../../assets/image.png";

const Navbar = () => {
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const { isLoading, isAuthenticated } = useAuthUser();

  const handleLogout = async () => {
    if (isLoggingOut) return;
    setIsLoggingOut(true);
    try {
      await logout();
      queryClient.clear();
      queryClient.invalidateQueries(["authUser"]);
      navigate("/");
    } catch (error) {
      console.error("Logout failed:", error);
    } finally {
      setIsLoggingOut(false);
    }
  };

  if (isLoading) {
    return <Loading />;
  }

  return (
    <div className="Navbar">
      <div className="logo">
        <img src={logo} alt="Logo" className="logo-image" />
        <h1>ExTrackify</h1>
      </div>
      
      <nav className="Options" role="navigation">
        <NavLink
          to="/"
          className={({ isActive }) => (isActive ? "active-link" : "nav-link")}
        >
          Home
        </NavLink>
        <NavLink
          to="/dashboard"
          className={({ isActive }) => (isActive ? "active-link" : "nav-link")}
        >
          Dashboard
        </NavLink>
        <NavLink
          to="/features"
          className={({ isActive }) => (isActive ? "active-link" : "nav-link")}
        >
          Features
        </NavLink>
        <NavLink
          to="/about"
          className={({ isActive }) => (isActive ? "active-link" : "nav-link")}
        >
          About Us
        </NavLink>
      </nav>

      <div className="auth-buttons">
        {isAuthenticated ? (
          <button
            className="login-btn"
            onClick={handleLogout}
            disabled={isLoggingOut}
          >
            {isLoggingOut ? 'Logging out...' : 'Logout'}
          </button>
        ) : (
          <button 
            className="login-btn" 
            onClick={() => navigate("/login")}
            aria-label="Login or Sign up"
          >
            LOGIN/SIGNUP
          </button>
        )}
      </div>
    </div>
  );
};

export default Navbar;
