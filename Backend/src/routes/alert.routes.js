import { Router } from "express";
import { verifyJWT } from "../middleware/auth.middleware.js";
import { createAlert, getAlerts, updateAlert, deleteAlert, checkAlerts } from "../controllers/alert.controller.js";

const router = Router();
router.use(verifyJWT);

router.post("/", createAlert);
router.get("/", getAlerts);
router.get("/check", checkAlerts);
router.put("/:id", updateAlert);
router.delete("/:id", deleteAlert);

export default router;
