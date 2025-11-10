import { useState, useEffect, useCallback } from 'react';
import notificationService from '../services/notificationService';
import socketService from '../services/socketService';
import { WEBSOCKET_EVENTS } from '../types/notification.types';

/**
 * Custom hook for managing message notifications
 * Integrates with WebSocket events and notification service
 * 
 * @param {string} currentUserId - The ID of the currently logged in user
 * @returns {Object} - Hook return object
 */
export const useMessageNotifications = (currentUserId) => {
  const [notifications, setNotifications] = useState(new Map());
  
  // Update local state from notification service
  const updateNotifications = useCallback(() => {
    setNotifications(new Map(notificationService.getAllNotifications()));
  }, []);

  // Clear notification handler
  const clearNotification = useCallback((userId) => {
    notificationService.clearNotification(userId);
    updateNotifications();
  }, [updateNotifications]);

  useEffect(() => {
    // WebSocket event handlers
    const handleMessageNotification = (data) => {
      // Only process notifications for the current user
      // Convert both to strings for type-safe comparison since backend sends strings
      if (String(data.toUserId) === String(currentUserId)) {
        notificationService.addNotification(data.fromUserId);
        updateNotifications();
      }
    };

    const handleSessionCleared = () => {
      notificationService.clearAllNotifications();
      updateNotifications();
    };

    const handleOnlineUsersUpdated = (userList) => {
      // Optional: Could sync notifications with online users
    };

    // Set up WebSocket listeners
    socketService.on(WEBSOCKET_EVENTS.MESSAGE_NOTIFICATION, handleMessageNotification);
    socketService.on(WEBSOCKET_EVENTS.SESSION_CLEARED, handleSessionCleared);
    socketService.on(WEBSOCKET_EVENTS.ONLINE_USERS_UPDATED, handleOnlineUsersUpdated);

    // Initial state update
    updateNotifications();

    // Cleanup function
    return () => {
      socketService.off(WEBSOCKET_EVENTS.MESSAGE_NOTIFICATION, handleMessageNotification);
      socketService.off(WEBSOCKET_EVENTS.SESSION_CLEARED, handleSessionCleared);
      socketService.off(WEBSOCKET_EVENTS.ONLINE_USERS_UPDATED, handleOnlineUsersUpdated);
    };
  }, [currentUserId, updateNotifications]);

  // Additional utility functions
  const hasNotification = useCallback((userId) => {
    return notificationService.getNotificationState(userId) !== null;
  }, []);

  const isBlinking = useCallback((userId) => {
    const state = notificationService.getNotificationState(userId);
    return state?.isBlinking === true;
  }, []);

  const getNotificationCount = useCallback(() => {
    return notificationService.getNotificationCount();
  }, []);

  const clearAllNotifications = useCallback(() => {
    notificationService.clearAllNotifications();
    updateNotifications();
  }, [updateNotifications]);

  return {
    notifications,
    clearNotification,
    hasNotification,
    isBlinking,
    getNotificationCount,
    clearAllNotifications,
    updateNotifications
  };
};