import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/apiResponse.js";
import axios from "axios";

const MF_API_BASE = "https://api.mfapi.in/mf";

const searchFunds = asyncHandler(async (req, res) => {
  const { q } = req.query;
  if (!q || q.length < 2) {
    throw new ApiError(400, "Search query must be at least 2 characters");
  }

  try {
    const { data } = await axios.get(`${MF_API_BASE}/search`, {
      params: { q },
      timeout: 8000,
    });

    if (!Array.isArray(data)) {
      return res.status(200).json(new ApiResponse(200, [], "No results"));
    }

    const results = data.map((fund) => ({
      schemeCode: fund.schemeCode,
      schemeName: fund.schemeName,
    }));

    return res.status(200).json(new ApiResponse(200, results, "OK"));
  } catch (error) {
    console.error("MF search error:", error.message);
    throw new ApiError(502, "Failed to search mutual funds");
  }
});

const getFundDetails = asyncHandler(async (req, res) => {
  const { schemeCode } = req.params;
  if (!schemeCode) {
    throw new ApiError(400, "Scheme code is required");
  }

  try {
    const { data } = await axios.get(`${MF_API_BASE}/${schemeCode}`, {
      timeout: 10000,
    });

    const navData = data.data || [];
    const latestNav = navData.length > 0 ? parseFloat(navData[0].nav) : 0;
    const nav30dAgo = navData.length > 21 ? parseFloat(navData[21].nav) : latestNav;
    const nav1yAgo = navData.length > 365 ? parseFloat(navData[365].nav) : latestNav;
    const nav3yAgo = navData.length > 1095 ? parseFloat(navData[1095].nav) : latestNav;
    const nav5yAgo = navData.length > 1825 ? parseFloat(navData[1825].nav) : latestNav;

    const returns1m = nav30dAgo ? ((latestNav - nav30dAgo) / nav30dAgo * 100) : 0;
    const returns1y = nav1yAgo ? ((latestNav - nav1yAgo) / nav1yAgo * 100) : 0;
    const returns3y = nav3yAgo ? ((latestNav - nav3yAgo) / nav3yAgo * 100) : 0;
    const returns5y = nav5yAgo ? ((latestNav - nav5yAgo) / nav5yAgo * 100) : 0;

    const result = {
      ...data.meta,
      latestNav,
      date: navData[0]?.date || null,
      returns: {
        "1M": returns1m.toFixed(2),
        "1Y": returns1y.toFixed(2),
        "3Y": returns3y.toFixed(2),
        "5Y": returns5y.toFixed(2),
      },
    };

    return res.status(200).json(new ApiResponse(200, result, "OK"));
  } catch (error) {
    console.error("MF details error:", error.message);
    throw new ApiError(502, "Failed to fetch fund details");
  }
});

const getFundNavHistory = asyncHandler(async (req, res) => {
  const { schemeCode } = req.params;
  if (!schemeCode) {
    throw new ApiError(400, "Scheme code is required");
  }

  try {
    const { data } = await axios.get(`${MF_API_BASE}/${schemeCode}`, {
      timeout: 10000,
    });

    const navData = data.data || [];
    const limited = navData.slice(0, 500);

    return res.status(200).json(
      new ApiResponse(200, {
        meta: data.meta,
        navHistory: limited.map((entry) => ({
          date: entry.date,
          nav: parseFloat(entry.nav),
        })),
      }, "OK")
    );
  } catch (error) {
    console.error("MF NAV history error:", error.message);
    throw new ApiError(502, "Failed to fetch NAV history");
  }
});

const trendingCategories = [
  "Large Cap", "Mid Cap", "Small Cap", "ELSS", "Index Fund",
  "Liquid Fund", "Tax Saver", "Growth", "Dividend Yield", "Sectoral"
];

const getTrendingFunds = asyncHandler(async (req, res) => {
  try {
    const results = await Promise.allSettled(
      trendingCategories.map(async (cat) => {
        const { data } = await axios.get(`${MF_API_BASE}/search`, {
          params: { q: cat },
          timeout: 5000,
        });
        return (data || []).slice(0, 3).map((f) => ({
          schemeCode: f.schemeCode,
          schemeName: f.schemeName,
          category: cat,
        }));
      })
    );
    const seen = new Set();
    const funds = results
      .filter((r) => r.status === "fulfilled")
      .flatMap((r) => r.value)
      .filter((f) => {
        if (seen.has(f.schemeCode)) return false;
        seen.add(f.schemeCode);
        return true;
      })
      .slice(0, 15);
    return res.status(200).json(new ApiResponse(200, funds, "OK"));
  } catch (error) {
    console.error("Trending funds error:", error.message);
    return res.status(200).json(new ApiResponse(200, [], "OK"));
  }
});

export { searchFunds, getFundDetails, getFundNavHistory, getTrendingFunds };
