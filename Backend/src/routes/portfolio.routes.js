import { Router } from "express";
import { verifyJWT } from "../middleware/auth.middleware.js";
import { getPortfolio, addHolding, removeHolding, refreshPortfolio, getPortfolioAnalytics } from "../controllers/portfolio.controller.js";

const router = Router();
router.use(verifyJWT);

router.get("/", getPortfolio);
router.post("/holdings", addHolding);
router.delete("/holdings/:id", removeHolding);
router.post("/refresh", refreshPortfolio);
router.get("/analytics", getPortfolioAnalytics);

export default router;
