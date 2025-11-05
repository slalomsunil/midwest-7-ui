// API service for communicating with the backend

// Use direct backend URL - CORS is configured on the backend
const API_BASE_URL = process.env.NODE_ENV === 'production' 
  ? 'https://api-web-app-cjgyegghcqadgve7.eastus2-01.azurewebsites.net'
  : process.env.REACT_APP_API_BASE_URL || 'http://localhost:8081';

/**
 * Fetch the hello world greeting from the backend
 * @returns {Promise<{message: string}>} The greeting response
 * @throws {Error} If the request fails or returns an error.
 */
export async function fetchGreeting() {
  try {
    const response = await fetch(`${API_BASE_URL}/api/hello`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      // Try to get error message from response body
      let errorMessage = `HTTP ${response.status}`;
      try {
        const errorData = await response.json();
        errorMessage = errorData.error || errorMessage;
      } catch (e) {
        // If we can't parse the error response, use the status
      }
      throw new Error(errorMessage);
    }

    const data = await response.json();
    
    // Validate response structure
    if (!data || typeof data.message !== 'string') {
      throw new Error('Invalid response format from server');
    }

    return data;
  } catch (error) {
    // Re-throw with more context for network errors
    if (error.name === 'TypeError' && error.message.includes('fetch')) {
      throw new Error('Unable to connect to server. Please check your connection.');
    }
    throw error;
  }
}

/**
 * Authenticate user with username-only login
 * @param {string} username - The username to authenticate
 * @returns {Promise<{user: Object}>} The authenticated user data
 * @throws {Error} If authentication fails
 */
export async function loginUser(username) {
  try {
    const response = await fetch(`${API_BASE_URL}/api/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ username: username.trim() })
    });

    if (!response.ok) {
      let errorMessage = `HTTP ${response.status}`;
      try {
        const errorData = await response.json();
        errorMessage = errorData.error || errorMessage;
      } catch (e) {
        // If we can't parse the error response, use the status
      }
      throw new Error(errorMessage);
    }

    const data = await response.json();
    
    // Validate response structure
    if (!data || !data.success || !data.user) {
      throw new Error('Invalid login response from server');
    }

    return data;
  } catch (error) {
    // Re-throw with more context for network errors
    if (error.name === 'TypeError' && error.message.includes('fetch')) {
      throw new Error('Unable to connect to server. Please check your connection.');
    }
    throw error;
  }
}

/**
 * Log out the current user
 * @param {number} userId - The ID of the user logging out
 * @param {string} username - The username of the user logging out
 * @returns {Promise<void>}
 * @throws {Error} If logout fails
 */
export async function logoutUser(userId, username) {
  try {
    const response = await fetch(`${API_BASE_URL}/api/auth/logout`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ userId, username })
    });

    if (!response.ok) {
      let errorMessage = `HTTP ${response.status}`;
      try {
        const errorData = await response.json();
        errorMessage = errorData.error || errorMessage;
      } catch (e) {
        // If we can't parse the error response, use the status
      }
      throw new Error(errorMessage);
    }
  } catch (error) {
    // Re-throw with more context for network errors
    if (error.name === 'TypeError' && error.message.includes('fetch')) {
      throw new Error('Unable to connect to server. Please check your connection.');
    }
    throw error;
  }
}

/**
 * Log out user using sendBeacon for reliable cleanup during page unload
 * This is non-blocking and works even when the page is closing
 * @param {number} userId - The ID of the user logging out
 * @param {string} username - The username of the user logging out
 * @returns {boolean} True if beacon was queued successfully
 */
export function logoutUserBeacon(userId, username) {
  if (!userId && !username) {
    return false;
  }

  const url = `${API_BASE_URL}/api/auth/logout`;
  const data = JSON.stringify({ userId, username });

  // Use sendBeacon if available (modern browsers)
  if (navigator.sendBeacon) {
    try {
      // sendBeacon requires a Blob for JSON data
      const blob = new Blob([data], { type: 'application/json' });
      return navigator.sendBeacon(url, blob);
    } catch (error) {
      console.error('Beacon logout failed:', error);
      return false;
    }
  }

  // Fallback for browsers without sendBeacon support
  // Use synchronous XHR as last resort (deprecated but works during unload)
  try {
    const xhr = new XMLHttpRequest();
    xhr.open('POST', url, false); // false = synchronous
    xhr.setRequestHeader('Content-Type', 'application/json');
    xhr.send(data);
    return xhr.status === 200;
  } catch (error) {
    console.error('XHR logout fallback failed:', error);
    return false;
  }
}

/**
 * Check if the API is available
 * @returns {Promise<boolean>} True if API is responsive, false otherwise
 */
export async function checkApiHealth() {
  try {
    await fetchGreeting();
    return true;
  } catch (error) {
    console.warn('API health check failed:', error.message);
    return false;
  }
}