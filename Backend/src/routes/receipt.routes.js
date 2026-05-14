import { Router } from "express";
import { verifyJWT } from "../middleware/auth.middleware.js";
import { processReceipt } from "../controllers/receipt.controller.js";
import multer from "multer";

const upload = multer({ dest: "uploads/", limits: { fileSize: 10 * 1024 * 1024 } });

const router = Router();
router.use(verifyJWT);

router.post("/process", upload.single("receipt"), processReceipt);

export default router;
