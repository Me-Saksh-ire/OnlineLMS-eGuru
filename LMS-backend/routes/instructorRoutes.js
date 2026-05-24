// routes/instructorRoutes.js
// Mount this in server.js as:  app.use("/api/instructor", instructorRouter);

import express from "express";
import { protect, isInstructor } from "../middleware/authMiddleware.js";
import {
  createLinkedAccount,
  addBankAccount,
  getPayoutStatus,
} from "../controllers/instructorController.js";

const router = express.Router();

// All routes require the user to be logged in and have instructor role
router.use(protect, isInstructor);

// Step 1 — Create Razorpay linked account (needs PAN + address)
router.post("/link-account", createLinkedAccount);

// Step 2 — Add bank account to receive payouts
router.post("/add-bank", addBankAccount);

// Dashboard — payout setup status + earnings summary
router.get("/payout-status", getPayoutStatus);

export default router;
