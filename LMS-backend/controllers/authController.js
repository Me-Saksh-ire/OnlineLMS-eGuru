import User from "../models/User.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

const generateTokens = (userId) => {
  const accessToken = jwt.sign({ id: userId }, process.env.JWT_SECRET, {
    expiresIn: "15m",
  });
  const refreshToken = jwt.sign(
    { id: userId },
    process.env.JWT_REFRESH_SECRET,
    { expiresIn: "7d" },
  );
  return { accessToken, refreshToken };
};

// POST /api/auth/register
export const register = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    if (!name || !email || !password || password.length < 8)
      return res.json({
        success: false,
        message: "Fill all fields. Password must be at least 8 characters.",
      });

    const existingUser = await User.findOne({ email });
    if (existingUser)
      return res.json({ success: false, message: "Email already registered" });

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      role: role || "student",
    });

    const { accessToken, refreshToken } = generateTokens(user._id.toString());
    user.refreshToken = refreshToken;
    await user.save();

    return res.json({
      success: true,
      accessToken,
      refreshToken,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    console.log(error.message);
    return res.json({ success: false, message: error.message });
  }
};

// POST /api/auth/login
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password)
      return res.json({
        success: false,
        message: "Email and password are required",
      });

    const user = await User.findOne({ email });
    if (!user) return res.json({ success: false, message: "User not found" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch)
      return res.json({ success: false, message: "Invalid credentials" });

    const { accessToken, refreshToken } = generateTokens(user._id.toString());
    user.refreshToken = refreshToken;
    await user.save();

    return res.json({
      success: true,
      accessToken,
      refreshToken,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    console.log(error.message);
    return res.json({ success: false, message: error.message });
  }
};

// POST /api/auth/refresh
export const refreshToken = async (req, res) => {
  try {
    const { refreshToken } = req.body;
    if (!refreshToken)
      return res
        .status(400)
        .json({ success: false, message: "Refresh token required" });

    const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);
    const user = await User.findById(decoded.id);

    if (!user || user.refreshToken !== refreshToken)
      return res
        .status(401)
        .json({ success: false, message: "Invalid refresh token" });

    const tokens = generateTokens(user._id.toString());
    user.refreshToken = tokens.refreshToken;
    await user.save();

    return res.json({ success: true, ...tokens });
  } catch (error) {
    console.error(error && error.stack ? error.stack : error);
    return res
      .status(401)
      .json({ success: false, message: "Token expired or invalid" });
  }
};

// POST /api/auth/logout
export const logout = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    user.refreshToken = null;
    await user.save();
    return res.json({ success: true, message: "Logged out successfully" });
  } catch (error) {
    console.log(error.message);
    return res.json({ success: false, message: error.message });
  }
};
