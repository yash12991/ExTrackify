import React from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import Navbar from "../../components/navbar/Navbar";
import "./Features.css";

const Features = () => {
  const navigate = useNavigate();
  const features = [
    {
      title: "Basic Expense Tracking",
      description: "Track your daily expenses with ease",
      icon: "receipt",
      details: ["Manual entry", "Basic categories", "Simple dashboard"],
      available: true,
    },
    {
      title: "Budget Overview",
      description: "See your spending patterns",
      icon: "chart-pie",
      details: ["Monthly view", "Category totals", "Basic insights"],
      available: true,
    },
    {
      title: "Coming Soon: Advanced Reports",
      description: "Detailed analytics and insights (Coming Soon)",
      icon: "chart-line",
      details: ["Trend analysis", "Custom reports", "Export options"],
      available: false,
    },
    {
      title: "Coming Soon: Smart Features",
      description: "Advanced features in development",
      icon: "lightbulb",
      details: ["Auto-categorization", "Smart alerts", "Custom dashboards"],
      available: false,
    },
  ];

  return (
    <>
      <Navbar />
      <div className="features-page">
        <motion.section
          className="features-hero"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8 }}
        >
          <h1>
            Powerful Features for
            <br />
            Smart Money Management
          </h1>
          <p className="subtitle">
            Everything you need to take control of your finances
          </p>
          <div className="feature-cards">
            {features.map((feature, index) => (
              <motion.div
                className={`feature-card ${
                  !feature.available ? "coming-soon" : ""
                }`}
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.2 }}
                whileHover={{ scale: feature.available ? 1.05 : 1 }}
              >
                <div className="feature-icon">
                  <i className={`fas fa-${feature.icon}`}></i>
                </div>
                <h3>{feature.title}</h3>
                <p>{feature.description}</p>
                <ul className="feature-details">
                  {feature.details.map((detail, idx) => (
                    <li
                      key={idx}
                      className={!feature.available ? "unavailable" : ""}
                    >
                      <i
                        className={`fas fa-${
                          feature.available ? "check" : "clock"
                        }`}
                      ></i>
                      {detail}
                    </li>
                  ))}
                </ul>
              </motion.div>
            ))}
          </div>
        </motion.section>

        <motion.section className="features-comparison">
          <h2>Available Plans</h2>
          <div className="plans-grid">
            <div className="plan-card free">
              <h3>Basic</h3>
              <div className="price">Free</div>
              <ul>
                <li>
                  <i className="fas fa-check"></i> Basic expense tracking
                </li>
                <li>
                  <i className="fas fa-check"></i> Simple categorization
                </li>
                <li>
                  <i className="fas fa-check"></i> Monthly overview
                </li>
              </ul>
              <button
                className="plan-button"
                onClick={() => navigate("/dashboard")}
              >
                Get Started
              </button>
            </div>
            <div className="plan-card premium coming-soon">
              <div className="coming-soon-tag">Coming Soon</div>
              <h3>Premium</h3>
              <div className="price">TBA</div>
              <p className="coming-soon-text">
                We're working on exciting premium features!
              </p>
              <button className="plan-button premium" disabled>
                Coming Soon
              </button>
            </div>
          </div>
        </motion.section>
      </div>
    </>
  );
};

export default Features;
