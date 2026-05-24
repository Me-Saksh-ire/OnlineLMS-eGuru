import express from "express";
import {
  getProfile,
  updateProfile,
  changePassword,
  uploadSignature,
} from "../controllers/userController.js";
import { protect } from "../middlewares/auth.js";
import { uploadAvatar } from "../configs/cloudinary.js";
import { uploadUserAvatar } from "../controllers/userController.js";

const router = express.Router();

router.get("/profile", protect, getProfile);
router.put("/profile", protect, updateProfile);
router.post(
  "/avatar",
  protect,
  uploadAvatar.single("avatar"),
  uploadUserAvatar,
);
router.post(
  "/upload-signature",
  protect,
  uploadAvatar.single("signature"),
  uploadSignature,
);
router.put("/change-password", protect, changePassword);

export default router;
