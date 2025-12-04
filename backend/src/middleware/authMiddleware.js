import jwt from "jsonwebtoken";
import User from "../models/User.js";

export const protect = async (req, res, next) => {
  try {
    // For tests: Bypass auth for load testing
    if (process.env.NODE_ENV === 'test' && req.headers['x-test-mode'] === 'true') {
      req.user = await User.findOne({ email: 'testuser1@example.com' }).select("-password");
      if (!req.user) return res.status(404).json({ message: "Test user not found" });
      return next();
    }
    let token = null;
    if (req.cookies?.token) {
      token = req.cookies.token;
    } else if (req.headers.authorization?.startsWith("Bearer ")) {
      token = req.headers.authorization.split(" ")[1];
    }
    if (!token) return res.status(401).json({ message: "Not authorized, no token" });

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = await User.findById(decoded.sub).select("-password");
    if (!req.user) return res.status(404).json({ message: "User not found" });

    next();
  } catch (error) {
    console.error("Auth error:", error);
    return res.status(401).json({ message: "Not authorized" });
  }
};
