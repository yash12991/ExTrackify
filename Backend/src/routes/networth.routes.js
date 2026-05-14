import { Router } from "express";
import { verifyJWT } from "../middleware/auth.middleware.js";
import { calculateNetWorth, getNetWorthHistory } from "../controllers/networth.controller.js";

const router = Router();
router.use(verifyJWT);

router.post("/calculate", calculateNetWorth);
router.get("/history", getNetWorthHistory);

export default router;
