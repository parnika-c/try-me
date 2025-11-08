// src/pages/CreateAccount.jsx
import React, { useState } from 'react';
import './CreateAccount.css';
import { register } from '../services/api';

const CreateAccount = ({ onAccountCreated, onShowLogin }) => {
  const [formData, setFormData] = useState({
    firstName: '', lastName: '', email: '', password: '', confirmPassword: ''
  });
  const [error, setError] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [showPw2, setShowPw2] = useState(false);
  const [passwordValidation, setPasswordValidation] = useState({
    length: false, uppercase: false, lowercase: false, number: false, special: false
  });

  const validatePassword = (password) => {
    const validation = {
      length: password.length >= 10,
      uppercase: /[A-Z]/.test(password),
      lowercase: /[a-z]/.test(password),
      number: /\d/.test(password),
      special: /[@$!%*?&]/.test(password)
    };
    setPasswordValidation(validation);
    return Object.values(validation).every(Boolean);
  };

  const strengthScore = Object.values(passwordValidation).filter(Boolean).length; // 0..5

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (name === 'password') validatePassword(value);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!formData.firstName || !formData.lastName || !formData.email || !formData.password) {
      setError('Please fill in all required fields.');
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      setError('Please enter a valid email address.');
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match.');

      return;
    }

    if (!validatePassword(formData.password)) {
      const v = passwordValidation;
      const missing = [];
      if (!v.length) missing.push('at least 10 characters');
      if (!v.uppercase) missing.push('one uppercase letter');
      if (!v.lowercase) missing.push('one lowercase letter');
      if (!v.number) missing.push('one number');
      if (!v.special) missing.push('one special character (@$!%*?&)');
      setError(`Password must contain: ${missing.join(', ')}.`);
      return;
    }

    try {
      // Send the user data to your backend!
      const response = await register({
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        password: formData.password
      });

      // If we get here, it worked! The user is now saved in MongoDB!
      alert('Account created successfully! Your info is now in the database!');
      onAccountCreated?.(response);
    } catch (err) {
      console.error(err);
      // Show the error message from the server
      setError(err.message || 'An error occurred during account creation.');
    }
  };

  return (
    <div className="create-account-container">
      <div className="create-account-blob" aria-hidden="true" />

      {/* Top Navigation */}
      <div className="create-account-nav">
        <div className="create-account-logo-container">
          <div className="create-account-logo" />
          <span className="create-account-logo-text">Try Me</span>
        </div>
        <div className="create-account-nav-buttons">
          <button className="create-account-btn-secondary" onClick={onShowLogin}>
            Login
          </button>
          <button className="create-account-btn-primary">Create Account</button>
        </div>
      </div>

      {/* Split Layout */}
      <div className="create-account-layout">
        {/* Left: marketing / value prop */}
        <div className="create-account-hero">
          <div className="create-account-hero-content">
            <h1 className="create-account-hero-title">
              Welcome to Try Me, a fun way to compete with your friends!
            </h1>
            <p className="create-account-hero-text">
              Create an account to creat challenges and compete with your friends!
            </p>
          </div>
        </div>

        {/* Right: form card */}
        <div className="create-account-form-wrapper">
          <div className="create-account-card">
            <h2 className="create-account-card-title">Create your account</h2>

            <form onSubmit={handleSubmit} className="create-account-form">
              <div className="create-account-form-row">
                <div className="create-account-form-group">
                  <label className="create-account-label">First Name</label>
                  <input
                    type="text"
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleChange}
                    placeholder="John"
                    className="create-account-input"
                    required
                  />
                </div>
                <div className="create-account-form-group">
                  <label className="create-account-label">Last Name</label>
                  <input
                    type="text"
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleChange}
                    placeholder="Doe"
                    className="create-account-input"
                    required
                  />
                </div>
              </div>

              <div className="create-account-form-group">
                <label className="create-account-label">Email Address</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="example@mail.com"
                  className="create-account-input"
                  required
                />
              </div>

              <div className="create-account-form-group">
                <label className="create-account-label">Password</label>
                <div className="create-account-input-wrapper">
                  <input
                    type={showPw ? 'text' : 'password'}
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    placeholder="Min 10 characters"
                    className="create-account-input create-account-input-with-icon"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPw(v => !v)}
                    className="create-account-toggle-password"
                    aria-label="Toggle password visibility"
                  >
                    {showPw ? '◉' : '◯'}
                  </button>
                </div>

                {/* Strength meter */}
                <div className="create-account-strength-meter">
                  <div className="create-account-strength-bars">
                    {[0,1,2,3,4].map(i => (
                      <div
                        key={i}
                        className={`create-account-strength-bar ${i < strengthScore ? 'active' : ''}`}
                      />
                    ))}
                  </div>
                  <p className="create-account-strength-text">
                    {strengthScore <= 2 ? 'Weak' : strengthScore === 3 ? 'Okay' : 'Strong'}
                  </p>
                </div>

                {/* Requirements */}
                <div className="create-account-requirements">
                  {[
                    ['length','At least 10 characters'],
                    ['uppercase','One uppercase letter (A–Z)'],
                    ['lowercase','One lowercase letter (a–z)'],
                    ['number','One number (0–9)'],
                    ['special','One special (@$!%*?&)'],
                  ].map(([k, label]) => (
                    <div key={k} className={`create-account-requirement ${passwordValidation[k] ? 'met' : ''}`}>
                      <span className="create-account-requirement-dot" />
                      {label}
                    </div>
                  ))}
                </div>
              </div>

              <div className="create-account-form-group">
                <label className="create-account-label">Confirm Password</label>
                <div className="create-account-input-wrapper">
                  <input
                    type={showPw2 ? 'text' : 'password'}
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    placeholder="Confirm your password"
                    className="create-account-input create-account-input-with-icon"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPw2(v => !v)}
                    className="create-account-toggle-password"
                    aria-label="Toggle password visibility"
                  >
                    {showPw2 ? '◉' : '◯'}
                  </button>
                </div>
              </div>

              {error && (
                <div className="create-account-error">
                  <p className="create-account-error-text">{error}</p>
                </div>
              )}

              <button type="submit" className="create-account-submit-btn">Create Account</button>
            </form>

            <div className="create-account-footer">
              Already have an account?{' '}
              <button onClick={onShowLogin} className="create-account-footer-link">
                Sign in here
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreateAccount;
