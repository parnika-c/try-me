// This file handles all communication between your frontend and backend
// Think of it as the "waiter" that carries messages between customer and kitchen

const API_URL = 'http://localhost:4000/api';

/**
 * Register a new user
 * @param {Object} userData - User information (firstName, lastName, email, password)
 * @returns {Promise} - Returns user data if successful
 */
export const register = async (userData) => {
  try {
    const response = await fetch(`${API_URL}/auth/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include', // Important! This sends cookies
      body: JSON.stringify(userData),
    });

    const data = await response.json();

    // If the server sends an error, throw it
    if (!response.ok) {
      throw new Error(data.message || 'Registration failed');
    }

    return data;
  } catch (error) {
    // Re-throw the error so we can catch it in our component
    throw error;
  }
};

/**
 * Login a user
 * @param {Object} credentials - User login info (email, password, token for MFA)
 * @returns {Promise} - Returns user data if successful, or { mfaRequired: true } if MFA needed
 */
export const login = async (credentials) => {
  try {
    const response = await fetch(`${API_URL}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include', // Important! This sends cookies
      body: JSON.stringify(credentials),
    });

    const data = await response.json();

    // MFA required is a valid response (200 OK with mfaRequired flag)
    if (data.mfaRequired) {
      return data; // Return { mfaRequired: true } without throwing
    }

    // Only throw error if response is not ok AND not MFA required
    if (!response.ok) {
      throw new Error(data.message || 'Login failed');
    }

    return data;
  } catch (error) {
    throw error;
  }
};

/**
 * Enable MFA for a user (generates QR code)
 * @param {string} token - Auth token
 * @returns {Promise} - Returns QR code data URL and secret
 */
export const enableMFA = async (token) => {
  try {
    const response = await fetch(`${API_URL}/mfa/enable`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      credentials: 'include',
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Failed to enable MFA');
    }

    return data;
  } catch (error) {
    throw error;
  }
};

/**
 * Verify MFA token and enable MFA
 * @param {string} token - Auth token
 * @param {string} mfaToken - 6-digit MFA code
 * @returns {Promise} - Returns success status
 */
export const verifyMFA = async (authToken, mfaToken) => {
  try {
    const response = await fetch(`${API_URL}/mfa/verify`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${authToken}`,
      },
      credentials: 'include',
      body: JSON.stringify({ token: mfaToken }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'MFA verification failed');
    }

    return data;
  } catch (error) {
    throw error;
  }
};

/**
 * Logout a user
 * @returns {Promise}
 */
export const logout = async () => {
  try {
    const response = await fetch(`${API_URL}/auth/logout`, {
      method: 'POST',
      credentials: 'include',
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Logout failed');
    }

    return data;
  } catch (error) {
    throw error;
  }
};

