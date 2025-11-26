import express from "express";
import Challenge from "../models/Challenge.js";
import crypto from "crypto";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

const JOIN_CODE_REGEX = /^[A-Za-z0-9-]{7}$/;
const ALPHABET = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-";
//
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
    //const joinCode = crypto.randomBytes(3).toString("hex").toUpperCase(); // HERE Generate a random join code join_code.py
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
    res.status(201).json(challenge);

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

    res.json(challenge);
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

export default router;
