import { Router } from "express";
import { verifyJWT } from "../middleware/auth.middleware.js";
import { searchStocks, getStockQuote, getStockHistory, getMarketIndices, getCompanyProfile, getStockNews, getTrendingStocks } from "../controllers/stock.controller.js";

const router = Router();

router.get("/trending", verifyJWT, getTrendingStocks);
router.get("/search", verifyJWT, searchStocks);
router.get("/indices", verifyJWT, getMarketIndices);
router.get("/:symbol/history", verifyJWT, getStockHistory);
router.get("/:symbol/news", verifyJWT, getStockNews);
router.get("/:symbol/profile", verifyJWT, getCompanyProfile);
router.get("/:symbol", verifyJWT, getStockQuote);

export default router;
