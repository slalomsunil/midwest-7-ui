// Session management utilities for user authentication
const SESSION_KEY = 'midwest_chat_session';

/**
 * Save user session to sessionStorage
 * @param {Object} user - User object with id, username, etc.
 */
export const saveSession = (user) => {
  try {
    const sessionData = {
      user,
      timestamp: new Date().toISOString()
    };
    sessionStorage.setItem(SESSION_KEY, JSON.stringify(sessionData));
  } catch (error) {
    console.error('Failed to save session:', error);
  }
};

/**
 * Get current user session from sessionStorage
 * @returns {Object|null} User object if session exists, null otherwise
 */
export const getSession = () => {
  try {
    const sessionData = sessionStorage.getItem(SESSION_KEY);
    if (!sessionData) return null;
    
    const parsed = JSON.parse(sessionData);
    return parsed.user || null;
  } catch (error) {
    console.error('Failed to get session:', error);
    return null;
  }
};

/**
 * Clear user session from sessionStorage
 */
export const clearSession = () => {
  try {
    sessionStorage.removeItem(SESSION_KEY);
  } catch (error) {
    console.error('Failed to clear session:', error);
  }
};

/**
 * Check if user is currently authenticated
 * @returns {boolean} True if user is logged in, false otherwise
 */
export const isAuthenticated = () => {
  return getSession() !== null;
};