import { useState } from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';

import Dashboard from './pages/Dashboard.jsx'
import './App.css'
import { ChallengeCard } from './components/Challenge-Card'

function App() {
  //MOCK DATA TO TEST CODE / DISPLAY
  const challenges = [
    {
      name: '10K Steps Daily',
      description: 'Walk 10,000 steps every day for a week!',
      isActive: true,
      currentDay: 5,
      startDate: new Date().toISOString(),
      participants: [
        { userId: 'user-1', user: { name: 'Sarah' }, currentStreak: 3, totalPoints: 145 },
        { userId: 'user-2', user: { name: 'Mike' } },
        { userId: 'user-3', user: { name: 'Tom' } },
        { userId: 'user-4', user: { name: 'Priya' } },
      ],
    },
    {
      name: 'Morning Meditation',
      description: 'Meditate for at least 10 minutes each morning',
      isActive: true,
      currentDay: 4,
      startDate: new Date().toISOString(),
      participants: [
        { userId: 'user-1', user: { name: 'Sarah' }, currentStreak: 4, totalPoints: 140 },
        { userId: 'user-5', user: { name: 'Emma' } },
      ],
    },
    {
      name: 'Read 30 Minutes Daily',
      description: 'Develop a reading habit by reading for 30 minutes each day',
      isActive: true,
      currentDay: 3,
      startDate: new Date().toISOString(),
      participants: [
        { userId: 'user-1', user: { name: 'Sarah' }, currentStreak: 2, totalPoints: 65 },
        { userId: 'user-3', user: { name: 'Tom' } },
        { userId: 'user-6', user: { name: 'Linda' } },
      ],
    },
    {
      name: '7-Day Hydration',
      description: 'Drink 8 cups of water daily to stay hydrated and energized.',
      isActive: true,
      currentDay: 3,
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
      startDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(),
      participants: [
        { userId: 'user-1', user: { name: 'Alex Johnson' }, currentStreak: 0, totalPoints: 0 },
        { userId: 'user-7', user: { name: 'Taylor Swift' } },
        { userId: 'user-8', user: { name: 'Chris Evans' } },
      ],
    },
    {
      name: 'Daily Reading Club',
      description: 'Read 20 pages every day for the next 7 days.',
      isActive: true,
      currentDay: 5,
      startDate: new Date().toISOString(),
      participants: [
        { userId: 'user-1', user: { name: 'Alex Johnson' }, currentStreak: 2, totalPoints: 30 },
        { userId: 'user-9', user: { name: 'Jordan Lee' } },
        { userId: 'user-10', user: { name: 'Morgan Yu' } },
        { userId: 'user-11', user: { name: 'Casey Neistat' } },
        { userId: 'user-12', user: { name: 'Nina Williams' } },
        { userId: 'user-13', user: { name: 'Arjun Mehta' } },
      ],
    },
  ]
  const [showModal, setShowModal] = useState(false)

  return (
    <Router>
      <Routes>
        <Route path="/dashboard" element={<Dashboard />} />
        {/* <Route path="/login" element={<Login />} /> */}
        <Route path="*" element={<Dashboard />} />
      </Routes>
    </Router>
  );

  return (
    <div className="App">
      <NavBar />
      <div className="main-content">
        <button 
          className="create-challenge-btn"
          onClick={() => setShowModal(true)}
        >
          Create Challenge
        </button>

        <div style={{padding: 24}}>
          <JoinChallenge />
        </div>

        <div className="cards-grid">
          {challenges.map((c) => (
            <ChallengeCard key={c.name} challenge={c} onClick={() => handleClick(c)} />
          ))}
        </div>

      </div>
      
      {showModal && (
        <CreateChallengeModal 
          onClose={() => setShowModal(false)}
          onCreateChallenge={(challengeData) => {
            console.log('Creating challenge:', challengeData)
            setShowModal(false)
          }}
        />
      )}
    </div>
  );
}

export default App;