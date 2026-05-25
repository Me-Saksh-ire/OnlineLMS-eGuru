import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import cors from "cors";

dotenv.config();

const app = express();

const { default: authRoutes } = await import("./routes/authRoutes.js");
const { default: userRoutes } = await import("./routes/userRoutes.js");
const { default: courseRoutes } = await import("./routes/courseRoutes.js");
const { default: lessonRoutes } = await import("./routes/lessonRoutes.js");
const { default: enrollmentRoutes } =
  await import("./routes/enrollmentRoutes.js");
const { default: ratingRoutes } = await import("./routes/ratingRoutes.js");
const { default: progressRoutes } = await import("./routes/progressRoutes.js");
const { default: paymentRoutes } = await import("./routes/paymentRoutes.js");
const { errorHandler } = await import("./middlewares/auth.js");

app.use(
  cors({
    origin: process.env.FRONTEND_URL,
    credentials: true,
  }),
);
app.use(express.json());

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/user", userRoutes);
app.use("/api/rating", ratingRoutes);
app.use("/api/course", courseRoutes);
app.use("/api/lesson", lessonRoutes);
app.use("/api/enrollment", enrollmentRoutes);
app.use("/api/progress", progressRoutes);
app.use("/api/payment", paymentRoutes);

// Global error handler
app.use(errorHandler);

// DB + Server
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log("MongoDB connected");
    app.listen(process.env.PORT || 5000, () => {
      console.log(`Server running on port ${process.env.PORT || 5000}`);
    });
  })
  .catch((err) => console.log("DB connection error:", err.message));
