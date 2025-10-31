import { useState } from 'react'

import JoinChallenge from "./components/JoinChallenge";
import CreateChallengeModal from './components/CreateChallengeModal'
import './App.css'

function App() {
  const [showModal, setShowModal] = useState(false)

  return (
    <div className="App">
      <div className="main-content">
        <h1>Try Me</h1>

        <button 
          className="create-challenge-btn"
          onClick={() => setShowModal(true)}
        >
          Create Challenge
        </button>

        <div style={{padding: 24}}>
          <JoinChallenge />
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
  )
}

export default App