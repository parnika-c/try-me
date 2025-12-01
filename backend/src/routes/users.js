import { Router } from "express";
import User from "../models/User.js";

const router = Router();

// GET /api/users - get all users for leaderboard
router.get("/", async (req, res) => {
  try {
    const users = await User.find({}, 'firstName lastName totalPoints').lean();
    res.json(users);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Server error" });
  }
});

export default router;