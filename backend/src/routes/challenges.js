import express from "express";
import Challenge from "../models/Challenge.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

const JOIN_CODE_REGEX = /^[A-Za-z0-9-]{7}$/;
const ALPHABET = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-";

function generateJoinCode() {
  let result = "";
  for (let i = 0; i < 7; i++) {
    const idx = Math.floor(Math.random() * ALPHABET.length);
    result += ALPHABET[idx];
  }
  return result;
}

// GET /api/challenges - get challenges where user is a participant
router.get("/", protect, async (req, res) => {
  try {
    const challenges = await Challenge.find({ participants: req.user._id })
      .populate("createdBy", "name email")
      .populate("participants", "name email");

    res.json(challenges.map(ch => {
      return {
        ...ch.toObject(),
        currentDay: computeCurrentDay(ch.startDate),
        status: computeChallengeStatus(ch.startDate, ch.endDate)
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
    let joinCode = generateJoinCode();
    while (!JOIN_CODE_REGEX.test(joinCode)) {
      joinCode = generateJoinCode();
    }

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

    const populated = await Challenge.findById(challenge._id)
      .populate("createdBy", "name email")
      .populate("participants", "name email");

    res.status(201).json({
      ...populated.toObject(),
      currentDay: computeCurrentDay(populated.startDate),
      status: computeChallengeStatus(populated.startDate, populated.endDate)
    });
  } catch (error) {
    console.error("Create challenge error:", error);
    res.status(500).json({ message: "Error creating challenge", error: error.message });
  }
});

// POST /api/challenges - join a challenge w join code
router.post("/join", protect, async (req, res) => {
  try {
    const { code } = req.body;
    const joinCode = (code || "").trim();

    // Find challenge by joinCode
    let challenge = await Challenge.findOne({ joinCode });
    if (!challenge) {
      return res.status(404).json({ message: "No challenge found with that code." });
    }

    const userId = req.user._id;

    // If user not already in participants, add them
    if (!challenge.participants.some((p) => p.equals(userId))) {
      challenge.participants.push(userId);
      await challenge.save();
    }

    // Re-fetch with population to match GET /api/challenges shape
    challenge = await Challenge.findById(challenge._id)
      .populate("createdBy", "name email")
      .populate("participants", "name email");

    res.json({
      ...challenge.toObject(),
      currentDay: computeCurrentDay(challenge.startDate),
      status: computeChallengeStatus(challenge.startDate, challenge.endDate)
    });

  } catch (error) {
    console.error("Join challenge error:", error);
    res.status(500).json({ message: "Error joining challenge", error: error.message });
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

function computeChallengeStatus(startDate, endDate) {
  const now = new Date();
  const start = new Date(startDate);
  const end = endDate ? new Date(endDate) : new Date(start.getTime() + 6*24*60*60*1000); // 7-day default

  start.setHours(0,0,0,0);
  end.setHours(23,59,59,999);
  now.setHours(0,0,0,0);

  if (now < start) return "Upcoming";
  if (now > end) return "Previous";
  return "Active";
}

export default router;
