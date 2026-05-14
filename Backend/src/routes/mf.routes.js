import { Router } from "express";
import { verifyJWT } from "../middleware/auth.middleware.js";
import { searchFunds, getFundDetails, getFundNavHistory, getTrendingFunds } from "../controllers/mf.controller.js";

const router = Router();

router.get("/trending", verifyJWT, getTrendingFunds);
router.get("/search", verifyJWT, searchFunds);
router.get("/:schemeCode/details", verifyJWT, getFundDetails);
router.get("/:schemeCode/nav-history", verifyJWT, getFundNavHistory);

export default router;
