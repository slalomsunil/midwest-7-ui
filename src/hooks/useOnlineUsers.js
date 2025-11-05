import { useState, useEffect, useRef, useCallback } from 'react';

// Default polling interval in milliseconds (5 seconds)
const DEFAULT_POLL_INTERVAL = 5000;

// Maximum polling interval for exponential backoff (30 seconds)
const MAX_POLL_INTERVAL = 30000;

// Base multiplier for exponential backoff
const BACKOFF_MULTIPLIER = 2;

/**
 * Custom hook to fetch and maintain a list of currently online users
 * Implements polling with error handling, exponential backoff, and visibility-based throttling
 * 
 * @param {number} currentUserId - The ID of the current user to exclude from results
 * @param {number} pollInterval - Custom polling interval in milliseconds (default: 5000)
 * @returns {{
 *   users: Array<Object>,
 *   loading: boolean,
 *   error: Error|null,
 *   refresh: Function
 * }}
 */
export function useOnlineUsers(currentUserId, pollInterval = DEFAULT_POLL_INTERVAL) {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const intervalIdRef = useRef(null);
  const currentIntervalRef = useRef(pollInterval);
  const errorCountRef = useRef(0);
  const abortControllerRef = useRef(null);
  const isVisibleRef = useRef(true);

  // Get API base URL
  const getApiBaseUrl = useCallback(() => {
    return process.env.NODE_ENV === 'production'
      ? 'https://api-web-app-cjgyegghcqadgve7.eastus2-01.azurewebsites.net'
      : process.env.REACT_APP_API_BASE_URL || 'http://localhost:8081';
  }, []);

  // Fetch online users from the API
  const fetchOnlineUsers = useCallback(async () => {
    // Abort any pending request
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    // Create new abort controller for this request
    abortControllerRef.current = new AbortController();

    try {
      const apiBaseUrl = getApiBaseUrl();
      const url = currentUserId
        ? `${apiBaseUrl}/api/users/online?excludeUserId=${currentUserId}`
        : `${apiBaseUrl}/api/users/online`;

      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        signal: abortControllerRef.current.signal,
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: Failed to fetch online users`);
      }

      const data = await response.json();

      if (!data || !Array.isArray(data.users)) {
        throw new Error('Invalid response format from server');
      }

      // Success - reset error count and interval
      errorCountRef.current = 0;
      currentIntervalRef.current = pollInterval;
      
      setUsers(data.users);
      setError(null);
      setLoading(false);

    } catch (err) {
      // Ignore abort errors
      if (err.name === 'AbortError') {
        return;
      }

      // Increment error count for backoff calculation
      errorCountRef.current += 1;

      // Calculate exponential backoff
      const backoffInterval = Math.min(
        pollInterval * Math.pow(BACKOFF_MULTIPLIER, errorCountRef.current),
        MAX_POLL_INTERVAL
      );
      currentIntervalRef.current = backoffInterval;

      setError(err);
      setLoading(false);

      console.error('Error fetching online users:', err);
    }
  }, [currentUserId, pollInterval, getApiBaseUrl]);

  // Manual refresh function
  const refresh = useCallback(() => {
    setLoading(true);
    fetchOnlineUsers();
  }, [fetchOnlineUsers]);

  // Setup polling
  useEffect(() => {
    // Initial fetch with leading edge
    fetchOnlineUsers();

    // Setup polling interval
    const startPolling = () => {
      if (intervalIdRef.current) {
        clearInterval(intervalIdRef.current);
      }

      intervalIdRef.current = setInterval(() => {
        // Only poll if tab is visible
        if (isVisibleRef.current) {
          fetchOnlineUsers();
        }
      }, currentIntervalRef.current);
    };

    startPolling();

    // Listen for visibility changes to pause/resume polling
    const handleVisibilityChange = () => {
      isVisibleRef.current = !document.hidden;
      
      if (!document.hidden) {
        // Tab became visible - fetch immediately and restart polling
        fetchOnlineUsers();
        startPolling();
      } else {
        // Tab hidden - clear interval but keep the hook active
        if (intervalIdRef.current) {
          clearInterval(intervalIdRef.current);
          intervalIdRef.current = null;
        }
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    // Cleanup on unmount
    return () => {
      if (intervalIdRef.current) {
        clearInterval(intervalIdRef.current);
      }
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [fetchOnlineUsers]);

  // Update interval when error count changes (for backoff)
  useEffect(() => {
    if (intervalIdRef.current && errorCountRef.current > 0) {
      // Restart polling with new interval
      clearInterval(intervalIdRef.current);
      intervalIdRef.current = setInterval(() => {
        if (isVisibleRef.current) {
          fetchOnlineUsers();
        }
      }, currentIntervalRef.current);
    }
  }, [fetchOnlineUsers]);

  return {
    users,
    loading,
    error,
    refresh,
  };
}
