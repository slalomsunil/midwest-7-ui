// API service for communicating with the backend

// Environment variable configuration for Azure Static Web Apps
// In development: Use localhost directly
// In production: Use proxied route through Static Web App to avoid CORS
const API_BASE_URL = process.env.NODE_ENV === 'production' 
  ? '' // Use relative URLs in production (proxied through Static Web App)
  : process.env.REACT_APP_API_BASE_URL || 'http://localhost:8081';

// Log the configuration for debugging (remove in production)
if (process.env.NODE_ENV === 'development') {
  console.log('🔧 API Configuration:', {
    NODE_ENV: process.env.NODE_ENV,
    API_BASE_URL: API_BASE_URL
  });
}

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

    console.log('📡 Response status:', response.status);
    console.log('📡 Response headers:', Object.fromEntries(response.headers.entries()));

    if (!response.ok) {
      // Try to get error message from response body
      let errorMessage = `HTTP ${response.status}`;
      try {
        const responseText = await response.text();
        console.log('❌ Error response body:', responseText.substring(0, 200));
        
        // Try to parse as JSON first
        try {
          const errorData = JSON.parse(responseText);
          errorMessage = errorData.error || errorMessage;
        } catch (e) {
          // If it's HTML (like <!doctype), show helpful message
          if (responseText.trim().toLowerCase().startsWith('<!doctype') || 
              responseText.trim().toLowerCase().startsWith('<html')) {
            errorMessage = `API endpoint returned HTML instead of JSON. Check if the API URL is correct and the endpoint exists.`;
          } else {
            errorMessage = responseText.substring(0, 100);
          }
        }
      } catch (e) {
        // If we can't read the response body, use the status
      }
      throw new Error(errorMessage);
    }

    const responseText = await response.text();
    console.log('✅ Raw response:', responseText.substring(0, 200));
    
    // Try to parse as JSON
    try {
      const data = JSON.parse(responseText);
      
      // Validate response structure
      if (!data || typeof data.message !== 'string') {
        throw new Error('Invalid response format from server');
      }

      return data;
    } catch (parseError) {
      console.error('❌ JSON parse error:', parseError);
      console.log('📄 Response that failed to parse:', responseText.substring(0, 200));
      throw new Error(`API returned invalid JSON: ${parseError.message}`);
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