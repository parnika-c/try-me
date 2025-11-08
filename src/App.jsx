// src/App.jsx
import React, { useState } from 'react';
import './App.css';
import Login from './pages/Login';
import CreateAccount from './pages/CreateAccount';
import Dashboard from './pages/Dashboard.jsx'

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userData, setUserData] = useState(null);
  const [currentView, setCurrentView] = useState('login'); // 'login' or 'createAccount'

  // Handler for successful login - goes to dashboard
  const handleLoginSuccess = (data) => {
    setUserData(data);
    setIsLoggedIn(true);
  };

  // Handler for account creation - goes to login page
  const handleAccountCreated = () => {
    setCurrentView('login');
    // Show a success message (optional)
    alert('Account created successfully! Please log in.');
  };

  const handleLogout = () => {
    setUserData(null);
    setIsLoggedIn(false);
    setCurrentView('login');
  };

  const toggleView = () => {
    setCurrentView(currentView === 'login' ? 'createAccount' : 'login');
  };

  return (
    <div className="app-container">
      {isLoggedIn ? (
        <Dashboard userData={userData} onLogout={handleLogout} />
      ) : currentView === 'login' ? (
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
