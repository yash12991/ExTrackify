import React, { useState } from "react";
import "./Sipcalc.css";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ResponsiveContainer,
} from "recharts";
import { FaTimes, FaRupeeSign, FaPercentage, FaCalendarAlt, FaChartLine } from "react-icons/fa";

const Sipcalc = ({ onClose }) => {
  const [monthlyInvestment, SetMonthly] = useState("");
  const [Rate, SetRate] = useState("");
  const [period, SetPeriod] = useState("");
  const [Result, SetResult] = useState("");
  const [chartData, setChartData] = useState([]);

  function handleSubmit(e) {
    e.preventDefault();
    const monthly = parseFloat(monthlyInvestment);
    const rate = parseFloat(Rate);
    const years = parseFloat(period);

    if (isNaN(monthly) || isNaN(rate) || isNaN(years)) {
      alert("Please enter valid numbers in all fields.");
      return;
    }

    if (monthly <= 0 || rate <= 0 || years <= 0) {
      alert("Please enter positive values for all fields.");
      return;
    }

    const r = rate / 100 / 12;
    const n = years * 12;
    const FV = monthly * ((Math.pow(1 + r, n) - 1) / r) * (1 + r);
    SetResult(FV);

    let data = [];
    let accumulated = 0;
    let invested = 0;

    for (let i = 1; i <= n; i++) {
      accumulated = accumulated * (1 + r) + monthly;
      invested += monthly;

      if (i % 12 === 0) {
        data.push({
          month: i / 12,
          value: parseFloat(accumulated.toFixed(2)),
          invested: parseFloat(invested.toFixed(2)),
        });
      }
    }

    setChartData(data);
  }

  function handleReset() {
    SetMonthly("");
    SetRate("");
    SetPeriod("");
    SetResult("");
    setChartData([]);
  }

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="calc-tooltip">
          <p className="calc-tooltip-label">Year {label}</p>
          <p className="calc-tooltip-row">
            Invested: ₹{payload[0].payload.invested.toLocaleString("en-IN")}
          </p>
          <p className="calc-tooltip-row highlight">
            Value: ₹{payload[1].payload.value.toLocaleString("en-IN")}
          </p>
        </div>
      );
    }
    return null;
  };

  const totalInvested = monthlyInvestment * period * 12;
  const expectedReturns = Result - totalInvested;

  return (
    <div className="calc-overlay">
      <div className="calc-modal">
        <div className="calc-modal-header">
          <div className="calc-modal-title">
            <FaChartLine className="calc-modal-icon" />
            <div>
              <h3>SIP Calculator</h3>
              <p>Estimate your investment growth</p>
            </div>
          </div>
          <button className="calc-modal-close" onClick={onClose}>
            <FaTimes />
          </button>
        </div>

        <div className="calc-modal-body">
          <form onSubmit={handleSubmit}>
            <div className="calc-input-row">
              <div className="calc-input-group">
                <label>
                  <FaRupeeSign /> Monthly Investment
                </label>
                <input
                  type="number"
                  value={monthlyInvestment}
                  onChange={(e) => SetMonthly(e.target.value)}
                  placeholder="5000"
                  min="1"
                  required
                />
              </div>
              <div className="calc-input-group">
                <label>
                  <FaPercentage /> Annual Return (%)
                </label>
                <input
                  type="number"
                  value={Rate}
                  onChange={(e) => SetRate(e.target.value)}
                  placeholder="12"
                  min="0.1"
                  max="50"
                  step="0.1"
                  required
                />
              </div>
              <div className="calc-input-group">
                <label>
                  <FaCalendarAlt /> Period (Years)
                </label>
                <input
                  type="number"
                  value={period}
                  onChange={(e) => SetPeriod(e.target.value)}
                  placeholder="10"
                  min="1"
                  max="50"
                  required
                />
              </div>
            </div>

            <div className="calc-modal-actions">
              <button type="submit" className="calc-btn-pri">Calculate</button>
              <button type="button" className="calc-btn-sec" onClick={handleReset}>Reset</button>
            </div>
          </form>

          {Result && (
            <div className="calc-result">
              <div className="calc-result-main">
                <span className="calc-result-label">Future Value</span>
                <span className="calc-result-amount">
                  ₹{parseFloat(Result).toLocaleString("en-IN", { maximumFractionDigits: 0 })}
                </span>
              </div>
              <div className="calc-result-meta">
                <div className="calc-result-item">
                  <span>Invested</span>
                  <span>₹{totalInvested.toLocaleString("en-IN")}</span>
                </div>
                <div className="calc-result-item">
                  <span>Returns</span>
                  <span className="calc-return-positive">
                    +₹{expectedReturns.toLocaleString("en-IN", { maximumFractionDigits: 0 })}
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>

        {chartData.length > 0 && (
          <div className="calc-chart-section">
            <h4>Growth Over Time</h4>
            <div className="calc-chart-wrap">
              <ResponsiveContainer width="100%" height={280}>
                <LineChart data={chartData} margin={{ top: 10, right: 20, left: 10, bottom: 30 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis dataKey="month" label={{ value: "Years", position: "insideBottom", offset: -10 }} stroke="#9ca3af" fontSize={12} />
                  <YAxis tickFormatter={(v) => `₹${(v / 1000).toFixed(0)}k`} stroke="#9ca3af" fontSize={12} />
                  <Tooltip content={<CustomTooltip />} />
                  <Line type="monotone" dataKey="invested" stroke="#9ca3af" strokeWidth={2} dot={false} name="Invested" />
                  <Line type="monotone" dataKey="value" stroke="#0e7490" strokeWidth={3} dot={false} name="Value" />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Sipcalc;
