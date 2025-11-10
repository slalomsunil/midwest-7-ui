import React from 'react';
import './LoggedInUsersPanel.css';
import { useMessageNotifications } from '../hooks/useMessageNotifications';

/**
 * LoggedInUsersPanel Component
 * Displays a list of currently online users in a WhatsApp-inspired UI
 * 
 * @param {Object} props
 * @param {Array<Object>} props.users - Array of online user objects
 * @param {boolean} props.loading - Loading state
 * @param {Error|null} props.error - Error state if any
 * @param {Function} props.onUserClick - Optional callback when a user is clicked
 * @param {string} props.currentUserId - ID of the current user for notification management
 */
const LoggedInUsersPanel = ({ users, loading, error, onUserClick, currentUserId }) => {
  // Use notification hook for real-time message notifications
  const { notifications, clearNotification } = useMessageNotifications(currentUserId);
  // Render loading state
  if (loading && users.length === 0) {
    return (
      <div className="logged-in-users-panel">
        <div className="panel-header">
          <h2>Online Users</h2>
        </div>
        <div className="panel-content">
          <div className="loading-state">
            <div className="spinner"></div>
            <p>Loading users...</p>
          </div>
        </div>
      </div>
    );
  }

  // Render error state
  if (error && users.length === 0) {
    return (
      <div className="logged-in-users-panel">
        <div className="panel-header">
          <h2>Online Users</h2>
        </div>
        <div className="panel-content">
          <div className="error-state">
            <p className="error-icon">⚠️</p>
            <p className="error-message">
              Unable to load online users
            </p>
            <p className="error-detail">{error.message}</p>
          </div>
        </div>
      </div>
    );
  }

  // Render empty state
  if (users.length === 0) {
    return (
      <div className="logged-in-users-panel">
        <div className="panel-header">
          <h2>Online Users</h2>
        </div>
        <div className="panel-content">
          <div className="empty-state">
            <p className="empty-icon">💬</p>
            <p className="empty-message">
              No one else is online right now
            </p>
            <p className="empty-hint">Check back soon!</p>
          </div>
        </div>
      </div>
    );
  }

  // Get user initials for avatar
  const getInitials = (user) => {
    if (user.display_name) {
      const names = user.display_name.trim().split(' ');
      if (names.length >= 2) {
        return `${names[0][0]}${names[names.length - 1][0]}`.toUpperCase();
      }
      return names[0].substring(0, 2).toUpperCase();
    }
    return user.username.substring(0, 2).toUpperCase();
  };

  // Generate consistent color based on username
  const getAvatarColor = (username) => {
    const colors = [
      '#25D366', // WhatsApp green
      '#128C7E', // WhatsApp teal
      '#075E54', // WhatsApp dark teal
      '#34B7F1', // WhatsApp blue
      '#ECE5DD', // WhatsApp beige
      '#DCF8C6', // WhatsApp light green
    ];
    
    let hash = 0;
    for (let i = 0; i < username.length; i++) {
      hash = username.charCodeAt(i) + ((hash << 5) - hash);
    }
    
    return colors[Math.abs(hash) % colors.length];
  };

  // Format last active time
  const formatLastActive = (lastActive) => {
    if (!lastActive) return '';
    
    const date = new Date(lastActive);
    const now = new Date();
    const diff = now - date;
    
    // Less than 1 minute
    if (diff < 60000) {
      return 'Active now';
    }
    
    // Less than 1 hour
    if (diff < 3600000) {
      const minutes = Math.floor(diff / 60000);
      return `Active ${minutes}m ago`;
    }
    
    // Less than 24 hours
    if (diff < 86400000) {
      const hours = Math.floor(diff / 3600000);
      return `Active ${hours}h ago`;
    }
    
    return 'Active recently';
  };

  // Handle user click
  const handleUserClick = (user) => {
    // Clear notifications for this user when clicked (convert to string)
    if (notifications.has(String(user.id))) {
      clearNotification(String(user.id));
    }
    
    if (onUserClick) {
      onUserClick(user);
    }
  };

  // Get notification state for a user
  const getNotificationState = (userId) => {
    // Convert to string to match the notification service's storage format
    return notifications.get(String(userId));
  };

  // Determine CSS class for user item based on notification state
  const getUserItemClass = (userId) => {
    const notificationState = getNotificationState(userId);
    
    if (!notificationState || notificationState.count === 0) {
      return 'user-item';
    }

    // If user has notifications and they're currently blinking
    if (notificationState.isBlinking) {
      return 'user-item user-item--has-notification user-item--blinking';
    }

    // If user has notifications but not currently blinking
    return 'user-item user-item--has-notification';
  };

  return (
    <div className="logged-in-users-panel">
      <div className="panel-header">
        <h2>Online Users</h2>
        <span className="user-count">{users.length}</span>
      </div>
      <div className="panel-content">
        <div className="user-list">
          {users.map((user) => (
            <div
              key={user.id}
              className={getUserItemClass(user.id)}
              onClick={() => handleUserClick(user)}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  handleUserClick(user);
                }
              }}
            >
              <div className="user-avatar-container">
                {user.profile_image ? (
                  <img
                    src={user.profile_image}
                    alt={user.display_name || user.username}
                    className="user-avatar-image"
                  />
                ) : (
                  <div
                    className="user-avatar-placeholder"
                    style={{ backgroundColor: getAvatarColor(user.username) }}
                  >
                    {getInitials(user)}
                  </div>
                )}
                <div className="online-indicator"></div>
              </div>
              <div className="user-info">
                <div className="user-name">
                  {user.display_name || user.username}
                </div>
                <div className="user-status">
                  {formatLastActive(user.last_active)}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default LoggedInUsersPanel;
