import mongoose from "mongoose";

const enrollmentSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    course: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Course",
      required: true,
    },
    paymentStatus: {
      type: String,
      enum: ["pending", "paid"],
      default: "pending",
    },
    completedLessons: [{ type: mongoose.Schema.Types.ObjectId, ref: "Lesson" }],
    completedAt: { type: Date, default: null }, // set when all lessons done
  },
  { timestamps: true },
);

// One enrollment per user per course
enrollmentSchema.index({ user: 1, course: 1 }, { unique: true });

export default mongoose.model("Enrollment", enrollmentSchema);
