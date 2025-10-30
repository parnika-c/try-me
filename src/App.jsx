// src/App.js
import React, { useState } from 'react';
import Login from './pages/Login';
import CreateAccount from './pages/CreateAccount';
import { CreateChallengeModal } from './components/CreateChallengeModal'
import './App.css'


function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [authToken, setAuthToken] = useState(null);
  const [currentView, setCurrentView] = useState('login'); // 'login' or 'createAccount'
  const [showModal, setShowModal] = useState(false)

  const handleLoginSuccess = (token) => {
    setAuthToken(token);
    setIsLoggedIn(true);
  };

  const handleAccountCreated = (token) => {
    setAuthToken(token);
    setIsLoggedIn(true);
  };

  const handleLogout = () => {
    setAuthToken(null);
    setIsLoggedIn(false);
    setCurrentView('login');
  };

  const showCreateAccount = () => {
    setCurrentView('createAccount');
  };

  const showLogin = () => {
    setCurrentView('login');
  };

  // Simple Dashboard component for demonstration
  const Dashboard = ({ onLogout }) => (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
      <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full mx-6 text-center">
        <h1 className="text-3xl font-bold text-gray-800 mb-4">Welcome to Try Me!</h1>
        <p className="text-gray-600 mb-6">You are successfully logged in.</p>
        <button 
          onClick={onLogout}
          className="w-full bg-red-600 text-white py-3 px-4 rounded-lg hover:bg-red-700 transition-all font-medium"
        >
          Logout
        </button>
      </div>
    </div>
  );

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
        </div>
    
    
      {isLoggedIn ? (
        <Dashboard onLogout={handleLogout} authToken={authToken} />
      ) : currentView === 'login' ? (
        <Login 
          onLoginSuccess={handleLoginSuccess} 
          onShowCreateAccount={showCreateAccount}
        />
      ) : (
        <CreateAccount 
          onAccountCreated={handleAccountCreated}
          onShowLogin={showLogin}
        />
      )}
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
