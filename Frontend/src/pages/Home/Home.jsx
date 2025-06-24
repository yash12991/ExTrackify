import React from "react";
import Navbar from "../../components/navbar/Navbar";
import { NavLink } from "react-router-dom";
import bglogo from "../../assets/image.png";
import "./Home.css";
import { motion } from "framer-motion";

const Home = () => {
  return (
    <div className="homePage min-h-screen bg-gradient-to-br from-[#1a1a1a] via-[#2d2d2d] to-[#1f1f1f] flex flex-col">
      <Navbar />
      <div className="flex flex-1 items-center justify-between px-8 md:px-16">
        <motion.div
          className="flex-1 max-w-2xl space-y-8"
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8 }}
        >
          <h1 className="text-6xl font-extrabold text-[#ff6b00] drop-shadow-lg leading-tight">
            Track Your <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#ff6b00] to-[#ff8533]">
              Expenses Smartly
            </span>
          </h1>
          <p className="text-xl text-gray-300">
            <span className="font-semibold text-[#ff6b00]">ExTrackify</span>{" "}
            helps you manage your money with ease. Add and categorize your
            expenses, track your budget, and visualize your spending with
            beautiful charts.
          </p>
          <motion.div
            className="flex gap-4"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <NavLink
              to="/dashboard"
              className="home-link bg-gradient-to-r from-[#ff6b00] to-[#ff8533] text-white px-8 py-4 rounded-full text-xl font-bold shadow-lg hover:scale-105 hover:shadow-xl hover:from-[#ff8533] hover:to-[#ff6b00] transition-all duration-300"
            >
              Get Started Free
            </NavLink>
            <NavLink
              to="/features"
              className="px-8 py-6 rounded-full text-xl font-bold border-2 border-[#ff6b00] text-[#ff6b00] hover:bg-[#ff6b00] hover:text-white transition-all duration-300"
            >
              Learn More
            </NavLink>
          </motion.div>
        </motion.div>

        <motion.div
          className="hidden md:flex flex-1 justify-center items-center"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8 }}
        >
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-r from-[#ff6b00]/20 to-[#ff8533]/20 rounded-full filter blur-3xl animate-pulse"></div>
            <img
              src={bglogo}
              alt="Expense Tracker Illustration"
              className="relative w-96 h-96 object-contain rounded-xl hover:scale-105 transition-all duration-300"
            />
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Home;
