// src/pages/Login.jsx
import React, { useState } from 'react';
import './Login.css';
import { login, forgotPassword, resetPassword } from '../services/api';
import { validatePassword, getPasswordErrorMessage, passwordRequirements } from '../utils/passwordValidation';

const Login = ({ onLoginSuccess, onShowCreateAccount }) => {
  const [email, setEmail] = useState(''); 
  const [password, setPassword] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [mfaToken, setMfaToken] = useState('');
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [step, setStep] = useState('login'); // 'login', 'mfa', or 'resetPassword'
  
  // Reset password state
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showNewPw, setShowNewPw] = useState(false);
  const [showConfirmPw, setShowConfirmPw] = useState(false);
  const [resetToken, setResetToken] = useState('');
  const [isResetting, setIsResetting] = useState(false);
  const [passwordValidation, setPasswordValidation] = useState({
    length: false,
    uppercase: false,
    lowercase: false,
    number: false,
    special: false
  });

  const handleRequestPasswordReset = async () => {
    if (!email) {
      setError('Please enter your email address first.');
      return;
    }

    try {
      setIsResetting(true);
      setError('');
      const response = await forgotPassword(email);
      
      // Get the reset token (in dev mode, backend returns it)
      if (response.resetToken) {
        setResetToken(response.resetToken);
        setStep('resetPassword');
      } else {
        setError('Failed to initiate password reset. Please try again.');
      }
    } catch (err) {
      console.error(err);
      setError(err.message || 'Failed to request password reset.');
    } finally {
      setIsResetting(false);
    }
  };

  const handlePasswordChange = (value) => {
    setNewPassword(value);
    const validation = validatePassword(value);
    setPasswordValidation(validation);
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    setError('');

    if (!newPassword || !confirmPassword) {
      setError('Please enter and confirm your new password.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    // Validate password strength using same regex as CreateAccount
    const validation = validatePassword(newPassword);
    if (!validation.isValid) {
      const v = validation;
      const missing = [];
      if (!v.length) missing.push('at least 10 characters');
      if (!v.uppercase) missing.push('one uppercase letter');
      if (!v.lowercase) missing.push('one lowercase letter');
      if (!v.number) missing.push('one number');
      if (!v.special) missing.push('one special character (@$!%*?&)');
      setError(`Password must contain: ${missing.join(', ')}.`);
      return;
    }

    if (!resetToken) {
      setError('Invalid reset token. Please try again.');
      return;
    }

    try {
      setIsResetting(true);
      await resetPassword(resetToken, newPassword);
      
      // Reset successful - go back to login
      setStep('login');
      setNewPassword('');
      setConfirmPassword('');
      setResetToken('');
      setError('');
      setPassword('');
      setPasswordValidation({
        length: false,
        uppercase: false,
        lowercase: false,
        number: false,
        special: false
      });
      // Show success message
      setSuccessMessage('Password reset successfully! Please log in with your new password.');
      setTimeout(() => setSuccessMessage(''), 5000);
    } catch (err) {
      console.error(err);
      setError(err.message || 'Failed to reset password.');
    } finally {
      setIsResetting(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccessMessage('');

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
      // Handle "Invalid credentials" error - show error message
      if (err.message === 'Invalid credentials') {
        setError('Invalid email or password.');
      } else {
        setError(err.message || 'An error occurred during login.');
      }
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
              <p className="login-mfa-description">
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
                    className="login-input login-mfa-input"
                    maxLength="6"
                    required
                    autoFocus
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
                  className="login-footer-link login-back-button"
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

  if (step === 'resetPassword') {
    const strengthScore = Object.values(passwordValidation).filter(Boolean).length;

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
              <h2 className="login-card-title">Reset Password</h2>
              <p className="login-mfa-description">
                Enter your new password for {email}
              </p>

              <form onSubmit={handleResetPassword} className="login-form">
                <div className="login-form-group">
                  <label className="login-label">New Password</label>
                  <div className="login-input-wrapper">
                    <input
                      type={showNewPw ? 'text' : 'password'}
                      value={newPassword}
                      onChange={(e) => handlePasswordChange(e.target.value)}
                      placeholder="Min 10 characters"
                      className="login-input login-input-with-icon"
                      required
                      disabled={isResetting}
                    />
                    <button
                      type="button"
                      onClick={() => setShowNewPw(v => !v)}
                      className="login-toggle-password"
                      aria-label="Toggle password visibility"
                    >
                      {showNewPw ? '◉' : '◯'}
                    </button>
                  </div>

                  {/* Strength meter */}
                  {newPassword && (
                    <>
                      <div className="login-strength-meter">
                        <div className="login-strength-bars">
                          {[0,1,2,3,4].map(i => (
                            <div
                              key={i}
                              className={`login-strength-bar ${i < strengthScore ? 'active' : ''}`}
                            />
                          ))}
                        </div>
                        <p className="login-strength-text">
                          {strengthScore <= 2 ? 'Weak' : strengthScore === 3 ? 'Okay' : 'Strong'}
                        </p>
                      </div>

                      {/* Requirements */}
                      <div className="login-requirements">
                        {passwordRequirements.map(({ key, label }) => (
                          <div key={key} className={`login-requirement ${passwordValidation[key] ? 'met' : ''}`}>
                            <span className="login-requirement-dot" />
                            {label}
                          </div>
                        ))}
                      </div>
                    </>
                  )}
                </div>

                <div className="login-form-group">
                  <label className="login-label">Confirm Password</label>
                  <div className="login-input-wrapper">
                    <input
                      type={showConfirmPw ? 'text' : 'password'}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="Confirm your password"
                      className="login-input login-input-with-icon"
                      required
                      disabled={isResetting}
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPw(v => !v)}
                      className="login-toggle-password"
                      aria-label="Toggle password visibility"
                    >
                      {showConfirmPw ? '◉' : '◯'}
                    </button>
                  </div>
                </div>

                {error && (
                  <div className="login-error">
                    <p className="login-error-text">{error}</p>
                  </div>
                )}

                <button 
                  type="submit" 
                  className="login-submit-btn"
                  disabled={isResetting}
                >
                  {isResetting ? 'Resetting Password...' : 'Reset Password'}
                </button>
                
                <button
                  type="button"
                  onClick={() => {
                    setStep('login');
                    setNewPassword('');
                    setConfirmPassword('');
                    setResetToken('');
                    setError('');
                    setPasswordValidation({
                      length: false,
                      uppercase: false,
                      lowercase: false,
                      number: false,
                      special: false
                    });
                  }}
                  className="login-footer-link login-back-button"
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

              {successMessage && (
                <div className="login-success">
                  <p className="login-success-text">{successMessage}</p>
                </div>
              )}

              <button type="submit" className="login-submit-btn">Sign In</button>
            </form>

            <div className="login-footer">
              <div className="login-footer-item">
                Don&apos;t have an account?{' '}
                <button onClick={onShowCreateAccount} className="login-footer-link">
                  Create one here
                </button>
              </div>
              {error && error.includes('Invalid email or password') && (
                <div>
                  <button 
                    type="button"
                    onClick={handleRequestPasswordReset}
                    className="login-footer-link"
                    disabled={isResetting}
                  >
                    {isResetting ? 'Requesting reset...' : 'Forgot Password? Reset it here'}
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
