import express from "express";
import Challenge from "../models/Challenge.js";
import crypto from "crypto";

const router = express.Router();

// POST /api/challenges - create new challenge
router.post("/", async (req, res) => {
  try {
    const {
      name,
      description,
      type,
      dailyGoal,
      unit,
      startDate,
      createdBy
    } = req.body;
    
    if (type === "value" && (!dailyGoal || !unit)) {
      return res.status(400).json({ message: "Value-based challenges require a dailyGoal and unit." });
    }
    if (type === "task" && (dailyGoal || unit)) {
      return res.status(400).json({ message: "Task-based challenges should not include dailyGoal or unit." });
    }

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

export default router;
