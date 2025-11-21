import React, { useState } from 'react';
import './Mfa.css';

function Mfa({ onComplete }) {
  const [code, setCode] = useState('');
  const [message, setMessage] = useState('');
  const [qrCode, setQrImage] = useState(null);
  const [step, setStep] = useState('start'); // start -> scan -> done
  const [error, setError] = useState('');

  const getAuthHeaders = () => {
    const token = localStorage.getItem('authToken');
    if (!token) return null;
    return { Authorization: `Bearer ${token}` };
  };

  const startSetup = async () => {
    setError('');
    setMessage('');
    try {
      const headers = getAuthHeaders();
      if (!headers) {
        setError('User not authenticated');
        return;
      }
      const API_URL = 'http://localhost:4000/api';
      const response = await fetch(`${API_URL}/mfa/enable`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...headers,
        },
      });
      if (!response.ok) {
        const err = await response.json().catch(() => ({}));
        throw new Error(err.message || 'Failed to initiate MFA setup');
      }
      const data = await response.json();
      setQrImage(data.qrCode);
      setStep('scan');
    } catch (err) {
      console.error(err);
      setError(err.message || 'An error occurred while setting up MFA.');
    }
  };

  const verifyCode = async () => {
    setError('');
    setMessage('');
    try {
      const headers = getAuthHeaders();
      if (!headers) {
        setError('User not authenticated');
        return;
      }
      const API_URL = 'http://localhost:4000/api';
      const response = await fetch(`${API_URL}/mfa/verify`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...headers,
        },
        body: JSON.stringify({ token: code }),
      });
      if (!response.ok) {
        const err = await response.json().catch(() => ({}));
        throw new Error(err.message || 'MFA verification failed');
      }
      setMessage('MFA setup is successfully completed!');
      setStep('done');
    } catch (err) {
      console.error(err);
      setError(err.message || 'An error occurred while verifying MFA.');
    }
  };

  return (
    <div className="mfa-container">
      <div className="mfa-blob" aria-hidden="true" />
      
      <div className="mfa-content">
        <div className="mfa-card">
          

          {step === 'start' && (
            <div className="mfa-step-container">
              <h2 className="mfa-title">Set up Multi Factor Authentication</h2>
              <p className="mfa-text">Click the button to generate a secret and QR code for your account.</p>
              <button onClick={startSetup} className="mfa-button">Start setup</button>
            </div>
          )}

          {step === 'scan' && (
            <div className="mfa-step-container">
              <p className="mfa-text">Scan this QR code using Google Authenticator or a similar app.</p>
              {qrCode && (
                <div className="mfa-qr-container">
                  <img src={qrCode} alt="MFA QR" className="mfa-qr-image" />
                </div>
              )}
              <p className="mfa-text">
                After scanning, your app will start showing six digit codes. Enter one of
                those codes below and submit.
              </p>
              <div className="mfa-input-group">
                <input 
                  value={code} 
                  onChange={(e) => setCode(e.target.value)} 
                  placeholder="Enter six digit code"
                  className="mfa-input"
                  maxLength="6"
                />
                <div className="mfa-button-group">
                  <button onClick={verifyCode} className="mfa-button">
                    Verify code
                  </button>
                </div>
              </div>
            </div>
          )}

          {step === 'done' && (
            <div className="mfa-step-container">
              <h2 className="mfa-title">Setup complete!</h2>

              <p className="mfa-success-text">
               Next time you log in, you will be asked for a code after entering your
                password.
              </p>
              {onComplete && (
                <button 
                  onClick={onComplete}
                  className="mfa-button-primary"
                >
                  Continue to Dashboard
                </button>
              )}
            </div>
   
          )}

          {message && <p className="mfa-message">{message}</p>}
          {error && <p className="mfa-error">{error}</p>}
        </div>
      </div>
    </div>
  );
}

export default Mfa;



