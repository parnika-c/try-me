import { ArrowLeft, Trophy, Calendar, Users } from "lucide-react";
import "./ChallengeDetails.css";

export function ChallengeDetails({ challenge, onBack }) {
  return (
    <div className="challenge-details">
      <button className="back-btn" onClick={onBack}>
        <ArrowLeft className="icon" /> Back
      </button>

      <div className="details-header">
        <div>
          <h1 className="details-title">{challenge.name}</h1>
          <p className="details-desc">{challenge.description}</p>
        </div>

        <span
          className={`badge ${
            challenge.isActive ? "badge-active" : "badge-secondary"
          }`}
        >
          {challenge.isActive ? "Active" : "Upcoming"}
        </span>
      </div>

      <div className="meta-row">
        <div className="meta-item">
          <Users className="icon" />
          <span>{challenge.participants.length} participants</span>
        </div>

        <div className="meta-item">
          <Calendar className="icon" />
          <span>
            {new Date(challenge.startDate).toLocaleDateString()} -{" "}
            {new Date(challenge.endDate).toLocaleDateString()}
          </span>
        </div>

        {challenge.type === "value" && (
          <div className="meta-item">
            <Trophy className="icon" />
            Goal: {challenge.dailyGoal} {challenge.unit}/day
          </div>
        )}
      </div>
    </div>
  );
}
