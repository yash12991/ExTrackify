import { Router } from "express";
import { verifyJWT } from "../middleware/auth.middleware.js";
import { chatWithBot, analyzeStock } from "../controllers/bot.controller.js";

const router = Router();

router.post("/chat", verifyJWT, chatWithBot);
router.post("/analyze-stock", verifyJWT, analyzeStock);

export default router;
