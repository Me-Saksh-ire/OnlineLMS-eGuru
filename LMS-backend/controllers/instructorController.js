import Razorpay from "razorpay";
import User from "../models/User.js";
import Transfer from "../models/Transfer.js";

const getRazorpay = () =>
  new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET,
  });

// ══════════════════════════════════════════════════════════════════════════════
// POST /api/instructor/link-account
// ══════════════════════════════════════════════════════════════════════════════
export const createLinkedAccount = async (req, res) => {
  try {
    const { pan, businessName, street, city, state, postalCode } = req.body;

    const instructor = await User.findById(req.user.id);
    if (!instructor)
      return res.json({ success: false, message: "User not found" });

    // Don't create a duplicate linked account
    if (instructor.razorpayLinkedAccountId)
      return res.json({
        success: false,
        message: "Linked account already exists",
        linkedAccountId: instructor.razorpayLinkedAccountId,
      });

    const razorpay = getRazorpay();

    const account = await razorpay.accounts.create({
      email: instructor.email,
      profile: {
        category: "education",
        subcategory: "e_learning",
        addresses: {
          registered: {
            street1: street || "Not provided",
            city: city || "Mumbai",
            state: state || "MH",
            postal_code: postalCode || "400001",
            country: "IN",
          },
        },
      },
      legal_business_name: businessName || instructor.name,
      business_type: "individual", // change to "route" if needed for your account type
      legal_info: {
        pan,
      },
    });

    await User.findByIdAndUpdate(req.user.id, {
      razorpayLinkedAccountId: account.id,
    });

    return res.json({
      success: true,
      message: "Linked account created. Now add your bank account.",
      linkedAccountId: account.id,
    });
  } catch (error) {
    console.error("createLinkedAccount error:", error.message);
    return res.json({ success: false, message: error.message });
  }
};

// ══════════════════════════════════════════════════════════════════════════════
// POST /api/instructor/add-bank
// ══════════════════════════════════════════════════════════════════════════════
export const addBankAccount = async (req, res) => {
  try {
    const { accountHolderName, accountNumber, ifscCode, accountType } =
      req.body;

    const instructor = await User.findById(req.user.id);
    if (!instructor?.razorpayLinkedAccountId)
      return res.json({
        success: false,
        message:
          "No linked account found. Please complete account setup first.",
      });

    const razorpay = getRazorpay();

    const bankAccount = await razorpay.bankaccount.create(
      instructor.razorpayLinkedAccountId,
      {
        ifsc_code: ifscCode,
        bank_account_number: accountNumber,
        account_type: accountType || "savings", // "savings" or "current"
        beneficiary_name: accountHolderName || instructor.name,
      },
    );

    await User.findByIdAndUpdate(req.user.id, {
      bankAccountLinked: true,
    });

    return res.json({
      success: true,
      message:
        "Bank account added successfully! You will now receive payouts automatically.",
      bankAccountId: bankAccount.id,
    });
  } catch (error) {
    console.error("addBankAccount error:", error.message);
    return res.json({ success: false, message: error.message });
  }
};

// ══════════════════════════════════════════════════════════════════════════════
// GET /api/instructor/payout-status
// ══════════════════════════════════════════════════════════════════════════════
export const getPayoutStatus = async (req, res) => {
  try {
    const instructor = await User.findById(req.user.id).select(
      "name email razorpayLinkedAccountId bankAccountLinked",
    );

    // Fetch all transfers for this instructor
    const transfers = await Transfer.find({ instructor: req.user.id })
      .populate("course", "title")
      .sort({ createdAt: -1 });

    const totalEarned = transfers
      .filter((t) => t.status === "processed")
      .reduce((sum, t) => sum + t.instructorAmount, 0);

    const pendingAmount = transfers
      .filter((t) => t.status === "skipped" || t.status === "failed")
      .reduce((sum, t) => sum + t.instructorAmount, 0);

    return res.json({
      success: true,
      payoutSetup: {
        linkedAccountCreated: !!instructor.razorpayLinkedAccountId,
        bankAccountLinked: !!instructor.bankAccountLinked,
      },
      earnings: {
        totalEarned,
        pendingAmount,
        transferCount: transfers.filter((t) => t.status === "processed").length,
      },
      recentTransfers: transfers.slice(0, 10), // last 10
    });
  } catch (error) {
    return res.json({ success: false, message: error.message });
  }
};
