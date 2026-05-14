import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { sendBotMessage } from "../../lib/api";
import DashboardLayout from "../../components/layout/DashboardLayout";
import { FaRobot, FaUser, FaPaperPlane } from "react-icons/fa";
import "./FinancialBot.css";

const quickActions = [
  "Give me a financial overview",
  "Where am I overspending?",
  "Suggest ways to save money",
  "How are my investments doing?",
  "Which mutual fund should I invest in?",
  "Am I on track with my goals?",
];

const FinancialBot = () => {
  const [messages, setMessages] = useState([
    {
      role: "assistant",
      content:
        "👋 Welcome! I'm your **ExTrackify AI** assistant. I can access your expenses, bills, SIPs, mutual funds, budgets, and goals to help you manage your finances. How can I help you today?",
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = async (text) => {
    const msg = (text || input).trim();
    if (!msg || loading) return;

    setInput("");
    setMessages((prev) => [...prev, { role: "user", content: msg }]);
    setLoading(true);

    try {
      const data = await sendBotMessage(msg);
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: data.data.reply },
      ]);
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content:
            "⚠️ Sorry, I'm having trouble connecting right now. Please try again.",
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <DashboardLayout>
      <div className="finbot-container">
        <motion.div
          className="finbot-header"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: "easeOut" }}
        >
          <div className="finbot-header-icon">
            <FaRobot />
          </div>
          <div className="finbot-header-text">
            <h1>Financial AI Assistant</h1>
            <p>Get insights and answers about your finances</p>
          </div>
        </motion.div>

        <motion.div
          className="finbot-chat"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, delay: 0.1 }}
        >
          <div className="finbot-messages">
            <AnimatePresence initial={false}>
              {messages.map((msg, i) => (
                <motion.div
                  key={i}
                  className={`finbot-msg ${msg.role === "user" ? "finbot-msg--user" : "finbot-msg--ai"}`}
                  initial={{ opacity: 0, y: 15, scale: 0.98 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  transition={{ duration: 0.3, ease: "easeOut" }}
                >
                  <div className="finbot-msg-avatar">
                    {msg.role === "user" ? <FaUser /> : <FaRobot />}
                  </div>
                  <div className="finbot-msg-content">
                    <div className="finbot-msg-role">
                      {msg.role === "user" ? "You" : "ExTrackify AI"}
                    </div>
                    <div className="finbot-msg-text">
                      {formatMessage(msg.content)}
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>

            {loading && (
              <motion.div
                className="finbot-msg finbot-msg--ai"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <div className="finbot-msg-avatar">
                  <FaRobot />
                </div>
                <div className="finbot-msg-content">
                  <div className="finbot-msg-role">ExTrackify AI</div>
                  <div className="finbot-typing">
                    <span className="finbot-typing-dot" />
                    <span className="finbot-typing-dot" />
                    <span className="finbot-typing-dot" />
                  </div>
                </div>
              </motion.div>
            )}

            <div ref={messagesEndRef} />
          </div>

          <div className="finbot-quick">
            {quickActions.map((action, i) => (
              <motion.button
                key={action}
                className="finbot-quick-btn"
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.04 }}
                onClick={() => handleSend(action)}
                disabled={loading}
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
              >
                {action}
              </motion.button>
            ))}
          </div>

          <div className="finbot-input-bar">
            <div className="finbot-input-wrap">
              <input
                ref={inputRef}
                type="text"
                className="finbot-input"
                placeholder="Ask about your finances..."
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                disabled={loading}
              />
              <motion.button
                className="finbot-send-btn"
                onClick={() => handleSend()}
                disabled={loading || !input.trim()}
                whileTap={{ scale: 0.9 }}
                whileHover={{ scale: 1.05 }}
              >
                <FaPaperPlane />
              </motion.button>
            </div>
          </div>
        </motion.div>
      </div>
    </DashboardLayout>
  );
};

const formatMessage = (text) => {
  const formatted = text
    .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")
    .replace(/\*(.*?)\*/g, "<em>$1</em>")
    .replace(/`(.*?)`/g, "<code>$1</code>")
    .replace(/\n/g, "<br/>");

  return <span dangerouslySetInnerHTML={{ __html: formatted }} />;
};

export default FinancialBot;
