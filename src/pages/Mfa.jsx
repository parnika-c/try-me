import React, { useState } from 'react';
import './Mfa.css';
import { enableMFA, verifyMFA } from '../services/api';

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
    setMessage('Generating QR code...');

    try {
      const data = await enableMFA(getAuthHeaders()); // Pass auth headers
      setQrImage(data.qrCode);
      setStep('scan');
      setMessage('');
    } catch (err) {
      console.error('Error enabling MFA:', err);
      setError('Failed to start MFA setup. Please try again.');
      setMessage('');
    }
  };

  const verifyCode = async () => {
    setError('');
    setMessage('Verifying code...');

    try {
      await verifyMFA(code, getAuthHeaders()); // Pass auth headers
      setStep('done');
      setMessage('MFA setup successfully completed!');
    } catch (err) {
      console.error('Error verifying MFA code:', err);
      setError('Invalid code. Please try again.');
      setMessage('');
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



