import { useState, useEffect, useCallback } from "react";
import { ArrowLeft, Trophy, Flame, Calendar, Users } from "lucide-react";
import CheckinModal from "./CheckinModal";
import "./ChallengeDetails.css";
const DAYS = 7;
export function ChallengeDetails({ challenge, onBack, currentUserId, onStatsUpdate }) {
  const [checkIns, setCheckIns] = useState(challenge?.participant?.checkIns || []);
  const [currentDay, setCurrentDay] = useState(challenge?.participant?.currentDay || 0);
  const [currentStreak, setCurrentStreak] = useState(challenge?.participant?.currentStreak || 0);
  const [totalPoints, setTotalPoints] = useState(challenge?.participant?.totalPoints || 0);
  const [loading, setLoading] = useState(true);
  const [leaderboard, setLeaderboard] = useState([]);
  
  // MATH for the progress percentage for the progress bar 
  const progressPercentage = Math.min(100, Math.max(0, (currentDay / DAYS) * 100));
  const daysRemaining = Math.max(0, DAYS - currentDay)


  // Small local Stat helper used also in ChallengeCard
  const Stat = ({ Icon, colorClass = '', children }) => (
    <div className="row gap-sm center">
      <Icon className={`icon ${colorClass}`.trim()} />
      <span>{children}</span>
    </div>
  );

  // Fetch check ins from backend
  const fetchCheckIns = useCallback(async () => {
    try {
      const res = await fetch(
        `http://localhost:4000/api/challenges/${challenge._id}/check-ins/me`,
        { credentials: "include" }
      );
      if (!res.ok) throw new Error("Failed to load challenges");

      const data = await res.json();
      setCheckIns(data.participant.checkIns);
      setCurrentDay(data.currentDay);
      setCurrentStreak(data.participant.currentStreak);
      setTotalPoints(data.participant.totalPoints);
      onStatsUpdate({
        currentStreak: data.participant.currentStreak,
        totalPoints: data.participant.totalPoints
      });
    } catch (err) {
      console.error("Error fetching challenges:", err);
    } finally {
      setLoading(false);
    }
  }, [challenge._id]);

  // Load on first render
  useEffect(() => {
    fetchCheckIns();
  }, [fetchCheckIns]);

  useEffect(() => {
  const fetchLeaderboard = async () => {
    try {
      const res = await fetch(
        `http://localhost:4000/api/challenges/${challenge._id}/leaderboard`,
        { credentials: "include" }
      );
      if (res.ok) {
        const data = await res.json();
        setLeaderboard(data);
      }
    } catch (err) {
      console.error("Error fetching leaderboard:", err);
    }
  };

  fetchLeaderboard();
}, [challenge._id]);

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

        <span className={`badge badge-${(challenge?.status || "Upcoming").toLowerCase()}`} >
          {challenge?.status || "Loading..."}
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

      {loading ? (<p style={{ textAlign: "center" }}>Loading...</p>) : ( 
        <>
          <CheckinModal
            challenge={challenge}
            currentDay={currentDay}
            checkIns={checkIns}
            onComplete={fetchCheckIns}
          />

          {/*show progress bar */}
          <div className="progress-card">
            <div className="progress-block">
              <div className="row space-between small muted">
                <span>Challenge Progress</span>
                <span>Day {currentDay}/{DAYS}</span>
              </div>
              <div className="progress">
                <div className="progress-inner" style={{ width: `${progressPercentage}%` }} />
              </div>
              <span>{daysRemaining} day{daysRemaining === 1 ? '' : 's'} remaining</span>
            </div>
          </div>

          
          {/* TEMP TO VIEW VALUES */}

          <div className="progress-card">
            <div className="row space-betw">
                <span>Your Progress</span>
            </div>
          <div className="progress-container">
            
            <div className="progress-item">
              <Flame className="icon-flame" />
              <div>
                <span className="progress-number">{currentStreak}</span>
                <div className="progress-label">Day Streak</div>
              </div>
            </div>

            <div className="progress-item">
              <Trophy className="icon-trophy" />
              <div>
                <span className="progress-number">{totalPoints}</span>
                <div className="progress-label">Points</div>
              </div>
            </div>
          </div>
        </div>

        {/* Weekly Check-ins */}
        <div className="details-card" style={{ padding: '24px', background: 'white', borderRadius: '12px', marginBottom: '20px' }}>
          <h3 className="section-title">Daily Check-ins</h3>
            <div className="checkin-grid">
            {[1, 2, 3, 4, 5, 6, 7].map((day) => {
            const checkIn = checkIns.find(c => c.day === day);
            const isCompleted = checkIn?.completed;
            // Past day that was not completed
            const isMissed = day < currentDay && !isCompleted;
            // Future day
            const isFuture = day > currentDay;
            // Current day
            const isCurrent = day === currentDay;
      
            return (
              <div key={day} className={`checkin-box ${isCompleted ? 'success' : isMissed ? 'missed' : 'pending'} ${isCurrent ? 'current' : ''}`}>
                <span>Day {day}</span>
                {isCompleted && <div className="checkin-icon success">✓</div>}
                {isMissed && <div className="checkin-icon missed">✕</div>}
                {isFuture && <div className="checkin-icon pending"></div>}
              </div>
            );
          })}
        </div>
      </div>

      {/* Challenge Leaderboard */}
      <div className="leaderboard-card">
        <h3 className="section-title">Leaderboard</h3>
          <div className="leaderboard-container">
            {leaderboard.map((participant, index) => (
              <div key={participant.user._id} className="leaderboard-row">
                <div className="leaderboard-left">
                  <div className="leaderboard-trophy">
                    {index < 3 ? (
                      <Trophy className={`leaderboard-trophy-icon ${index === 0 ? 'gold' : 'silver'}`} />
                    ) : (
                      `#${index + 1}`
                    )}
                  </div>
                  <div className="leaderboard-user">
                    <div className="leaderboard-avatar">👤</div>
                      <div className="leaderboard-info">
                        <div className="leaderboard-name">
                          {participant.user._id === currentUserId ? 'You' : participant.user.name}
                        </div>
                        <div className="leaderboard-stats">
                          <span>
                            <Flame className="leaderboard-stats-icon" />
                              {participant.currentStreak} streak
                          </span>
                        </div>
                      </div>
                  </div>
                </div>
                <div className="leaderboard-points">{participant.totalPoints} pts</div>
              </div>
            ))}
        </div>
      </div>
        </>
      )}
    </div>
  );
}

export default ChallengeDetails;