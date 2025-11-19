import React, { useState } from 'react';

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
    <div style={{ padding: '2rem' }}>
      <h2>Set up multi factor authentication</h2>

      {step === 'start' && (
        <div>
          <p>Click the button to generate a secret and QR code for your account.</p>
          <button onClick={startSetup}>Start setup</button>
        </div>
      )}

      {step === 'scan' && (
        <div>
          <p>Scan this QR code using Google Authenticator or a similar app.</p>
          {qrCode && (
            <img src={qrCode} alt="MFA QR" style={{ width: '200px', height: '200px' }} />
          )}
          <p>
            After scanning, your app will start showing six digit codes. Enter one of
            those codes below and submit.
          </p>
          <input value={code} onChange={(e) => setCode(e.target.value)} placeholder="Enter six digit code" />
          <button onClick={verifyCode} style={{ marginLeft: '0.5rem' }}>
            Verify code
          </button>
        </div>
      )}

      {step === 'done' && (
        <div>
          <p style={{ color: 'green', marginBottom: '1rem' }}>
            Setup complete! Next time you log in, you will be asked for a code after entering your
            password.
          </p>
          {onComplete && (
            <button 
              onClick={onComplete}
              style={{ 
                padding: '0.75rem 1.5rem', 
                backgroundColor: '#3a71e7', 
                color: 'white', 
                border: 'none', 
                borderRadius: '0.5rem',
                cursor: 'pointer',
                fontSize: '1rem'
              }}
            >
              Continue to Dashboard
            </button>
          )}
        </div>
      )}

      {message && <p style={{ color: 'green' }}>{message}</p>}
      {error && <p style={{ color: 'red' }}>{error}</p>}
    </div>
  );
}

export default Mfa;



