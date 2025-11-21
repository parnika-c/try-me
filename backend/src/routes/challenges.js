import express from "express";
import Challenge from "../models/Challenge.js";
import crypto from "crypto";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

// GET /api/challenges - get challenges where user is a participant
router.get("/", protect, async (req, res) => {
  try {
    const challenges = await Challenge.find({ participants: req.user._id })
      .populate("createdBy", "name email")
      .populate("participants", "name email");

    res.json(challenges.map(ch => {
      const now = new Date();
      const start = new Date(ch.startDate);
      const end = new Date(ch.endDate);

      let status = "Active";
      if (now < start) status = "Upcoming";
      else if (now > end) status = "Previous";

      return {
        ...ch.toObject(),
        currentDay: computeCurrentDay(ch.startDate),
        status: status
      };
    }));
  } catch (error) {
    console.error("Error fetching challenges:", error);
    res.status(500).json({ message: "Failed to load challenges", error: error.message });
  }
});

// POST /api/challenges - create new challenge
router.post("/", protect, async (req, res) => {
  try {
    const {
      name,
      description,
      type,
      dailyGoal,
      unit,
      startDate
    } = req.body;
    
    if (type === "value" && (!dailyGoal || !unit)) {
      return res.status(400).json({ message: "Value-based challenges require a dailyGoal and unit." });
    }
    if (type === "task" && (dailyGoal || unit)) {
      return res.status(400).json({ message: "Task-based challenges should not include dailyGoal or unit." });
    }

    const createdBy = req.user._id; // from JWT, protect middleware
    const joinCode = crypto.randomBytes(3).toString("hex").toUpperCase(); // Generate a random join code TODO join_code.py

    const challenge = new Challenge({
      name,
      description,
      type,
      dailyGoal: type === "value" ? dailyGoal : undefined,
      unit: type === "value" ? unit : undefined,
      startDate,
      createdBy,
      joinCode,
      participants: [createdBy]
    });

    await challenge.save();
    res.status(201).json(challenge);

  } catch (error) {
    console.error("Create challenge error:", error);
    res.status(500).json({ message: "Error creating challenge", error: error.message });
  }
});

function computeCurrentDay(startDate) {
  const start = new Date(startDate);
  const today = new Date();
  start.setHours(0,0,0,0);
  today.setHours(0,0,0,0);

  if (today < start) return 0;
  const diff = Math.floor((today - start) / 86400000) + 1;
  return Math.min(Math.max(diff, 0), 7);
}

export default router;
