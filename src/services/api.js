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

/**
 * Request password reset
 * @param {string} email - User email address
 * @returns {Promise} - Returns success message and reset token
 */
export const forgotPassword = async (email) => {
  try {
    const response = await fetch(`${API_URL}/auth/forgot-password`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify({ email }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Failed to send reset email');
    }

    return data;
  } catch (error) {
    throw error;
  }
};

/**
 * Reset password with token
 * @param {string} token - Reset token from email
 * @param {string} password - New password
 * @returns {Promise} - Returns success message
 */
export const resetPassword = async (token, password) => {
  try {
    const response = await fetch(`${API_URL}/auth/reset-password`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify({ token, password }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Failed to reset password');
    }

    return data;
  } catch (error) {
    throw error;
  }
};

/**
 * Verify auth token and get current user info
 * @returns {Promise} - Returns user data if token is valid
 */
export const verifyAuth = async () => {
  try {
    const token = localStorage.getItem('authToken');
    if (!token) {
      throw new Error('No token found');
    }

    const response = await fetch(`${API_URL}/auth/me`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      credentials: 'include',
    });

    const data = await response.json();

    if (!response.ok) {
      localStorage.removeItem('authToken');
      throw new Error(data.message || 'Not authorized');
    }

    return data;
  } catch (error) {
    localStorage.removeItem('authToken');
    throw error;
  }
};

/**
 * Get current authenticated user
 * @returns {Promise} - Returns current user data
 */
export const getCurrentUser = async () => {
  try {
    const token = localStorage.getItem('authToken');
    const response = await fetch(`${API_URL}/auth/me`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
      },
      credentials: 'include',
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Failed to fetch current user');
    }

    return data;
  } catch (error) {
    throw error;
  }
};

/**
 * Update current user avatar
 * @param {string} avatar - New avatar URL
 * @returns {Promise} - Returns success message
 */
export const updateUser = async (avatar) => {
  try {
    const token = localStorage.getItem('authToken');
    const response = await fetch(`${API_URL}/auth/me`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
      },
      credentials: 'include',
      body: JSON.stringify({ avatar }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Failed to update avatar');
    }

    return data;
  } catch (error) {
    throw error;
  }
};

