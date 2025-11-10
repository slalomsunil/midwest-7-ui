/**
 * Notification Types and Interfaces
 * These type definitions help maintain consistency across the notification system
 */

/**
 * @typedef {Object} NotificationState
 * @property {string} userId - The user ID for this notification
 * @property {boolean} hasUnreadMessage - Whether the user has unread messages
 * @property {boolean} isBlinking - Whether the notification is currently blinking
 * @property {number} lastMessageTime - Timestamp of the last message
 * @property {number} [blinkStartTime] - Timestamp when blinking started
 */

/**
 * @typedef {Object} MessageNotification
 * @property {string} fromUserId - ID of the user who sent the message
 * @property {string} toUserId - ID of the user who should receive the notification
 * @property {string} messagePreview - Preview text of the message (first 50 chars)
 * @property {number} timestamp - Timestamp when the message was sent
 */

/**
 * @typedef {Object} NotificationConfig
 * @property {number} blinkDuration - How long to blink in milliseconds
 * @property {number} blinkInterval - Interval between blink cycles in milliseconds
 * @property {number} persistentIndicatorTimeout - How long to show persistent indicator
 */

/**
 * Default notification configuration
 * @type {NotificationConfig}
 */
export const DEFAULT_NOTIFICATION_CONFIG = {
  blinkDuration: 10000, // 10 seconds
  blinkInterval: 1000,  // 1 second
  persistentIndicatorTimeout: 30000 // 30 seconds
};

/**
 * WebSocket event types for notifications
 */
export const WEBSOCKET_EVENTS = {
  MESSAGE_NOTIFICATION: 'message_notification',
  SESSION_CLEARED: 'session_cleared',
  ONLINE_USERS_UPDATED: 'online_users_updated',
  NOTIFICATION_READ: 'notification_read'
};

/**
 * CSS class names for notification states
 */
export const NOTIFICATION_CSS_CLASSES = {
  NORMAL: 'username-normal',
  BLINKING: 'username-blinking', 
  HAS_NOTIFICATION: 'username-has-notification'
};

/**
 * Validates a notification state object
 * @param {any} state - The state to validate
 * @returns {boolean} - Whether the state is valid
 */
export const isValidNotificationState = (state) => {
  if (!state || typeof state !== 'object') return false;
  
  return (
    typeof state.userId === 'string' &&
    typeof state.hasUnreadMessage === 'boolean' &&
    typeof state.isBlinking === 'boolean' &&
    typeof state.lastMessageTime === 'number' &&
    (state.blinkStartTime === undefined || typeof state.blinkStartTime === 'number')
  );
};

/**
 * Validates a message notification object
 * @param {any} notification - The notification to validate
 * @returns {boolean} - Whether the notification is valid
 */
export const isValidMessageNotification = (notification) => {
  if (!notification || typeof notification !== 'object') return false;
  
  return (
    typeof notification.fromUserId === 'string' &&
    typeof notification.toUserId === 'string' &&
    typeof notification.messagePreview === 'string' &&
    typeof notification.timestamp === 'number'
  );
};

/**
 * Creates a new notification state
 * @param {string} userId - The user ID
 * @returns {NotificationState} - New notification state
 */
export const createNotificationState = (userId) => ({
  userId,
  hasUnreadMessage: true,
  isBlinking: true,
  lastMessageTime: Date.now(),
  blinkStartTime: Date.now()
});

/**
 * Creates a message notification
 * @param {string} fromUserId - Sender user ID
 * @param {string} toUserId - Recipient user ID  
 * @param {string} messagePreview - Message preview text
 * @returns {MessageNotification} - New message notification
 */
export const createMessageNotification = (fromUserId, toUserId, messagePreview) => ({
  fromUserId,
  toUserId,
  messagePreview: messagePreview.substring(0, 50), // Limit to 50 characters
  timestamp: Date.now()
});