// src/pages/Login.jsx
import React, { useState } from 'react';
import './Login.css';
import { login } from '../services/api';

const Login = ({ onLoginSuccess, onShowCreateAccount }) => {
  const [email, setEmail] = useState(''); 
  const [password, setPassword] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [mfaToken, setMfaToken] = useState('');
  const [error, setError] = useState('');
  const [step, setStep] = useState('login'); // 'login' or 'mfa'

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!email || !password) {
      setError('Please enter both email and password.');
      return;
    }
    

    try {
      const response = await login({ email, password }); // Send login request to backend
      
      // If backend indicates MFA is required, switch to MFA step
      if (response.mfaRequired) {
        setStep('mfa');
        setError(''); // Clear any previous errors
        return;
      }

      // Successful login (token present)
      if (response.token) {
        localStorage.setItem('authToken', response.token);
        onLoginSuccess?.(response);
      }
    } catch (err) {
      console.error(err);
      setError(err.message || 'An error occurred during login.');
    }
  };

  const handleMFASubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      // Re-submit login with token included (backend accepts token during login)
      const response = await login({ email, password, token: mfaToken });
      // on success response.token will be present
      if (response.token) {
        localStorage.setItem('authToken', response.token);
        onLoginSuccess?.(response);
      } else {
        setError('MFA verification failed');
      }
    } catch (err) {
      console.error(err);
      setError(err.message || 'An error occurred during MFA verification.');
    }
  };
  if (step === 'mfa') {
    return (
      <div className="login-container">
        <div className="login-blob" aria-hidden="true" />
        
        <div className="login-nav">
          <div className="login-logo-container">
            <div className="login-logo" />
            <span className="login-logo-text">Try Me</span>
          </div>
        </div>

        <div className="login-layout">
          <div className="login-form-wrapper">
            <div className="login-card">
              <h2 className="login-card-title">Two-Factor Authentication</h2>
              <p style={{ textAlign: 'center', color: '#6b7280', marginBottom: '1.5rem' }}>
                Enter the 6-digit code from your authenticator app
              </p>

              <form onSubmit={handleMFASubmit} className="login-form">
                <div className="login-form-group">
                  <label className="login-label">MFA Code</label>
                  <input
                    type="text"
                    value={mfaToken}
                    onChange={(e) => setMfaToken(e.target.value.replace(/\D/g, '').slice(0, 6))}
                    placeholder="000000"
                    className="login-input"
                    maxLength="6"
                    required
                    autoFocus
                    style={{ textAlign: 'center', letterSpacing: '0.5rem', fontSize: '1.5rem' }}
                  />
                </div>

                {error && (
                  <div className="login-error">
                    <p className="login-error-text">{error}</p>
                  </div>
                )}

                <button type="submit" className="login-submit-btn">Verify Code</button>
                
                <button
                  type="button"
                  onClick={() => {
                    setStep('login');
                    setMfaToken('');
                    setError('');
                  }}
                  className="login-footer-link"
                  style={{ marginTop: '1rem', display: 'block', textAlign: 'center' }}
                >
                  ← Back to login
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    );
  }

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
