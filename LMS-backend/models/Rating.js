// models/Rating.js

import mongoose from "mongoose";

const ratingSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    course: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Course",
      required: true,
    },
    stars: {
      type: Number,
      required: true,
      min: 1,
      max: 5,
    },
    review: {
      type: String,
      default: "",
      maxlength: 500,
    },
  },
  { timestamps: true },
);

// One rating per student per course
ratingSchema.index({ user: 1, course: 1 }, { unique: true });

const Rating = mongoose.model("Rating", ratingSchema);
export default Rating;
