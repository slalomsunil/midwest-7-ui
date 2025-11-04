// API service for communicating with the backend

// Use direct backend URL - CORS will be configured on the backend
const API_BASE_URL = process.env.NODE_ENV === 'production' 
  ? 'https://api-web-app-cjgyegghcqadgve7.eastus2-01.azurewebsites.net'
  : process.env.REACT_APP_API_BASE_URL || 'http://localhost:8081';

// Log the configuration for debugging
console.log('🔧 API Configuration:', {
  NODE_ENV: process.env.NODE_ENV,
  API_BASE_URL: API_BASE_URL
});

/**
 * Fetch the hello world greeting from the backend
 * @returns {Promise<{message: string}>} The greeting response
 * @throws {Error} If the request fails or returns an error.
 */
export async function fetchGreeting() {
  try {
    const url = `${API_BASE_URL}/api/hello`;
    console.log('🌐 Making API call to:', url);
    
    const response = await fetch(url, {
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

    console.log('✅ API call successful:', data);
    return data;
  } catch (error) {
    console.error('❌ API call failed:', error.message);
    
    // Re-throw with more context for network errors
    if (error.name === 'TypeError' && error.message.includes('fetch')) {
      throw new Error('Unable to connect to server. Please check your connection.');
    }
    throw error;
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