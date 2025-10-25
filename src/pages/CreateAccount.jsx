// src/pages/CreateAccount.jsx
import React, { useState } from 'react';

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
      const response = await new Promise((resolve) =>
        setTimeout(() => resolve({ success: true, token: 'fake-jwt-token' }), 600)
      );

      if (response.success) {
        alert('Account created successfully!');
        onAccountCreated?.(response.token);
      }
    } catch (err) {
      console.error(err);
      setError('An error occurred during account creation.');
    }
  };

  return (
    <div className="relative min-h-screen bg-auth overflow-hidden">
      <div className="blob" aria-hidden />

      {/* Top Navigation */}
      <div className="relative z-10 flex justify-between items-center px-6 sm:px-10 py-6">
        <div className="flex items-center gap-2">
          <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-[var(--brand-from)] to-[var(--brand-to)]" />
          <span className="font-extrabold text-xl tracking-tight text-gray-900">Try Me</span>
        </div>
        <div className="flex gap-3">
          <button
            className="px-5 py-2 bg-white text-blue-600 border-2 border-blue-600 rounded-xl hover:bg-blue-50 transition-all font-semibold shadow"
            onClick={onShowLogin}
          >
            Login
          </button>
          <button className="px-5 py-2 btn-primary">Create Account</button>
        </div>
      </div>

      {/* Split Layout */}
      <div className="relative z-10 grid lg:grid-cols-2 gap-10 items-center px-6 sm:px-10 pb-16">
        {/* Left: marketing / value prop */}
        <div className="hidden lg:block">
          <div className="max-w-xl">
            <h1 className="text-5xl font-black tracking-tight text-gray-900 leading-tight">
              Join a cleaner, calmer way to track your goals
            </h1>
            <p className="mt-4 text-gray-600 text-lg">
              Create an account to unlock streaks, weekly challenges, and rich visual insights.
            </p>

            <ul className="mt-8 space-y-3">
              {[
                'Beautiful analytics and progress charts',
                'Privacy-first by default',
                'Invite friends and compete weekly',
              ].map((t) => (
                <li key={t} className="flex items-center gap-3 text-gray-700">
                  <span className="inline-flex h-5 w-5 rounded-full bg-green-100 border border-green-200" />
                  <span className="font-medium">{t}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Right: form card */}
        <div className="w-full max-w-md mx-auto">
          <div className="glass rounded-3xl shadow-2xl p-8 border border-white/60">
            <h2 className="text-3xl font-bold text-gray-900 mb-6 text-center">Create your account</h2>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">First Name</label>
                  <input
                    type="text" name="firstName" value={formData.firstName} onChange={handleChange}
                    placeholder="John" className="input" required
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Last Name</label>
                  <input
                    type="text" name="lastName" value={formData.lastName} onChange={handleChange}
                    placeholder="Doe" className="input" required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Email Address</label>
                <input
                  type="email" name="email" value={formData.email} onChange={handleChange}
                  placeholder="example@mail.com" className="input" required
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Password</label>
                <div className="relative">
                  <input
                    type={showPw ? 'text' : 'password'}
                    name="password" value={formData.password} onChange={handleChange}
                    placeholder="Min 10 characters" className="input pr-12" required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPw(v => !v)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                    aria-label="Toggle password visibility"
                  >
                    {showPw ? '🙈' : '👁️'}
                  </button>
                </div>

                {/* Strength meter */}
                <div className="mt-3">
                  <div className="flex gap-1">
                    {[0,1,2,3,4].map(i => (
                      <div
                        key={i}
                        className={`h-1.5 flex-1 rounded-full ${
                          i < strengthScore ? 'bg-green-500' : 'bg-gray-200'
                        }`}
                      />
                    ))}
                  </div>
                  <p className="mt-2 text-xs text-gray-600">
                    {strengthScore <= 2 ? 'Weak' : strengthScore === 3 ? 'Okay' : 'Strong'}
                  </p>
                </div>

                {/* Requirements */}
                <div className="mt-3 grid grid-cols-2 gap-x-4 gap-y-1 text-sm">
                  {[
                    ['length','At least 10 characters'],
                    ['uppercase','One uppercase letter (A–Z)'],
                    ['lowercase','One lowercase letter (a–z)'],
                    ['number','One number (0–9)'],
                    ['special','One special (@$!%*?&)'],
                  ].map(([k, label]) => (
                    <div key={k} className={`flex items-center ${passwordValidation[k] ? 'text-green-700' : 'text-gray-500'}`}>
                      <span className={`w-2 h-2 rounded-full mr-2 ${passwordValidation[k] ? 'bg-green-500' : 'bg-gray-300'}`} />
                      {label}
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Confirm Password</label>
                <div className="relative">
                  <input
                    type={showPw2 ? 'text' : 'password'}
                    name="confirmPassword" value={formData.confirmPassword} onChange={handleChange}
                    placeholder="Confirm your password" className="input pr-12" required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPw2(v => !v)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                    aria-label="Toggle password visibility"
                  >
                    {showPw2 ? '🙈' : '👁️'}
                  </button>
                </div>
              </div>

              {error && (
                <div className="bg-red-50 border-2 border-red-200 rounded-xl p-4">
                  <p className="text-red-700 font-medium">{error}</p>
                </div>
              )}

              <button type="submit" className="w-full btn-primary py-4">Create Account</button>
            </form>

            <div className="mt-6 text-center text-gray-600">
              Already have an account?{' '}
              <button onClick={onShowLogin} className="text-blue-700 font-semibold underline decoration-2 underline-offset-2">
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
