// src/App.jsx
import React, { useState, useEffect } from 'react';
import './App.css';
import Login from './pages/Login';
import CreateAccount from './pages/CreateAccount';
import Dashboard from './pages/Dashboard';
import Mfa from './pages/Mfa';
import Leaderboard from './pages/Leaderboard.jsx';
import { verifyAuth } from './services/api';
import { BrowserRouter, Routes, Route } from 'react-router-dom';

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userData, setUserData] = useState(null);
  const [currentView, setCurrentView] = useState('login'); // 'login' or 'createAccount'
  const [showMfaSetup, setShowMfaSetup] = useState(false);
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);

  // Check if user is logged in on page load/reload
  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem('authToken');
      if (!token) {
        setIsCheckingAuth(false);
        return;
      }

      try {
        const userData = await verifyAuth();
        setUserData(userData);
        
        // If user doesn't have MFA enabled, show MFA setup
        if (!userData.mfaEnabled) {
          setShowMfaSetup(true);
        } else {
          setIsLoggedIn(true);
        }
      } catch (err) {
        console.error('Auth check failed:', err);
        // Token is invalid, user will see login page
        setIsLoggedIn(false);
        setUserData(null);
      } finally {
        setIsCheckingAuth(false);
      }
    };

    checkAuth();
  }, []);

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

  // Show loading while checking auth on page reload
  if (isCheckingAuth) {
    return (
      <div className="app-container" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}>
        <p>Loading...</p>
      </div>
    );
  }

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
      {isLoggedIn ? (
        <BrowserRouter> {/* added router wrapper so NavBar's useNavigate works */}
          <Routes>
            <Route path="/" element={<Dashboard userData={userData} onLogout={handleLogout} />} />
            <Route path="/leaderboard" element={<Leaderboard />} />
          </Routes>
        </BrowserRouter>
      ) : currentView === 'login' ? (
        <Login onLoginSuccess={handleLoginSuccess} onShowCreateAccount={toggleView} />
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
