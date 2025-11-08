//The goal of this component is to make a readable card for the user w/ all their existing/upcoming challenges 
import { Calendar, Users, Trophy, Flame } from 'lucide-react'
import './ChallengeCard.css'

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
 * @property {boolean} isActive
 * @property {number} currentDay
 * @property {ChallengeParticipant[]} participants
 * @property {string|number|Date} [startDate]
 */

export function ChallengeCard({ challenge, onClick }) {
  const { name, description, isActive: active, currentDay = 0, participants: list = [], startDate } = challenge

  // derives values
  const isActive = !!active
  const participants = list
  const participantCount = participants.length
  const visibleParticipants = participants.slice(0, 5)

  // MATH for the progress percentage for the progress bar 
  const progressPercentage = Math.min(100, Math.max(0, (currentDay / DAYS) * 100))
  const daysRemaining = Math.max(0, DAYS - currentDay)

  // show their streak + points
  const currentUserParticipant = participants.find((p) => p.userId === 'user-1')

  // if not active, should start date, else days remaining
  const metaText = !isActive && startDate
    ? `Starts ${new Date(startDate).toLocaleDateString()}`
    : isActive && daysRemaining > 0
      ? `${daysRemaining} days remaining`
      : null

  return (
    <div className="challenge-card" role="button" onClick={onClick}>
      <div className="card-header">
        <div className="title-row">


           {/* Badge for active vs upcoming */}
          <h3 className="card-title">{name}</h3>
          {isActive ? (
            <span className="badge badge-active">Active</span>
          ) : (
            <span className="badge badge-secondary">Upcoming</span>
          )}
        </div>
        <p className="card-description">{description}</p>
      </div>

      <div className="card-content">
        {/* Progress section for active challenges! */}
        {isActive && (
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
            {currentUserParticipant && (
              <div className="row gap small">
                <Stat Icon={Flame} colorClass="icon-orange">
                  {currentUserParticipant.currentStreak || 0} day streak
                </Stat>
                <Stat Icon={Trophy} colorClass="icon-yellow">
                  {currentUserParticipant.totalPoints || 0} pts
                </Stat>
              </div>
            )}
          </>
        )}

        {/* Number of particpants */}
        <div className="row gap-sm center muted">
          <Users className="icon" />
          <span className="small">{participantCount} participants</span>
        </div>

        {/* Calendar data */}
        {metaText && (
          <div className="row gap-sm small muted">
            <Calendar className="icon" />
            <span>{metaText}</span>
          </div>
        )}

        {/* Show first 5 participants */}
        <div className="avatar-stack">
          {visibleParticipants.map((participant) => {
            const name = participant.user?.name || 'U'
            const initial = name.charAt(0).toUpperCase()
            const src = participant.user?.avatar
            return (
              <div key={participant.userId} className="avatar" title={name}>
                {src ? (
                  <img src={src} alt={name} />
                ) : (
                  <div className="avatar-fallback">{initial}</div>
                )}
              </div>
            )
          })}
          {participantCount > 5 && (
            <div className="avatar more">+{participantCount - 5}</div>
          )}
        </div>
      </div>
    </div>
  )
}

export default ChallengeCard;
