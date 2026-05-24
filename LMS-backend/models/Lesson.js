import mongoose from "mongoose";

const lessonSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    description: { type: String, default: "" },
    videoUrl: { type: String, required: true },
    duration: { type: String, default: "" }, // e.g. "15:30"
    course: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Course",
      required: true,
    },
    order: { type: Number, required: true }, // lesson number / position
    isFree: { type: Boolean, default: false }, // preview lesson
    resources: [
      {
        name: { type: String },
        url: { type: String },
      },
    ],
  },
  { timestamps: true },
);

export default mongoose.model("Lesson", lessonSchema);
