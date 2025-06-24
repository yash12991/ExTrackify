import React from "react";
import { motion } from "framer-motion";
import "./About.css";
import Navbar from "../../components/navbar/Navbar";

const About = () => {
  const fadeInUp = {
    initial: { y: 60, opacity: 0 },
    whileInView: { y: 0, opacity: 1 },
    viewport: { once: true },
    transition: { duration: 0.6 },
  };

  const features = [
    {
      icon: "chart-line",
      title: "Smart Analytics",
      desc: "Clear visualization of your spending patterns and financial trends",
    },
    {
      icon: "shield-alt",
      title: "Secure Platform",
      desc: "Industry-standard encryption to protect your financial data",
    },
    {
      icon: "bolt",
      title: "Real-Time Updates",
      desc: "Instant tracking and categorization of your expenses",
    },
    {
      icon: "cogs",
      title: "Easy Management",
      desc: "Simplified expense categorization and budget planning",
    },
  ];

  return (
    <>
      <Navbar />
      <div className="about-container">
        <div className="tech-lines"></div>
        <motion.div className="hero-section">
          <div className="hero-content">
            <motion.h1>
              Simplify Your <br />
              <span className="highlight">Financial Journey</span>
            </motion.h1>
            <motion.p className="hero-subtitle">
              Track, manage, and understand your expenses with ease
            </motion.p>
            <motion.div className="hero-stats">
              <div className="stat-pill">
                <span className="number">Simple</span>
                <span className="label">Easy to Use</span>
              </div>
              <div className="stat-pill">
                <span className="number">Secure</span>
                <span className="label">Data Protection</span>
              </div>
            </motion.div>
          </div>
          <div className="orbital-circles">
            <div className="orbital circle-1"></div>
            <div className="orbital circle-2"></div>
            <div className="orbital circle-3"></div>
          </div>
        </motion.div>

        <motion.section className="vision-section">
          <div className="vision-grid">
            <motion.div className="vision-content">
              <h2>Our Mission</h2>
              <p>
                We're dedicated to making expense tracking accessible and
                efficient for everyone. Our platform helps you make informed
                financial decisions through clear visualization and
                organization.
              </p>
              <div className="tech-badges">
                <span className="badge">Easy Tracking</span>
                <span className="badge">Clear Reports</span>
                <span className="badge">Budget Tools</span>
              </div>
            </motion.div>
            <div className="vision-stats">
              <motion.div className="stat-box" whileHover={{ scale: 1.05 }}>
                <span className="stat-value">Free</span>
                <span className="stat-label">Basic Plan</span>
              </motion.div>
              <motion.div className="stat-box" whileHover={{ scale: 1.05 }}>
                <span className="stat-value">24/7</span>
                <span className="stat-label">Online Access</span>
              </motion.div>
            </div>
          </div>
        </motion.section>

        <motion.section className="features-section">
          <motion.h2
            initial={fadeInUp.initial}
            whileInView={fadeInUp.whileInView}
            viewport={fadeInUp.viewport}
            transition={fadeInUp.transition}
          >
            Why Choose Us
          </motion.h2>
          <div className="features-grid">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                className="feature-card"
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.2 }}
                whileHover={{ y: -10, transition: { duration: 0.2 } }}
              >
                <div className="feature-icon">
                  <i className={`fas fa-${feature.icon}`}></i>
                </div>
                <h3>{feature.title}</h3>
                <p>{feature.desc}</p>
              </motion.div>
            ))}
          </div>
        </motion.section>

        <motion.section className="future-section">
          <motion.h2>Our Roadmap</motion.h2>
          <div className="timeline">
            <div className="timeline-item">
              <span className="year">Now</span>
              <h3>Core Features</h3>
              <p>Expense tracking and categorization</p>
            </div>
            <div className="timeline-item">
              <span className="year">Coming Soon</span>
              <h3>Enhanced Reports</h3>
              <p>Detailed financial insights</p>
            </div>
            <div className="timeline-item">
              <span className="year">Future</span>
              <h3>Mobile App</h3>
              <p>Track expenses on the go</p>
            </div>
          </div>
        </motion.section>

        <motion.section className="testimonials-section">
          <motion.h2
            initial={fadeInUp.initial}
            whileInView={fadeInUp.whileInView}
            viewport={fadeInUp.viewport}
            transition={fadeInUp.transition}
          >
            User Feedback
          </motion.h2>
          <div className="testimonial-container">
            <div className="testimonial-track">
              {[...Array(2)].map((_, i) => (
                <div key={i} className="testimonial-group">
                  {[
                    {
                      name: "John D.",
                      role: "Regular User",
                      text: "Great for tracking daily expenses!",
                    },
                    {
                      name: "Emma S.",
                      role: "Student",
                      text: "Helps me stick to my budget",
                    },
                    {
                      name: "Mark T.",
                      role: "Professional",
                      text: "Clean interface and useful features",
                    },
                  ].map((testimonial, index) => (
                    <motion.div
                      key={index}
                      className="testimonial-card"
                      whileHover={{ scale: 1.02 }}
                    >
                      <p>"{testimonial.text}"</p>
                      <div className="testimonial-author">
                        <span className="author-name">{testimonial.name}</span>
                        <span className="author-role">{testimonial.role}</span>
                      </div>
                    </motion.div>
                  ))}
                </div>
              ))}
            </div>
          </div>
        </motion.section>
      </div>
    </>
  );
};

export default About;
