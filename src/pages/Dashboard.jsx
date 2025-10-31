import React, { useState } from 'react';
import { CreateChallengeModal } from '../components/CreateChallengeModal';
import { NavBar } from '../components/NavBar';
import JoinChallenge from '../components/JoinChallenge';
import './Dashboard.css';

function Dashboard() {
  const [showModal, setShowModal] = useState(false);

  return (
    <>
        <NavBar />
        <div className="dashboard-container">
            <button 
                className="create-challenge-btn"
                onClick={() => setShowModal(true)}
            >
                Create Challenge
            </button>

            <div style={{padding: 24}}>
                <JoinChallenge />
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
    </>
    
  );
};

export default Dashboard;
