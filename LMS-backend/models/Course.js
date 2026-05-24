import mongoose from "mongoose";

const courseSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    description: { type: String, required: true },
    thumbnail: { type: String, default: "" },
    category: { type: String, required: true },
    level: {
      type: String,
      enum: ["Beginner", "Intermediate", "Advanced", "Beginner to Advanced"],
      default: "Beginner",
    },
    price: { type: Number, required: true },
    discountPrice: { type: Number, default: 0 },
    instructor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    lessons: [{ type: mongoose.Schema.Types.ObjectId, ref: "Lesson" }],
    syllabus: [{ type: String }],
    requirements: [{ type: String }],
    whatYouWillLearn: [{ type: String }],
    language: { type: String, default: "English" },
    isPublished: { type: Boolean, default: false },
    totalStudents: { type: Number, default: 0 },
    rating: { type: Number, default: 0 },
    totalReviews: { type: Number, default: 0 },
  },
  { timestamps: true },
);

export default mongoose.model("Course", courseSchema);
