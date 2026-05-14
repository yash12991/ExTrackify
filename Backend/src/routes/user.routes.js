import { Router } from "express";

import {
  login,
  logout,
  registerUser,
  refreshAccessToken,
  updateProfile,
  deleteUser,
  changePassword,
  displayCurrentUser,
  forgotPassword,
  resetPassword,
} from "../controllers/users.controllers.js";
import { checksession, verifyJWT } from "../middleware/auth.middleware.js";

const router = Router();

// Authentication routes
router.post("/register", checksession, registerUser);
router.post("/login", checksession, login);
router.post("/logout", verifyJWT, logout);
router.post("/refresh-token", refreshAccessToken);

// Password management
router.post("/forgot-password", forgotPassword);
router.post("/reset-password", resetPassword);

// Protected routes
router.put("/profile", verifyJWT, updateProfile);
router.delete("/delete", verifyJWT, deleteUser);
router.post("/change-password", verifyJWT, changePassword);
router.get("/me", verifyJWT, displayCurrentUser);

export default router;
