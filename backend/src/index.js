import "dotenv/config";
import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import { connectDB } from "./db.js";
import authRoutes from "./routes/auth.js";

const app = express();

app.use(cors({
  origin: process.env.CLIENT_ORIGIN,
  credentials: true
}));
app.use(cookieParser());
app.use(express.json());

// Connect your auth routes (this is the missing piece!)
app.use("/api/auth", authRoutes);

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
