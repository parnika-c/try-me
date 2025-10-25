import './App.css'
import { useState } from 'react'
import { ChallengeCard } from './components/Challenge-Card'

function App() {
  const challenges = [
    {
      name: '7-Day Hydration',
      description: 'Drink 8 cups of water daily to stay hydrated and energized.',
      isActive: true,
      currentDay: 3,
      hasForfeitPot: true,
      forfeitPotTotal: 125,
      startDate: new Date().toISOString(),
      participants: [
        { userId: 'user-1', user: { name: 'Alex Johnson' }, currentStreak: 3, totalPoints: 45 },
        { userId: 'user-2', user: { name: 'Priya Patel' } },
        { userId: 'user-3', user: { name: 'Marcus Lee' } },
        { userId: 'user-4', user: { name: 'Sam Kim' } },
        { userId: 'user-5', user: { name: 'Jenna Ortega' } },
        { userId: 'user-6', user: { name: 'Diego Rivera' } },
      ],
    },
    {
      name: 'Morning Run Week',
      description: 'Run 2 miles every morning before 9 AM for a week.',
      isActive: false,
      currentDay: 0,
      hasForfeitPot: false,
      forfeitPotTotal: 0,
      startDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(),
      participants: [
        { userId: 'user-1', user: { name: 'Alex Johnson' }, currentStreak: 0, totalPoints: 0 },
        { userId: 'user-7', user: { name: 'Taylor Swift' } },
        { userId: 'user-8', user: { name: 'Chris Evans' } },
      ],
    },
  ]

  const handleClick = (challenge) => {
    // eslint-disable-next-line no-console
    console.log('Challenge clicked:', challenge.name)
  }

  return (
    <div className="App">
      <div className="main-content">
        <h1>Try Me</h1>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16, marginTop: 16 }}>
          {challenges.map((c) => (
            <ChallengeCard key={c.name} challenge={c} onClick={() => handleClick(c)} />)
          )}
        </div>
      </div>
    </div>
  )
}

export default App
