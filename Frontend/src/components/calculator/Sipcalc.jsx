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
import { FaCross, FaRemoveFormat, FaTimes, FaXbox } from "react-icons/fa";

const Sipcalc = ({onClose}) => {
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

    // Generate chart data
    let data = [];
    let accumulated = 0;
    let invested = 0;

    for (let i = 1; i <= n; i++) {
      accumulated = accumulated * (1 + r) + monthly;
      invested += monthly;

      // Add data point every 12 months (yearly)
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
    setChartData([]); // Reset chart data
  }

  // Custom tooltip for better formatting
  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="custom-tooltip">
          <p className="tooltip-label">{`Year ${label}`}</p>
          <p className="tooltip-invested">
            Total Invested: ₹
            {payload[0].payload.invested.toLocaleString("en-IN")}
          </p>
          <p className="tooltip-value">
            Portfolio Value: ₹{payload[1].payload.value.toLocaleString("en-IN")}
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="SipCalc-form">
      <FaTimes className="dismiss" onClick={onClose}  />
      <form onSubmit={handleSubmit}>
        <div className="form">
          <div className="form-inputs">
            <div className="inputs">
              <label>
                <h3>Monthly Investment</h3>
              </label>
              <input
                type="number"
                value={monthlyInvestment}
                onChange={(e) => SetMonthly(e.target.value)}
                placeholder="e.g., 5000"
                min="1"
                required
              />
            </div>

            <div className="inputs">
              <label>
                <h3>Expected Annual Returns (%)</h3>
              </label>
              <input
                type="number"
                value={Rate}
                onChange={(e) => SetRate(e.target.value)}
                placeholder="e.g., 12"
                min="0.1"
                max="50"
                step="0.1"
                required
              />
            </div>

            <div className="inputs">
              <label>
                <h3>Investment Period (Years)</h3>
              </label>
              <input
                type="number"
                value={period}
                onChange={(e) => SetPeriod(e.target.value)}
                placeholder="e.g., 10"
                min="1"
                max="50"
                required
              />
            </div>
          </div>

          <div style={{ display: "flex", gap: "15px" }}>
            <button type="submit" className="submit-btn">
              Calculate
            </button>
            <button
              type="button"
              className="submit-btn reset-btn"
              onClick={handleReset}
            >
              Reset
            </button>
          </div>
        </div>
      </form>

      {Result && (
        <div className="result-box">
          <h2>
            Future Value of SIP: ₹
            {parseFloat(Result).toLocaleString("en-IN", {
              maximumFractionDigits: 0,
            })}
          </h2>
          <p style={{ margin: "10px 0 0 0", color: "#ccc", fontSize: "14px" }}>
            Total Investment: ₹
            {(monthlyInvestment * period * 12).toLocaleString("en-IN")} |
            Expected Returns: ₹
            {(Result - monthlyInvestment * period * 12).toLocaleString(
              "en-IN",
              { maximumFractionDigits: 0 }
            )}
          </p>
        </div>
      )}

      {chartData.length > 0 && (
        <div className="chart-container">
          <h3 className="chart-title">SIP Growth Visualization</h3>
          <div className="chart-wrapper">
            <ResponsiveContainer width="100%" height={400}>
              <LineChart
                data={chartData}
                margin={{ top: 20, right: 30, left: 20, bottom: 60 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                <XAxis
                  dataKey="month"
                  label={{
                    value: "Years",
                    position: "insideBottomRight",
                    offset: 0,
                  }}
                  stroke="#fff"
                />
                <YAxis
                  tickFormatter={(value) => `₹${(value / 1000).toFixed(0)}k`}
                  stroke="#fff"
                />
                <Tooltip content={<CustomTooltip />} />
                <Line
                  type="monotone"
                  dataKey="invested"
                  stroke="#888"
                  strokeWidth={2}
                  name="Total Invested"
                />
                <Line
                  type="monotone"
                  dataKey="value"
                  stroke="#ff6b35"
                  strokeWidth={3}
                  name="Portfolio Value"
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}
    </div>
  );
};

export default Sipcalc;
