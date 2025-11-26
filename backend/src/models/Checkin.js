import mongoose from "mongoose";

const checkinSchema = new mongoose.Schema({
  challengeId: { type: mongoose.Schema.Types.ObjectId, ref: "Challenge", required: true },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  date: { type: Date, required: true },
  value: { type: String, default: "" }, // daily metric or status, convert to num if needed???
  pointsEarned: { type: Number, default: 0 }, // 1 per day?
  streakCount: { type: Number, default: 0 },
}, { timestamps: true });

export default mongoose.model("Checkin", checkinSchema);
