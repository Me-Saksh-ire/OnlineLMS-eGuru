import mongoose from "mongoose";

const transferSchema = new mongoose.Schema(
  {
    instructor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    course: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Course",
      required: true,
    },
    payment: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Payment",
      required: true,
    },
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    // Razorpay IDs
    razorpayPaymentId: { type: String, required: true }, // the original payment
    razorpayTransferId: { type: String }, // returned by Route API
    razorpayLinkedAccountId: { type: String }, // instructor's linked account

    // Money (stored in ₹, NOT paise)
    grossAmount: { type: Number, required: true }, // full course price paid
    platformFeePercent: { type: Number, required: true },
    platformFee: { type: Number, required: true }, // your cut in ₹
    instructorAmount: { type: Number, required: true }, // instructor's cut in ₹

    status: {
      type: String,
      enum: ["processed", "failed", "on_hold", "skipped"],
      default: "processed",
    },
    failureReason: { type: String }, // filled only when status = "failed"
  },
  { timestamps: true },
);

const Transfer = mongoose.model("Transfer", transferSchema);
export default Transfer;
