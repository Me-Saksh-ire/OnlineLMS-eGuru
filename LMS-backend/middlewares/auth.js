import jwt from "jsonwebtoken";
import User from "../models/User.js";

export const protect = async (req, res, next) => {
  let token = req.headers.authorization;

  if (token && token.startsWith("Bearer ")) {
    token = token.split(" ")[1];
  }

  if (!token)
    return res.status(401).json({
      success: false,
      message: "Not authorized. Token missing.",
    });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const user = await User.findById(decoded.id).select(
      "-password -refreshToken",
    );
    if (!user)
      return res
        .status(404)
        .json({ success: false, message: "User not found" });

    req.user = user;
    next();
  } catch (error) {
    // Handle expired tokens explicitly so clients can react (e.g. refresh)
    if (error && error.name === "TokenExpiredError") {
      return res.status(401).json({
        success: false,
        message: "Token expired",
        expiredAt: error.expiredAt,
      });
    }

    console.error(error && error.stack ? error.stack : error);
    return res.status(401).json({
      success: false,
      message: error.message || "Invalid token",
    });
  }
};

export const isInstructor = (req, res, next) => {
  if (req.user.role !== "instructor")
    return res.json({ success: false, message: "Instructor access only" });
  next();
};

export const errorHandler = (err, req, res, next) => {
  console.error("❌ Error:", err && err.stack ? err.stack : err);
  const status = err && err.status ? err.status : 500;
  const message = err && err.message ? err.message : "Internal server error";
  const payload = { success: false, message };
  if (process.env.NODE_ENV !== "production") payload.stack = err.stack;
  res.status(status).json(payload);
};
