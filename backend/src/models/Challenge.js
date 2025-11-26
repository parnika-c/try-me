import mongoose from "mongoose";

const challengeSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  description: { type: String, default: "" },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  joinCode: { type: String, required: true, unique: true },
  participants: [
    { type: mongoose.Schema.Types.ObjectId, ref: "User" }
  ],

  type: { type: String, enum: ["task", "value"], required: true },
  // only for value-based challenges
  dailyGoal: { type: Number, required: function () { return this.type === "value"; }},
  unit: { type: String, required: function () { return this.type === "value"; }}, 
  
  startDate: { type: Date, required: true },
  endDate: { type: Date, required: true},
}, { timestamps: true });

// Set endDate = 7 days after startDate
challengeSchema.pre("validate", function(next) {
  if (!this.endDate && this.startDate) {
    const end = new Date(this.startDate);
    end.setDate(end.getDate() + 7);
    this.endDate = end;
  }
  next();
});

export default mongoose.model("Challenge", challengeSchema);
