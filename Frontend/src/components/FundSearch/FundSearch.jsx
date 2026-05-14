import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FaSearch, FaTimes, FaRupeeSign, FaStar } from "react-icons/fa";
import { searchMutualFunds, getFundDetails } from "../../lib/api";
import "./FundSearch.css";

const FundSearch = ({ selected, onSelect }) => {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const [selectedFund, setSelectedFund] = useState(null);
  const debounceRef = useRef(null);
  const wrapperRef = useRef(null);

  useEffect(() => {
    const handleClick = (e) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const handleSearch = (value) => {
    setQuery(value);
    if (debounceRef.current) clearTimeout(debounceRef.current);

    if (value.length < 2) {
      setResults([]);
      setShowDropdown(false);
      return;
    }

    debounceRef.current = setTimeout(async () => {
      setLoading(true);
      try {
        const data = await searchMutualFunds(value);
        setResults(data.data || []);
        setShowDropdown(true);
      } catch {
        setResults([]);
      } finally {
        setLoading(false);
      }
    }, 300);
  };

  const handleSelect = async (fund) => {
    setQuery(fund.schemeName);
    setSelectedFund(fund);
    setShowDropdown(false);
    onSelect({ schemeCode: fund.schemeCode, schemeName: fund.schemeName });

    try {
      const details = await getFundDetails(fund.schemeCode);
      if (details?.data) {
        setSelectedFund((prev) => ({ ...prev, details: details.data }));
      }
    } catch {}
  };

  const handleClear = () => {
    setQuery("");
    setSelectedFund(null);
    setResults([]);
    onSelect({ schemeCode: null, schemeName: null });
  };

  return (
    <div className="fund-search" ref={wrapperRef}>
      <label>
        <FaStar className="fund-search-icon" />
        Mutual Fund (Optional)
      </label>
      <div className="fund-search-input-wrap">
        <FaSearch className="fund-search-prefix" />
        <input
          type="text"
          className="fund-search-input"
          placeholder="Search mutual funds..."
          value={query}
          onChange={(e) => handleSearch(e.target.value)}
          onFocus={() => results.length > 0 && setShowDropdown(true)}
        />
        {query && (
          <button type="button" className="fund-search-clear" onClick={handleClear}>
            <FaTimes />
          </button>
        )}
      </div>

      <AnimatePresence>
        {showDropdown && results.length > 0 && (
          <motion.div
            className="fund-search-dropdown"
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
          >
            {results.map((fund) => (
              <button
                key={fund.schemeCode}
                type="button"
                className="fund-search-item"
                onClick={() => handleSelect(fund)}
              >
                <div className="fund-search-item-name">{fund.schemeName}</div>
                <div className="fund-search-item-code">Code: {fund.schemeCode}</div>
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {selectedFund?.details && (
        <div className="fund-search-preview">
          <div className="fund-search-preview-row">
            <span>Fund House</span>
            <strong>{selectedFund.details.fund_house}</strong>
          </div>
          <div className="fund-search-preview-row">
            <span>Category</span>
            <strong>{selectedFund.details.scheme_category}</strong>
          </div>
          <div className="fund-search-preview-row">
            <span>Latest NAV</span>
            <strong>
              <FaRupeeSign />
              {selectedFund.details.latestNav?.toFixed(2)}
            </strong>
          </div>
          <div className="fund-search-preview-returns">
            {selectedFund.details.returns &&
              Object.entries(selectedFund.details.returns).map(([period, ret]) => (
                <span
                  key={period}
                  className={`fund-search-return-badge ${parseFloat(ret) >= 0 ? "positive" : "negative"}`}
                >
                  {period}: {ret}%
                </span>
              ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default FundSearch;
