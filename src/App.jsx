// src/App.jsx
import React, { useState } from 'react';
import './App.css';
import Login from './pages/Login';
import CreateAccount from './pages/CreateAccount';
import Dashboard from './pages/Dashboard';
import Mfa from './pages/Mfa';

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userData, setUserData] = useState(null);
  const [currentView, setCurrentView] = useState('login'); // 'login' or 'createAccount'
  const [showMfaSetup, setShowMfaSetup] = useState(false);

  // Handler for successful login - check if MFA setup is needed
  const handleLoginSuccess = (data) => {
    setUserData(data);
    
    // If user doesn't have MFA enabled, show MFA setup screen
    if (!data.mfaEnabled) {
      setShowMfaSetup(true);
    } else {
      // User has MFA, go straight to dashboard
      setIsLoggedIn(true);
    }
  };

  // Handler for account creation - goes to login page
  const handleAccountCreated = () => {
    setCurrentView('login');
    alert('Account created successfully! Please log in.');
  };

  // Handler for MFA setup completion
  const handleMfaComplete = () => {
    setShowMfaSetup(false);
    setIsLoggedIn(true);
    // Update userData to reflect MFA is now enabled
    setUserData(prev => ({ ...prev, mfaEnabled: true }));
  };

  const handleLogout = () => {
    setUserData(null);
    setIsLoggedIn(false);
    setCurrentView('login');
    setShowMfaSetup(false);
    localStorage.removeItem('authToken');
  };

  const toggleView = () => {
    setCurrentView(currentView === 'login' ? 'createAccount' : 'login');
  };

  // Show MFA setup screen if user just logged in without MFA
  if (showMfaSetup) {
    return (
      <div className="app-container">
        <Mfa onComplete={handleMfaComplete} />
      </div>
    );
  }

  // Show dashboard if logged in
  if (isLoggedIn) {
    return (
      <Dashboard 
        userData={userData} 
        onLogout={handleLogout}
        onShowMfa={() => setShowMfaSetup(true)}
      />
    );
  }

  // Show login or create account
  return (
    <div className="app-container">
      {currentView === 'login' ? (
        <Login 
          onLoginSuccess={handleLoginSuccess} 
          onShowCreateAccount={toggleView}
        />
      ) : (
        <CreateAccount 
          onAccountCreated={handleAccountCreated}
          onShowLogin={toggleView}
        />
      )}
    </div>
  );
}

export default App;
