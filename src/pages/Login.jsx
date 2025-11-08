// src/pages/Login.jsx
import React, { useState } from 'react';
import './Login.css';
import { login } from '../services/api';

const Login = ({ onLoginSuccess, onShowCreateAccount }) => {
  const [email, setEmail] = useState(''); 
  const [password, setPassword] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!email || !password) {
      setError('Please enter both email and password.');
      return;
    }

    try {
      // Send login request to your backend!
      const response = await login({ email, password });

      // If we get here, login worked! User exists in MongoDB!
      onLoginSuccess?.(response);
    } catch (err) {
      console.error(err);
      // Show the error message from the server
      setError(err.message || 'An error occurred during login.');
    }
  };

  return (
    <div className="login-container">
      <div className="login-blob" aria-hidden="true" />

      {/* Top Nav */}
      <div className="login-nav">
        <div className="login-logo-container">
          <div className="login-logo" />
          <span className="login-logo-text">Try Me</span>
        </div>
        <div className="login-nav-buttons">
          <button className="login-btn-primary">Login</button>
          <button className="login-btn-secondary" onClick={onShowCreateAccount}>
            Create Account
          </button>
        </div>
      </div>

      {/* Split Layout */}
      <div className="login-layout">
        <div className="login-hero">
          <div className="login-hero-content">
            <h1 className="login-hero-title">
              Welcome back to Try Me!
            </h1>
            <p className="login-hero-text">
              Sign in to your account to continue.
            </p>
          </div>
        </div>

        <div className="login-form-wrapper">
          <div className="login-card">
            <h2 className="login-card-title">Sign in</h2>

            <form onSubmit={handleSubmit} className="login-form">
              <div className="login-form-group">
                <label className="login-label">Email Address</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="example@mail.com"
                  className="login-input"
                  required
                />
              </div>

              <div className="login-form-group">
                <label className="login-label">Password</label>
                <div className="login-input-wrapper">
                  <input
                    type={showPw ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter your password"
                    className="login-input login-input-with-icon"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPw(v => !v)}
                    className="login-toggle-password"
                    aria-label="Toggle password visibility"
                  >
                    {showPw ? '◉' : '◯'}
                  </button>
                </div>
              </div>

              {error && (
                <div className="login-error">
                  <p className="login-error-text">{error}</p>
                </div>
              )}

              <button type="submit" className="login-submit-btn">Sign In</button>
            </form>

            <div className="login-footer">
              Don&apos;t have an account?{' '}
              <button onClick={onShowCreateAccount} className="login-footer-link">
                Create one here
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
