//The goal of this component is to make a readable card for the user w/ all their existing/upcoming challenges 
import { Calendar, Users, Trophy, Flame, Copy } from 'lucide-react'
import './ChallengeCard.css'

import { useState, useEffect, useCallback } from 'react';
import {
  Avatar,
  AvatarImage,
  AvatarFallback,
  getAvatarProps, 
  fetchUsers
} from '../components/LeaderboardLogic.jsx';

// Challenges are always 7 days long
const DAYS = 7

// Stat Component which includes the icon + the text 
const Stat = ({ Icon, colorClass = '', children }) => (
  <div className="row gap-sm center">
    <Icon className={`icon ${colorClass}`.trim()} />
    <span>{children}</span>
  </div>
)

/**
 * @typedef {Object} ChallengeParticipant
 * @property {string} userId
 * @property {{ name: string, avatar?: string }} user
 * @property {number} [currentStreak]
 * @property {number} [totalPoints]
 */

/**
 * @typedef {Object} Challenge
 * @property {string} name
 * @property {string} description
 * @property {number} currentDay
 * @property {ChallengeParticipant[]} participants
 * @property {string|number|Date} [startDate]
 * @property {string} [joinCode]
 */

export function ChallengeCard({ challenge, onClick, userStats  }) {
  const { name, description, currentDay = 0, participants: list = [], startDate, joinCode  } = challenge
  //console.log('ChallengeCard sample participant:', list[0]);
  const [users, setUsers] = useState([]);
  const [loadingUsers, setLoadingUsers] = useState(true);

  const fetchAllUsers = useCallback(async () => {
    try {
      const data = await fetchUsers();
      setUsers(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Error fetching users for avatars:", err);
    } finally {
      setLoadingUsers(false);
    }
  }, []);

  useEffect(() => {
    fetchAllUsers();
  }, [fetchAllUsers]);


  // derives values
  const participants = list || [];
  const participantCount = participants.length;
  const visibleParticipants = participants.slice(0, 5);

  const handleCopyJoinCode = (e) => {
    e.stopPropagation(); // don’t trigger card click
    if (!joinCode) return;
    navigator.clipboard
      ?.writeText(joinCode)
      .catch((err) => console.error('Failed to copy join code', err));
  };

  // MATH for the progress percentage for the progress bar 
  const progressPercentage = Math.min(100, Math.max(0, (currentDay / DAYS) * 100))
  const daysRemaining = Math.max(0, DAYS - currentDay)

  // show their streak + points
  const streak = userStats?.currentStreak ?? 0;
  const points = userStats?.totalPoints ?? 0;

  // get status and create meta text
  const status = (challenge?.status || "Upcoming");
  const metaText =
    status === "Upcoming" ? `Starts ${new Date(startDate).toLocaleDateString()}` :
    status === "Active" ? `${daysRemaining} day${daysRemaining === 1 ? '' : 's'} remaining` :
    status === "Previous" ? `Completed on ${new Date(challenge.endDate).toLocaleDateString()}` :
    null;

  return (
    <div className="challenge-card" role="button" onClick={onClick}>
      <div className="card-header">
        <div className="title-row">
          {/* Badge for active vs upcoming */}
          <h3 className="card-title">{name}</h3>
          <span className={`badge badge-${(status || "Upcoming").toLowerCase()}`} >
            {status}
          </span>
        </div>
        <p className="card-description">{description}</p>
      </div>

      <div className="card-content">
        {/* Progress section for active challenges! */}
        {status === "Active" && (
          <>
            <div className="progress-block">
              <div className="row space-between small muted">
                <span>Progress</span>
                <span>Day {currentDay}/{DAYS}</span>
              </div>
              <div className="progress">
                <div className="progress-inner" style={{ width: `${progressPercentage}%` }} />
              </div>
            </div>

            {/* Personal progress for  that challenge */}
            <div className="row gap-sm center mt">
              <Stat Icon={Flame} colorClass="icon-orange">
                {streak + " streak"}
              </Stat>

              <Stat Icon={Trophy} colorClass="icon-yellow">
                {points + " pts"}
              </Stat>
            </div>

          </>
        )}

        {/* Calendar + join code row */}
        {(metaText || joinCode) && (
          <div className="row space-between center">
            {metaText && (
              <div className="row gap-sm small muted">
                <Calendar className="icon" />
                <span>{metaText}</span>
              </div>
            )}

            {joinCode && (
              <button
                type="button"
                className="join-code small muted"
                onClick={handleCopyJoinCode}
              >
                Code: <span className="join-code-value">{joinCode}</span>
              </button>
            )}
          </div>
        )}

        {/* Participants Row */}
        <div className="row space-between center">
          {/* Number of particpants*/}
          <div className="row gap-sm center muted">
            <Users className="icon" />
            <span className="small">{participantCount} participants</span>
          </div>

          {/* Show first 5 participants */}
          <div className="avatar-stack">
            {visibleParticipants.map((participant, index) => {
              if (!participant) return null;
              const participantId = participant.userId || participant._id || participant.id;

              const matchedUser = users.find(u => u.id === participantId);

              const source = matchedUser || participant;
              const { avatar, fallbackChar, displayName } = getAvatarProps(source);
              const avatarSrc = avatar;

              return (
                <Avatar
                  key={participantId || index}
                  className="card-avatar"
                >
                  <AvatarImage src={avatarSrc} alt={displayName} />
                  <AvatarFallback>{fallbackChar}</AvatarFallback>
                </Avatar>
              );
            })}
            
            {participantCount > 5 && (
              <div className="avatar more">+{participantCount - 5}</div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default ChallengeCard;
