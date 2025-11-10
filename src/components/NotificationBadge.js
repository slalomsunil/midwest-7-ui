import React from 'react';
import '../styles/notifications.css';

/**
 * NotificationBadge Component
 * Displays a small badge with notification count for UI elements
 * 
 * @param {Object} props - Component props
 * @param {number} props.count - Number of notifications
 * @param {string} props.userId - User ID for accessibility
 * @param {string} [props.size='default'] - Badge size (small, default, large)
 * @param {string} [props.position='top-right'] - Badge position
 * @param {string} [props.className=''] - Additional CSS classes
 * @returns {JSX.Element} - NotificationBadge component
 */
export const NotificationBadge = ({ 
  count, 
  userId, 
  size = 'default', 
  position = 'top-right',
  className = '' 
}) => {
  if (count <= 0) return null;

  const displayCount = count > 99 ? '99+' : count.toString();

  return (
    <div
      className={`notification-badge-overlay notification-badge-overlay--${size} notification-badge-overlay--${position} ${className}`}
      role="status"
      aria-label={`${count} unread message${count === 1 ? '' : 's'} from user ${userId}`}
      title={`${count} unread message${count === 1 ? '' : 's'}`}
    >
      {displayCount}
    </div>
  );
};

export default NotificationBadge;