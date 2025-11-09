import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    email: { type: String, required: true, unique: true, lowercase: true },
    password: { type: String, required: true },
    totalPoints: { type: Number, default: 0 },
    challengesJoined: [
      { type: mongoose.Schema.Types.ObjectId, ref: "Challenge" }
    ]
  },
  { timestamps: true }
);

export default mongoose.model("User", userSchema);
