import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: { type: String, enum: ["student", "instructor"], default: "student" },
    image: { type: String, default: "" },
    bio: { type: String, default: "" },
    signature: { type: String, default: null },
    refreshToken: { type: String, default: null },
    razorpayLinkedAccountId: { type: String, default: null },
    bankAccountLinked: { type: Boolean, default: false },
    rating: { type: Number, default: 0 },
    totalRatings: { type: Number, default: 0 },
    resetOtp: { type: String },
    resetOtpExpiry: { type: Date },
  },
  { timestamps: true },
);

export default mongoose.model("User", userSchema);
