// src/pages/Login.jsx
import React, { useState } from 'react';

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
      const response = await new Promise((resolve) =>
        setTimeout(() => {
          if (email === 'user@example.com' && password === 'password123') {
            resolve({ success: true, token: 'fake-jwt-token' });
          } else {
            resolve({ success: false, message: 'Invalid credentials.' });
          }
        }, 500)
      );

      if (response.success) {
        alert('Login successful!');
        onLoginSuccess?.(response.token);
      } else {
        setError(response.message);
      }
    } catch (err) {
      console.error(err);
      setError('An error occurred during login.');
    }
  };

  return (
    <div className="relative min-h-screen bg-auth overflow-hidden">
      <div className="blob" aria-hidden />

      {/* Top Nav */}
      <div className="relative z-10 flex justify-between items-center px-6 sm:px-10 py-6">
        <div className="flex items-center gap-2">
          <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-[var(--brand-from)] to-[var(--brand-to)]" />
          <span className="font-extrabold text-xl tracking-tight text-gray-900">Try Me</span>
        </div>
        <div className="flex gap-3">
          <button className="px-5 py-2 btn-primary">Login</button>
          <button
            className="px-5 py-2 bg-white text-blue-600 border-2 border-blue-600 rounded-xl hover:bg-blue-50 transition-all font-semibold shadow"
            onClick={onShowCreateAccount}
          >
            Create Account
          </button>
        </div>
      </div>

      {/* Split Layout */}
      <div className="relative z-10 grid lg:grid-cols-2 gap-10 items-center px-6 sm:px-10 pb-16">
        <div className="hidden lg:block">
          <div className="max-w-xl">
            <h1 className="text-5xl font-black tracking-tight text-gray-900 leading-tight">
              Welcome back — let’s keep your streak alive
            </h1>
            <p className="mt-4 text-gray-600 text-lg">
              Pick up where you left off. Your progress and weekly challenges are waiting.
            </p>
          </div>
        </div>

        <div className="w-full max-w-md mx-auto">
          <div className="glass rounded-3xl shadow-2xl p-8 border border-white/60">
            <h2 className="text-3xl font-bold text-gray-900 mb-6 text-center">Sign in</h2>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Email Address</label>
                <input
                  type="email" value={email} onChange={(e) => setEmail(e.target.value)}
                  placeholder="example@mail.com" className="input" required
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Password</label>
                <div className="relative">
                  <input
                    type={showPw ? 'text' : 'password'}
                    value={password} onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter your password" className="input pr-12" required
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
              </div>

              {error && (
                <div className="bg-red-50 border-2 border-red-200 rounded-xl p-4">
                  <p className="text-red-700 font-medium">{error}</p>
                </div>
              )}

              <button type="submit" className="w-full btn-primary py-4">Sign In</button>
            </form>

            <div className="mt-6 text-center text-gray-600">
              Don&apos;t have an account?{' '}
              <button
                onClick={onShowCreateAccount}
                className="text-blue-700 font-semibold underline decoration-2 underline-offset-2"
              >
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
