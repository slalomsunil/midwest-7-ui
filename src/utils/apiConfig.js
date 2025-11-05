/**
 * Get the API base URL based on environment
 * Priority:
 * 1. Environment variable (REACT_APP_API_BASE_URL)
 * 2. Production detection (if not localhost)
 * 3. Local development fallback
 */
export const getApiBaseUrl = () => {
  // If environment variable is set, use it
  if (process.env.REACT_APP_API_BASE_URL) {
    return process.env.REACT_APP_API_BASE_URL;
  }
  
  // In production (Azure), use the known backend URL
  if (window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1') {
    return 'https://api-web-app-cjgyegghcqadgve7.eastus2-01.azurewebsites.net';
  }
  
  // Local development
  return 'http://localhost:8081';
};

export const API_BASE_URL = getApiBaseUrl();
