import React from 'react'
import { Calendar, Users, Trophy, Flame, DollarSign } from 'lucide-react'
import './Challenge-Card.css'

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
 * @property {boolean} [hasForfeitPot]
 * @property {number} [forfeitPotTotal]
 * @property {string|number|Date} [startDate]
 */

/**
 * @param {{ challenge: Challenge, onClick: () => void }} props
 */
export function ChallengeCard({ challenge, onClick }) {
  const progressPercentage = Math.min(100, Math.max(0, (challenge.currentDay / 7) * 100))
  const daysRemaining = Math.max(0, 7 - (challenge.currentDay || 0))

  const currentUserParticipant = (challenge.participants || []).find(
    (p) => p.userId === 'user-1'
  )

  return (
    <div className="challenge-card" role="button" onClick={onClick}>
      <div className="card-header">
        <div className="title-row">
          <h3 className="card-title">{challenge.name}</h3>
          {challenge.isActive ? (
            <span className="badge badge-active">Active</span>
          ) : (
            <span className="badge badge-secondary">Upcoming</span>
          )}
        </div>
        <p className="card-description">{challenge.description}</p>
      </div>

      <div className="card-content">
        {challenge.isActive && (
          <>
            <div className="progress-block">
              <div className="row space-between small muted">
                <span>Progress</span>
                <span>Day {challenge.currentDay}/7</span>
              </div>
              <div className="progress">
                <div className="progress-inner" style={{ width: `${progressPercentage}%` }} />
              </div>
            </div>

            {currentUserParticipant && (
              <div className="row gap small">
                <div className="row gap-sm center">
                  <Flame className="icon icon-orange" />
                  <span>{currentUserParticipant.currentStreak || 0} day streak</span>
                </div>
                <div className="row gap-sm center">
                  <Trophy className="icon icon-yellow" />
                  <span>{currentUserParticipant.totalPoints || 0} pts</span>
                </div>
              </div>
            )}
          </>
        )}

        <div className="row space-between">
          <div className="row gap-sm center muted">
            <Users className="icon" />
            <span className="small">
              {(challenge.participants || []).length} participants
            </span>
          </div>
          {challenge.hasForfeitPot && (
            <div className="row gap-sm center">
              <DollarSign className="icon icon-green" />
              <span className="small">${challenge.forfeitPotTotal || 0}</span>
            </div>
          )}
        </div>

        {!challenge.isActive && challenge.startDate && (
          <div className="row gap-sm small muted">
            <Calendar className="icon" />
            <span>Starts {new Date(challenge.startDate).toLocaleDateString()}</span>
          </div>
        )}

        {challenge.isActive && daysRemaining > 0 && (
          <div className="row gap-sm small muted">
            <Calendar className="icon" />
            <span>{daysRemaining} days remaining</span>
          </div>
        )}

        <div className="avatar-stack">
          {(challenge.participants || []).slice(0, 5).map((participant) => {
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
          {(challenge.participants || []).length > 5 && (
            <div className="avatar more">+{(challenge.participants || []).length - 5}</div>
          )}
        </div>
      </div>
    </div>
  )
}

export default ChallengeCard
