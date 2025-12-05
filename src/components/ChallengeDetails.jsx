import { useState, useEffect, useCallback } from "react";
import { ArrowLeft, Trophy, Flame, Calendar, Users, Medal } from "lucide-react";
import { renderRankIcon } from '../components/LeaderboardLogic.jsx';
import '../pages/Leaderboard.css';
import {
  Avatar,
  AvatarImage,
  AvatarFallback,
  getAvatarProps //imported from '../components/LeaderboardLogic.jsx
} from '../components/LeaderboardLogic.jsx';



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
  const Stat = ({ Icon, colorClass = '', children }) => (
    <div className="row gap-sm center">
      <Icon className={`icon ${colorClass}`.trim()} />
      <span>{children}</span>
    </div>
  );

  useEffect(() => {
    if (challenge?.participant) {
      setCheckIns(challenge.participant.checkIns || []);
      setCurrentDay(challenge.participant.currentDay || 0);
      setCurrentStreak(challenge.participant.currentStreak || 0);
      setTotalPoints(challenge.participant.totalPoints || 0);
    }
  }, [challenge.participant]);
  

  // Fetch leaderboard
  const fetchLeaderboard = useCallback(async () => {
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
  }, [challenge._id]);

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
      fetchLeaderboard();
    } catch (err) {
      console.error("Error fetching challenges:", err);
    } finally {
      setLoading(false);
    }
  }, [challenge._id]);

  const getDayState = (day, checkIn, currentDay, challengeStatus) => ({
    // Past day that as completed
    isCompleted: checkIn?.completed,
    // Past day that was not completed
    isMissed: !checkIn?.completed && (day < currentDay || (challengeStatus === "Previous" && day <= 7)),
    // Future day
    isFuture: day > currentDay && challengeStatus !== "Previous",
    // Current day
    isCurrent: day === currentDay && challengeStatus === "Active"
  });

  // Load on first render
  useEffect(() => {
    fetchCheckIns();
    fetchLeaderboard();
}, [fetchCheckIns, fetchLeaderboard]);

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
        <div className="details-content">
          <CheckinModal
            challenge={challenge}
            currentDay={currentDay}
            checkIns={checkIns}
            onComplete={fetchCheckIns}
            disabled={challenge.status === "Previous"}
          />

          <div className="details-card">
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

              {/* Progress bar */}
              <div className="progress-block">
                <div className="row space-between small muted">
                  <span>Day {currentDay}/{DAYS}&nbsp;&nbsp; | &nbsp;&nbsp;{daysRemaining} day{daysRemaining === 1 ? '' : 's'} remaining</span>
                </div>
                <div className="progress">
                  <div className="progress-inner" style={{ width: `${progressPercentage}%` }} />
                </div>
              </div>
            </div>
          </div>

          {/* Weekly Check-ins */}
          <div className="details-card">
            <div className="row space-betw">
                  <span>Daily Check-ins</span>
            </div>
            <div className="checkin-grid">
              {[1, 2, 3, 4, 5, 6, 7].map((day) => {
                const checkIn = checkIns.find(c => c.day === day);
                const { isCompleted, isMissed, isFuture, isCurrent } = getDayState(day, checkIn, currentDay, challenge.status);
        
                return (
                  <div key={day} className={`checkin-box ${isCompleted ? 'success' : ''} ${isMissed ? 'missed' : ''} ${isFuture ? 'pending' : ''} ${isCurrent ? 'current' : ''}`}>
                    <span>Day {day}</span>
                    {isCompleted && <div className="checkin-icon success">✓</div>}
                    {isMissed && <div className="checkin-icon missed">✕</div>}
                    {isFuture && <div></div>}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Challenge Leaderboard */}
          <div className="leaderboard-card">
            <div className="row space-betw">
                    <span>Leaderboard</span>
            </div>
            <div className="leaderboard-container">
              {leaderboard.map((participant, index) => {
                // get avatar props
                const { id, displayName, avatar } = getAvatarProps(participant.user);
                  const avatarSrc = avatar;
                  const fallbackChar = (participant.user.name || 'U')[0].toUpperCase();
                return (
              
                <div key={participant.user._id} className="leaderboard-row">
                  <div className="leaderboard-left">
                    <div className={`leaderboard-trophy ${index >= 3 ? 'small-rank' : ''}`}>
                        {index < 3 ? (
                          renderRankIcon(['trophy', 'medal', 'award'][index])
                        ) : (
                          `#${index + 1}`
                        )}
                      </div>

                    <div className="leaderboard-user">
                      <Avatar className="ranking-avatar">
                          <AvatarImage src={avatarSrc} alt={displayName} />
                          <AvatarFallback>{fallbackChar}</AvatarFallback>
                        </Avatar>
                        <div className="leaderboard-info">
                          <div className="leaderboard-name">
                            {participant.user._id === currentUserId ? 'You' : participant.user.name}
                          </div>
                      </div>
                    </div>
                  </div>
                  <div className="leaderboard-points">{participant.totalPoints} pts</div>
                </div>
              );
              })}
          </div>
        </div>
    </div>
    )}
    </div>
  );
}

export default ChallengeDetails;