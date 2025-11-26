/**
 * Validates a password against the app's requirements
 * @param {string} password - The password to validate
 * @returns {Object} - Validation result with individual checks and isValid flag
 */
export const validatePassword = (password) => {
  const validation = {
    length: password.length >= 10,
    uppercase: /[A-Z]/.test(password),
    lowercase: /[a-z]/.test(password),
    number: /\d/.test(password),
    special: /[@$!%*?&]/.test(password)
  };
  
  return {
    ...validation,
    isValid: Object.values(validation).every(Boolean),
    strengthScore: Object.values(validation).filter(Boolean).length
  };
};

/**
 * Gets a human-readable error message for password validation
 * @param {Object} validation - The validation object from validatePassword
 * @returns {string} - Error message listing missing requirements
 */
export const getPasswordErrorMessage = (validation) => {
  const missing = [];
  if (!validation.length) missing.push('at least 10 characters');
  if (!validation.uppercase) missing.push('one uppercase letter');
  if (!validation.lowercase) missing.push('one lowercase letter');
  if (!validation.number) missing.push('one number');
  if (!validation.special) missing.push('one special character (@$!%*?&)');
  
  return missing.length > 0 
    ? `Password must contain: ${missing.join(', ')}.`
    : '';
};

/**
 * Password requirements as an array for UI display
 */
export const passwordRequirements = [
  { key: 'length', label: 'At least 10 characters' },
  { key: 'uppercase', label: 'One uppercase letter (A–Z)' },
  { key: 'lowercase', label: 'One lowercase letter (a–z)' },
  { key: 'number', label: 'One number (0–9)' },
  { key: 'special', label: 'One special (@$!%*?&)' }
];

