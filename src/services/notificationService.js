import { DEFAULT_NOTIFICATION_CONFIG, createNotificationState, isValidNotificationState } from '../types/notification.types';

/**
 * Notification Service - Manages notification state and timing for the chat application
 * Handles blinking animations, persistent indicators, and cleanup
 */
class NotificationService {
  constructor() {
    this.notifications = new Map(); // userId -> NotificationState
    this.config = { ...DEFAULT_NOTIFICATION_CONFIG };
    this.timeouts = new Map(); // userId -> timeoutId for cleanup
  }

  /**
   * Add a notification for a user
   * @param {string} userId - User ID to add notification for
   */
  addNotification(userId) {
    const existing = this.notifications.get(userId);
    
    // Don't duplicate if already blinking
    if (existing?.isBlinking) {
      return;
    }

    // Clear any existing timeout for this user
    this._clearTimeout(userId);

    // Create new notification state
    const notificationState = createNotificationState(userId);
    this.notifications.set(userId, notificationState);

    // Set timeout to stop blinking after configured duration
    const timeoutId = setTimeout(() => {
      this.stopBlinking(userId);
    }, this.config.blinkDuration);

    this.timeouts.set(userId, timeoutId);
  }

  /**
   * Stop blinking for a user (but keep the notification indicator)
   * @param {string} userId - User ID to stop blinking for
   */
  stopBlinking(userId) {
    const notification = this.notifications.get(userId);
    if (notification) {
      notification.isBlinking = false;
      this.notifications.set(userId, notification);
      
      // Clear the timeout since we manually stopped blinking
      this._clearTimeout(userId);
    }
  }

  /**
   * Clear a notification completely
   * @param {string} userId - User ID to clear notification for
   */
  clearNotification(userId) {
    this.notifications.delete(userId);
    this._clearTimeout(userId);
  }

  /**
   * Clear all notifications
   */
  clearAllNotifications() {
    const count = this.notifications.size;
    
    // Clear all timeouts
    for (const userId of this.notifications.keys()) {
      this._clearTimeout(userId);
    }
    
    this.notifications.clear();
  }

  /**
   * Get notification state for a user
   * @param {string} userId - User ID to get state for
   * @returns {object|null} - Notification state or null if not found
   */
  getNotificationState(userId) {
    const state = this.notifications.get(userId);
    return state || null;
  }

  /**
   * Check if a user has any notification (blinking or persistent)
   * @param {string} userId - User ID to check
   * @returns {boolean} - Whether user has notification
   */
  hasNotification(userId) {
    const state = this.notifications.get(userId);
    return state?.hasUnreadMessage === true;
  }

  /**
   * Check if a user's notification is currently blinking
   * @param {string} userId - User ID to check
   * @returns {boolean} - Whether user's notification is blinking
   */
  isBlinking(userId) {
    const state = this.notifications.get(userId);
    return state?.isBlinking === true;
  }

  /**
   * Update notification configuration
   * @param {object} newConfig - New configuration options
   */
  updateConfig(newConfig) {
    this.config = { ...this.config, ...newConfig };
  }

  /**
   * Get current notification configuration
   * @returns {object} - Current configuration
   */
  getConfig() {
    return { ...this.config };
  }

  /**
   * Get count of active notifications
   * @returns {number} - Number of active notifications
   */
  getNotificationCount() {
    return this.notifications.size;
  }

  /**
   * Get all users with notifications
   * @returns {string[]} - Array of user IDs with notifications
   */
  getUsersWithNotifications() {
    return Array.from(this.notifications.keys());
  }

  /**
   * Get all notification states
   * @returns {Map} - Map of userId -> NotificationState
   */
  getAllNotifications() {
    return new Map(this.notifications);
  }

  /**
   * Validate and sanitize notification state
   * @param {any} state - State to validate
   * @returns {boolean} - Whether state is valid
   */
  validateNotificationState(state) {
    return isValidNotificationState(state);
  }

  /**
   * Clear timeout for a specific user
   * @private
   * @param {string} userId - User ID to clear timeout for
   */
  _clearTimeout(userId) {
    const timeoutId = this.timeouts.get(userId);
    if (timeoutId) {
      clearTimeout(timeoutId);
      this.timeouts.delete(userId);
    }
  }

  /**
   * Cleanup method for component unmounting
   */
  cleanup() {
    // Clear all timeouts
    for (const timeoutId of this.timeouts.values()) {
      clearTimeout(timeoutId);
    }
    this.timeouts.clear();
    this.notifications.clear();
  }
}

// Export singleton instance
export default new NotificationService();