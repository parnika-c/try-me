import express from "express";
import Challenge from "../models/Challenge.js";
import Checkin from "../models/Checkin.js";
import User from "../models/User.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();
const DAYS_IN_CHALLENGE = 7;

// GET /api/challenges/:challengeId/check-ins - get single challenge with participant check-ins
router.get("/:challengeId/check-ins/me", protect, async (req, res) => {
  try {
    const challenge = await Challenge.findOne({
      _id: req.params.challengeId,
      participants: req.user._id,
    });

    if (!challenge) return res.status(404).json({ message: "Challenge not found" });

    const summary = await buildParticipantSummary(challenge, req.user._id);
    res.json(summary);
  } catch (err) {
    console.error("Check-in fetch error:", err);
    res.status(500).json({ message: "Failed to load check-ins" });
  }
});

// GET /api/challenges/:challengeId/leaderboard - get leaderboard for all participants
router.get("/:challengeId/leaderboard", protect, async (req, res) => {
  try {
    const challenge = await Challenge.findOne({
      _id: req.params.challengeId,
      participants: req.user._id,
    }).populate('participants', 'firstName lastName');

    if (!challenge) return res.status(404).json({ message: "Challenge not found" });

    const currentDay = computeCurrentDay(challenge.startDate);

    // get all check-ins for this challenge
    const allCheckIns = await Checkin.find({ challengeId: challenge._id });

    // build leaderboard for each participant
    const leaderboard = await Promise.all(
      challenge.participants.map(async (user) => {
        const userCheckIns = allCheckIns.filter(
          c => c.userId.toString() === user._id.toString()
        );

        const checkInsByDay = [];
        for (let day = 1; day <= DAYS_IN_CHALLENGE; day++) {
          const c = userCheckIns.find(c => {
            return dayFromDate(c.date, challenge.startDate) === day;
          });

          checkInsByDay.push({
            day,
            completed: !!c,
            value: c?.value || "",
            pointsEarned: c?.pointsEarned || 0,
          });
        }

        const currentStreak = computeStreak(checkInsByDay, currentDay);
        const totalPoints = userCheckIns.reduce((sum, c) => sum + (c.pointsEarned || 0), 0);
        const completedCheckIns = checkInsByDay.filter(c => c.completed).length;

        return {
          user: {
            _id: user._id,
            name: `${user.firstName} ${user.lastName}`,
          },
          totalPoints,
          currentStreak,
          completedCheckIns,
        };
      })
    );

    // sort by points descending
    leaderboard.sort((a, b) => b.totalPoints - a.totalPoints);

    res.json(leaderboard);
  } catch (err) {
    console.error("Leaderboard fetch error:", err);
    res.status(500).json({ message: "Failed to load leaderboard" });
  }
});

// POST /api/challenges/:challengeId/check-ins - record a check-in for a specific day
router.post("/:challengeId/check-ins", protect, async (req, res) => {
  try {
    const challenge = await Challenge.findOne({
      _id: req.params.challengeId,
      participants: req.user._id,
    });

    if (!challenge) return res.status(404).json({ message: "Challenge not found" });

    const day = Number(req.body.day);
    if (!Number.isInteger(day) || day < 1 || day > DAYS_IN_CHALLENGE) return res.status(400).json({ message: "Day must be 1–7" });

    const currentDay = computeCurrentDay(challenge.startDate);
    if (day > currentDay) return res.status(400).json({ message: "Cannot check in for a future day" });

    const value = (req.body.value || "").trim();
    if (challenge.type === "value" && !value) return res.status(400).json({ message: "Value is required" });

    // convert day to date
    const date = new Date(challenge.startDate);
    date.setDate(date.getDate() + (day - 1));
    date.setHours(12, 0, 0, 0);

    await Checkin.findOneAndUpdate(
      {
        challengeId: challenge._id,
        userId: req.user._id,
        date,
      },
      {
        challengeId: challenge._id,
        userId: req.user._id,
        date,
        value: value || "Completed",
        pointsEarned: req.body.pointsEarned,
      },
      { upsert: true, new: true }
    );

    // Update user's totalPoints by summing all pointsEarned from their checkins
    const totalPointsResult = await Checkin.aggregate([
      { $match: { userId: req.user._id } },
      { $group: { _id: null, total: { $sum: "$pointsEarned" } } }
    ]);
    const totalPoints = totalPointsResult[0]?.total || 0;
    await User.findByIdAndUpdate(req.user._id, { totalPoints });

    const summary = await buildParticipantSummary(challenge, req.user._id);
    res.json(summary);
  } catch (err) {
    console.error("Check-in create error:", err);
    res.status(500).json({ message: "Failed to record check-in" });
  }
});

async function buildParticipantSummary(challenge, userId) {
  const currentDay = computeCurrentDay(challenge.startDate);
  const checkins = await Checkin.find({challengeId: challenge._id, userId,});

  const checkInsByDay = [];
  for (let day = 1; day <= DAYS_IN_CHALLENGE; day++) {
    const c = checkins.find(c => {
      return dayFromDate(c.date, challenge.startDate) === day; // find checkin matching this day
    });

    checkInsByDay.push({
      day,
      completed: !!c,
      value: c?.value || "",
      pointsEarned: c?.pointsEarned || 0,
    });
  }

  const currentStreak = computeStreak(checkInsByDay, currentDay);

  return {
    challengeId: challenge._id,
    currentDay,
    participant: {
      userId: userId.toString(),
      currentStreak,
      totalPoints: checkins.reduce((sum, c) => sum + (c.pointsEarned || 0), 0),
      checkIns: checkInsByDay,
    },
  };
}

function computeCurrentDay(startDate) {
  const start = new Date(startDate);
  const today = new Date();

  start.setHours(0,0,0,0);
  today.setHours(0,0,0,0);

  if (today < start) return 0;
  const diff = Math.floor((today - start) / 86400000) + 1;
  return Math.min(Math.max(diff, 0), DAYS_IN_CHALLENGE);
}

function dayFromDate(date, startDate) {
  const d = new Date(date);
  const s = new Date(startDate);

  d.setHours(0,0,0,0);
  s.setHours(0,0,0,0);

  return Math.floor((d - s) / 86400000) + 1;
}

function computeStreak(checkIns, currentDay) {
  //if currentDay does not have checkin, use currentDay - 1
  let startDay = currentDay;
  const todayCheckIn = checkIns.find(c => c.day === currentDay); // check if current day is checked in
  if (!todayCheckIn?.completed) {
    startDay = currentDay - 1; // start streak calc from previous day
  }
  if (startDay < 1) return 0;
 // compute current streak up to currentDay 
  let streak = 0;
  for (let day = startDay; day >= 1; day--) {
    const entry = checkIns.find(c => c.day === day);
    if (!entry?.completed) break;
    streak++;
  }
  return streak;
}

export default router;
