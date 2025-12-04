import { Router } from "express";
import jwt from "jsonwebtoken";
import User from "../models/User.js";

const router = Router();

export const protect = async (req, res, next) => {
  try {
    // For tests: Bypass auth for load testing
    if (process.env.NODE_ENV === 'test' && req.headers['x-test-mode'] === 'true') {
      req.user = await User.findOne({ email: 'testuser1@example.com' }).select("-password");
      if (!req.user) return res.status(404).json({ message: "Test user not found" });
      return next();
    }
    let token = null;
    if (req.cookies?.token) { // get token from cookies
      token = req.cookies.token;
    } else if (req.headers.authorization?.startsWith("Bearer ")) { // get token from header
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

export default router;
