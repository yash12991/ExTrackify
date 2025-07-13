import React, { useEffect } from "react";
import Navbar from "../../components/navbar/Navbar";
import { NavLink } from "react-router-dom";
import bglogo from "../../assets/image.png";
import "./Home.css";
import { motion, useAnimation } from "framer-motion";
import { useInView } from "react-intersection-observer";

const Home = () => {
  const controls = useAnimation();
  const [ref, inView] = useInView();

  useEffect(() => {
    if (inView) {
      controls.start("visible");
    }
  }, [controls, inView]);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.3,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.8,
        ease: "easeOut",
      },
    },
  };

  const floatingAnimation = {
    y: [-10, 10],
    transition: {
      duration: 2,
      repeat: Infinity,
      repeatType: "reverse",
      ease: "easeInOut",
    },
  };

  return (
    <div className="homePage min-h-screen bg-gradient-to-br from-[#1a1a1a] via-[#2d2d2d] to-[#1f1f1f] flex flex-col overflow-hidden">
      <motion.div
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
      >
        <Navbar />
      </motion.div>

      <div className="flex flex-1 items-center justify-between px-8 md:px-16 relative">
        {/* Animated background elements */}
        <motion.div
          className="absolute inset-0"
          animate={{
            background: [
              "radial-gradient(circle at 20% 20%, rgba(255, 107, 0, 0.1) 0%, transparent 50%)",
              "radial-gradient(circle at 80% 80%, rgba(255, 107, 0, 0.1) 0%, transparent 50%)",
            ],
          }}
          transition={{ duration: 10, repeat: Infinity, repeatType: "reverse" }}
        />

        <motion.div
          ref={ref}
          variants={containerVariants}
          initial="hidden"
          animate={controls}
          className="flex-1 max-w-2xl space-y-8 z-10"
        >
          <motion.h1
            className="text-6xl font-extrabold text-[#ff6b00] drop-shadow-lg leading-tight"
            variants={itemVariants}
          >
            Track Your <br />
            <motion.span
              className="text-transparent bg-clip-text bg-gradient-to-r from-[#ff6b00] to-[#ff8533]"
              animate={{ backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"] }}
              transition={{ duration: 5, repeat: Infinity }}
            >
              Expenses Smartly
            </motion.span>
          </motion.h1>

          <motion.p className="text-xl text-gray-300" variants={itemVariants}>
            <span className="font-semibold text-[#ff6b00]">ExTrackify</span>{" "}
            helps you manage your money with ease. Add and categorize your
            expenses, track your budget, and visualize your spending with
            beautiful charts.
          </motion.p>

          <motion.div className="flex gap-4" variants={itemVariants}>
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <NavLink
                to="/dashboard"
                className="home-link bg-gradient-to-r from-[#ff6b00] to-[#ff8533] text-white px-8 py-4 rounded-full text-xl font-bold shadow-lg transition-all duration-300"
              >
                Get Started Free
              </NavLink>
            </motion.div>

            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <NavLink
                to="/features"
                className="px-8 py-4 rounded-full text-xl font-bold border-2 border-[#ff6b00] text-[#ff6b00] hover:bg-[#ff6b00] hover:text-white transition-all duration-300"
              >
                Learn More
              </NavLink>
            </motion.div>
          </motion.div>
        </motion.div>

        <motion.div
          className="hidden md:flex flex-1 justify-center items-center"
          initial={{ opacity: 0, scale: 0.8, rotate: -10 }}
          animate={{ opacity: 1, scale: 1, rotate: 0 }}
          transition={{ duration: 1 }}
        >
          <motion.div className="relative" animate={floatingAnimation}>
            <motion.div
              className="absolute inset-0 bg-gradient-to-r from-[#ff6b00]/20 to-[#ff8533]/20 rounded-full filter blur-3xl"
              animate={{
                scale: [1, 1.2, 1],
                opacity: [0.5, 0.8, 0.5],
              }}
              transition={{
                duration: 3,
                repeat: Infinity,
                repeatType: "reverse",
              }}
            />
            <motion.img
              src={bglogo}
              alt="Expense Tracker Illustration"
              className="relative w-96 h-96 object-contain rounded-xl"
              whileHover={{
                scale: 1.1,
                rotate: 5,
                transition: { duration: 0.3 },
              }}
            />
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
};

export default Home;
