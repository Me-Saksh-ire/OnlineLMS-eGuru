import express from "express";
import {
  createOrder,
  verifyPayment,
  getMyPayments,
  getPendingTransfers,
} from "../controllers/paymentController.js";
import { protect, isInstructor } from "../middlewares/auth.js";

const router = express.Router();

router.post("/create-order", protect, createOrder);
router.post("/verify", protect, verifyPayment);
router.get("/my", protect, getMyPayments);
router.get("/pending-transfers", protect, isInstructor, getPendingTransfers);

export default router;
