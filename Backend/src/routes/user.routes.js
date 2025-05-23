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
} from "../controllers/users.controllers.js";
import { verifyJWT } from "../middleware/auth.middleware.js";

const router = Router();

router.route("/register").post(registerUser);
router.route("/login").post(login);
router.route("/logout").post(verifyJWT, logout);
router.route("/refresh-token").post(refreshAccessToken);

// Protected routes
router.route("/profile").put(verifyJWT, updateProfile);
router.route("/delete").delete(verifyJWT, deleteUser);
router.route("/change-password").post(verifyJWT, changePassword);
router.route("/get-currentUser").get(verifyJWT,displayCurrentUser);
export default router;
