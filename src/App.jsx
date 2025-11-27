// src/App.jsx
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import React, { useState, useEffect } from 'react';
import './App.css';
import Login from './pages/Login';
import CreateAccount from './pages/CreateAccount';
import Dashboard from './pages/Dashboard';
import Mfa from './pages/Mfa';
import Leaderboard from './pages/Leaderboard.jsx';
import { verifyAuth } from './services/api';

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

  const toggleView = () => { // TODO remove??
    setCurrentView(currentView === 'login' ? 'createAccount' : 'login');
  };

  // Show loading while checking auth on page reload
  if (isCheckingAuth) {
    return <p>Loading...</p>;
  }

  // Show MFA setup screen if user just logged in without MFA - force before Router
  if (showMfaSetup) {
    return <Mfa onComplete={handleMfaComplete} />;
  }

  return (
    <BrowserRouter>
      <Routes>
        {/* Show dashboard if logged in */}
        {isLoggedIn && (
          <>
            <Route
              path="/"
              element={<Dashboard userData={userData} onLogout={handleLogout} />}
            />
            <Route path="/leaderboard" element={<Leaderboard />} />
          </>
        )}

        {/* Show login or create account */}
        {!isLoggedIn && (
          <>
            <Route
              path="/"
              element={
                currentView === 'login'
                  ? <Login onLoginSuccess={handleLoginSuccess} onShowCreateAccount={() => setCurrentView("createAccount")} />
                  : <CreateAccount onAccountCreated={handleAccountCreated} onShowLogin={() => setCurrentView("login")} />
              }
            />
          </>
        )}
      </Routes>
    </BrowserRouter>
  );
}

export default App;
