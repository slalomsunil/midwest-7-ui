import React from 'react';
import { NOTIFICATION_CSS_CLASSES } from '../types/notification.types';
import '../styles/notifications.css';

/**
 * NotificationIndicator Component
 * Displays a username with visual notification states (normal, blinking, has notification)
 * Supports accessibility and keyboard navigation
 * 
 * @param {Object} props - Component props
 * @param {Object|null} props.notificationState - Current notification state for the user
 * @param {string} props.username - Username to display
 * @param {Function} props.onClick - Click handler for user interaction
 * @returns {JSX.Element} - NotificationIndicator component
 */
export const NotificationIndicator = ({ notificationState, username, onClick }) => {
  /**
   * Determine the appropriate CSS class based on notification state
   * @returns {string} - CSS class name
   */
  const getClassName = () => {
    if (!notificationState?.hasUnreadMessage) {
      return NOTIFICATION_CSS_CLASSES.NORMAL;
    }
    
    if (notificationState.isBlinking) {
      return NOTIFICATION_CSS_CLASSES.BLINKING;
    }
    
    return NOTIFICATION_CSS_CLASSES.HAS_NOTIFICATION;
  };

  /**
   * Generate accessibility label based on notification state
   * @returns {string} - ARIA label text
   */
  const getAriaLabel = () => {
    if (notificationState?.hasUnreadMessage) {
      return `${username} has new messages`;
    }
    
    return username;
  };

  /**
   * Handle keyboard interaction (Enter and Space)
   * @param {KeyboardEvent} event - Keyboard event
   */
  const handleKeyDown = (event) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      onClick();
    }
  };

  return (
    <span
      className={getClassName()}
      onClick={onClick}
      onKeyDown={handleKeyDown}
      role="button"
      tabIndex={0}
      aria-label={getAriaLabel()}
      title={getAriaLabel()}
    >
      {username}
    </span>
  );
};

export default NotificationIndicator;