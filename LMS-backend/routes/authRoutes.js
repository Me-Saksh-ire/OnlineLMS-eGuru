import express from "express";
import {
  register,
  login,
  refreshToken,
  logout,
  forgotPassword,
  verifyOtp,
  resetPassword
} from "../controllers/authController.js";
import { protect } from "../middlewares/auth.js";

const router = express.Router();

router.post("/register", register);
router.post("/login", login);
router.post("/refresh", refreshToken);
router.post("/logout", protect, logout);
router.post("/forgot-password", forgotPassword);
router.post("/verify-otp", verifyOtp);
router.post("/reset-password", resetPassword);

export default router;
