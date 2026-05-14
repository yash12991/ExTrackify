import React, { useEffect } from "react";
import "./DashboardLayout.css";
import Sidebar from "./Sidebar";

const DashboardLayout = ({ children }) => {
  useEffect(() => {
    document.body.classList.add("dashboard-mode");
    return () => {
      document.body.classList.remove("dashboard-mode");
    };
  }, []);

  return (
    <div className="layout-shell">
      <Sidebar />
      <main className="layout-content">{children}</main>
    </div>
  );
};

export default DashboardLayout;
