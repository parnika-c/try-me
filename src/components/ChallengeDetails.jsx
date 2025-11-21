import { ArrowLeft, Trophy, Calendar, Users } from "lucide-react";
import "./ChallengeDetails.css";

export function ChallengeDetails({ challenge, onBack }) {
  console.log("Challenge object:", challenge);

  const checkins = challenge.checkins || [];
  const leaderboard = challenge.leaderboard || [];
  
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

      <div className="progress-overall">
        <div className="details-card user-progress-card">
          <h3 className="section-title">Your Progress</h3>
          <div className="progress-combined-row">
            <div className="user-mini-block">
              <p className="progress-stat">🔥 {challenge.userStreak || 0}</p>
              <p className="muted small">Day Streak</p>
            </div>

            <div className="user-mini-block">
              <p className="progress-stat">🏆 {challenge.userPoints || 0}</p>
              <p className="muted small">Points</p>
            </div>

            <div className="mini-progressbar">
              <p className="muted small flex space-between">
                <span>Progress</span>
                <span>
                  Day {challenge.currentDay || 0}/{challenge.totalDays || 0}
                </span>
              </p>

              <div className="progress progress-small">
                <div
                  className="progress-inner"
                  style={{
                    width: `${
                      challenge.totalDays 
                        ? (challenge.currentDay / challenge.totalDays) * 100 
                        : 0
                    }%`,
                  }}
                ></div>
              </div>
            </div>
          </div>
        </div>

        {checkins.length > 0 && (
          <div className="details-card">
            <div className="checkin-grid">
              {checkins.map((day, i) => (
                <div key={i} className={`checkin-box ${day.status}`}>
                  <span>Day {i + 1}</span>
                  {day.icon}
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="leaderboard-card">
          <h3 className="section-title">Leaderboard</h3>
          {leaderboard.length > 0 ? (
            leaderboard.map((entry, i) => (
              <div key={i} className="leaderboard-row">
                <div className="leaderboard-left">
                  <span className="rank">#{i + 1}</span>
                  <span className="name">{entry.name}</span>
                </div>
                <span className="points">{entry.points} pts</span>
              </div>
            ))
          ) : (
            <p className="muted">No participants yet</p>
          )}
        </div>
      </div>
    </div>
  );
}