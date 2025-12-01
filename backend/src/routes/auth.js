import { Router } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import speakeasy from "speakeasy";
import crypto from "crypto";
import User from "../models/User.js";
import { protect } from "../middleware/authMiddleware.js";

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

// get current user (protected)
router.get("/me", protect, async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select("firstName lastName email totalPoints mfaEnabled");
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    return res.json({
      id: user._id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      mfaEnabled: !!user.mfaEnabled,
      totalPoints: user.totalPoints,
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Server error" });
  }
});

// forgot password - request password reset
router.post("/forgot-password", async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ message: "Email is required" });
    }

    const user = await User.findOne({ email: email.toLowerCase() });
    
    // For security, always return success even if user doesn't exist
    if (!user) {
      return res.status(200).json({ 
        message: "If an account exists with that email, a password reset link has been sent." 
      });
    }

    // Generate reset token
    const resetToken = crypto.randomBytes(32).toString('hex');
    const resetTokenExpiry = Date.now() + 3600000; // 1 hour from now

    // Save reset token to user
    user.resetPasswordToken = resetToken;
    user.resetPasswordExpires = new Date(resetTokenExpiry);
    await user.save();

    // In development, return the token for testing
    console.log(`Password reset token for ${email}: ${resetToken}`);
    
    return res.status(200).json({ 
      message: "If an account exists with that email, a password reset link has been sent.",
      // Only include token in development
      ...(process.env.NODE_ENV !== 'production' && { resetToken })
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Server error" });
  }
});

// reset password - actually change the password
router.post("/reset-password", async (req, res) => {
  try {
    const { token, password } = req.body;

    if (!token || !password) {
      return res.status(400).json({ message: "Token and password are required" });
    }

    // Validate password strength - same as registration
    if (password.length < 10) {
      return res.status(400).json({ message: "Password must be at least 10 characters" });
    }
    if (!/[A-Z]/.test(password)) {
      return res.status(400).json({ message: "Password must contain at least one uppercase letter" });
    }
    if (!/[a-z]/.test(password)) {
      return res.status(400).json({ message: "Password must contain at least one lowercase letter" });
    }
    if (!/\d/.test(password)) {
      return res.status(400).json({ message: "Password must contain at least one number" });
    }
    if (!/[@$!%*?&]/.test(password)) {
      return res.status(400).json({ message: "Password must contain at least one special character (@$!%*?&)" });
    }

    // Find user with valid reset token
    const user = await User.findOne({
      resetPasswordToken: token,
      resetPasswordExpires: { $gt: Date.now() } // Token not expired
    });

    if (!user) {
      return res.status(400).json({ 
        message: "Invalid or expired reset token" 
      });
    }

    // Hash new password
    const hash = await bcrypt.hash(password, 12);

    // Update user password and clear reset token
    user.password = hash;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    await user.save();

    return res.status(200).json({ 
      message: "Password has been reset successfully" 
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Server error" });
  }
});

export default router;
