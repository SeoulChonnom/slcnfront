// Convert null, undefined, or empty values to blank string
export const isNullToBlank = (value) => {
  if (value === null || value === undefined || value === '') {
    return '';
  }
  return String(value);
};

// Safe string conversion with fallback
export const safeString = (value, fallback = '') => {
  if (value === null || value === undefined) {
    return fallback;
  }
  return String(value);
};

// Trim and sanitize string input
export const sanitizeString = (input) => {
  if (typeof input !== 'string') {
    input = String(input || '');
  }
  return input.trim().replace(/[<>]/g, '');
};

// Check if string is empty or whitespace only
export const isEmpty = (str) => {
  return !str || typeof str !== 'string' || str.trim().length === 0;
};
