import "dotenv/config";
import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import { connectDB } from "./db.js";
import authRoutes from "./routes/auth.js";
import challengeRoutes from "./routes/challenges.js";
import mfaRoutes from "./routes/mfa.js";
import { protect } from './middleware/authMiddleware.js';
import checkinRoutes from "./routes/checkins.js";

const app = express();

app.use(cors({
  origin: process.env.CLIENT_ORIGIN,
  credentials: true
}));
app.use(cookieParser());
app.use(express.json());

app.use("/api/auth", authRoutes);
app.use("/api/challenges", challengeRoutes);
app.use("/api/mfa", mfaRoutes);
app.use("/api/challenges", checkinRoutes);

app.get("/api/health", (req, res) => {
  res.json({ ok: true });
});

const PORT = process.env.PORT || 4000;

connectDB(process.env.MONGODB_URI)
  .then(() => app.listen(PORT, () => console.log(`API on ${PORT}`)))
  .catch(err => {
    console.error("DB connect failed", err.message);
    process.exit(1);
  });
