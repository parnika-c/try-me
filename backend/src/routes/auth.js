import { Router } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import speakeasy from "speakeasy";
import User from "../models/User.js";

const router = Router();

// register
router.post("/register", async (req, res) => {
  try {
    const { firstName, lastName, email, password } = req.body;

    if (!firstName || !lastName || !email || !password) {
      return res.status(400).json({ message: "All fields required" });
    }

    const exists = await User.findOne({ email });
    if (exists) return res.status(409).json({ message: "This email is already in use" });

    const hash = await bcrypt.hash(password, 12);
    const user = await User.create({ firstName, lastName, email, password: hash });

    return res.status(201).json({ id: user._id, email: user.email });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Server error" });
  }
});

function createAuthToken(user) {
  // include 'sub' claim with user id so auth middleware can read it
  return jwt.sign({ sub: String(user._id), email: user.email }, process.env.JWT_SECRET, { expiresIn: "7d" });
}
// login
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) return res.status(401).json({ message: "Invalid credentials" });

    const ok = await bcrypt.compare(password, user.password);
    if (!ok) return res.status(401).json({ message: "Invalid credentials" });

    // If user has MFA enabled, require a TOTP token
    if (user.mfaEnabled) {
      const { token } = req.body;
      if (!token) {
        return res.status(200).json({ mfaRequired: true });
      }

      const tokenValid = speakeasy.totp.verify({
        secret: user.mfaSecret, // note: field in User model is `mfaSecret`
        encoding: "base32",
        token,
        window: 1,
      });

      if (!tokenValid) return res.status(401).json({ message: "Invalid MFA token" });
    }

    // everything ok -> create auth token
    const authToken = createAuthToken(user);
    res.cookie("token", authToken, {
      httpOnly: true,
      sameSite: "lax",
      secure: false, // set true in production on https
    });

    return res.json({
      id: user._id,
      email: user.email,
      firstName: user.firstName,
      mfaEnabled: !!user.mfaEnabled, // !! converts to boolean
      token: authToken,
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Server error" });
  }
});

// logout
router.post("/logout", (_req, res) => {
  res.clearCookie("token");
  return res.json({ ok: true });
});

export default router;
