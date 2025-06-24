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
import { checksession, verifyJWT } from "../middleware/auth.middleware.js";

const router = Router();

router.route("/register").post(checksession, registerUser);
router.route("/login").post(checksession, login);
router.route("/logout").post(verifyJWT, logout);
router.route("/refresh-token").post(refreshAccessToken);

// Protected routes
router.route("/profile").put(verifyJWT, updateProfile);
router.route("/delete").delete(verifyJWT, deleteUser);
router.route("/change-password").post(verifyJWT, changePassword);
router.route("/get-currentUser").get(verifyJWT, displayCurrentUser);
router.route("/me").get(verifyJWT, (req, res) => {
  res.status(200).json({ success: true, user: req.user });
});

export default router;
