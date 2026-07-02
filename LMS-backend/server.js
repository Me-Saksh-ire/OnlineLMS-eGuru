import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import connectDB from "./configs/db.js";

dotenv.config();

const app = express();

const { default: authRoutes } = await import("./routes/authRoutes.js");
const { default: userRoutes } = await import("./routes/userRoutes.js");
const { default: courseRoutes } = await import("./routes/courseRoutes.js");
const { default: lessonRoutes } = await import("./routes/lessonRoutes.js");
const { default: enrollmentRoutes } = await import("./routes/enrollmentRoutes.js");
const { default: ratingRoutes } = await import("./routes/ratingRoutes.js");
const { default: progressRoutes } = await import("./routes/progressRoutes.js");
const { default: paymentRoutes } = await import("./routes/paymentRoutes.js");
const { errorHandler } = await import("./middlewares/auth.js");

const allowedOrigins = [
  process.env.FRONTEND_URL,       // e.g. https://eguru-learn.vercel.app
  "http://localhost:3000"
].filter(Boolean);

app.use(
  cors({
    origin: function (origin, callback) {
      // allow requests with no origin (Postman, curl, server-to-server)
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error(`CORS blocked for origin: ${origin}`));
      }
    },
    credentials: true
  }
  )
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
connectDB();
app.listen(process.env.PORT || 5000, () => {
  console.log(`Server running on port ${process.env.PORT || 5000}`);
});