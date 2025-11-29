import express from "express";
import User from "../models/User.js";

const router = express.Router();

router.get("/mfa-secret", async (req, res) => {
  if (process.env.NODE_ENV !== "test")
    return res.status(403).json({ error: "Not allowed" });

  const user = await User.findOne({ email: req.query.email });
  if (!user) return res.status(404).json({ error: "User not found" });

  console.log("Test endpoint user:", user);
  console.log("MFA Secret:", user.mfaSecret);

  res.json({ mfaSecret: user.mfaSecret });
});

export default router;
