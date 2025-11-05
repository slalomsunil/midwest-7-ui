import React, { useState, useEffect } from 'react';
import { fetchGreeting, logoutUser, logoutUserBeacon } from '../services/api';
import { clearSession } from '../services/session';
import LoggedInUsersPanel from './LoggedInUsersPanel';
import { useOnlineUsers } from '../hooks/useOnlineUsers';
import { ChatWindow } from './Chat';
import './HomePage.css';

const HomePage = ({ user, onLogout }) => {
  const [greeting, setGreeting] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
  const [orientation, setOrientation] = useState('portrait');
  const [selectedChatUser, setSelectedChatUser] = useState(null);

  // Use the online users hook
  const { users: onlineUsers, loading: usersLoading, error: usersError } = useOnlineUsers(user?.id);

  const loadGreeting = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetchGreeting();
      setGreeting(response.message);
    } catch (err) {
      console.error('HomePage Error:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadGreeting();

    // Mobile and orientation detection
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768);
    };

    const handleOrientationChange = () => {
      setOrientation(window.innerWidth > window.innerHeight ? 'landscape' : 'portrait');
    };

    window.addEventListener('resize', handleResize);
    window.addEventListener('orientationchange', handleOrientationChange);

    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('orientationchange', handleOrientationChange);
    };
  }, []);

  // Handle browser/tab close - mark user offline
  useEffect(() => {
    const handleBeforeUnload = () => {
      // Use sendBeacon for reliable logout during page unload
      if (user?.id || user?.username) {
        logoutUserBeacon(user.id, user.username);
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [user]);

  const handleRetry = () => {
    loadGreeting();
  };

  const handleLogout = async () => {
    try {
      // Pass user data to logout endpoint so backend can mark user offline
      await logoutUser(user?.id, user?.username);
    } catch (error) {
      console.error('Logout error:', error);
      // Continue with logout even if API call fails
    } finally {
      clearSession();
      if (onLogout) {
        onLogout();
      }
    }
  };

  const handleUserClick = (selectedUser) => {
    console.log('User clicked:', selectedUser);
    setSelectedChatUser(selectedUser);
  };

  const handleCloseChat = () => {
    setSelectedChatUser(null);
  };

  return (
    <main 
      className={`home-page ${isMobile ? 'mobile-layout' : 'desktop-layout'}`}
      role="main"
      data-high-contrast-ready="true"
      data-touch-enabled="true" 
      data-orientation-ready="true"
      data-orientation={orientation}
      data-testid="homepage-container"
    >
      <div aria-live="polite" id="screen-reader-announcements" className="sr-only">
        {loading && "Loading new greeting..."}
        {error && `Error: ${error}`}
        {greeting && !loading && `New greeting received: ${greeting}`}
      </div>
      <div className="home-layout">
        {/* Online Users Panel */}
        <aside className="users-sidebar">
          <LoggedInUsersPanel 
            users={onlineUsers}
            loading={usersLoading}
            error={usersError}
            onUserClick={handleUserClick}
          />
        </aside>

        {/* Main Chat Area */}
        <div className="chat-container">
          {selectedChatUser ? (
            <div className="chat-window-wrapper">
              <button 
                className="back-button"
                onClick={handleCloseChat}
                aria-label="Back to greeting"
              >
                ← Back
              </button>
              <ChatWindow 
                currentUser={user}
                chatPartner={selectedChatUser}
              />
            </div>
          ) : (
            <>
              <div className="chat-header">
                <div className="header-content">
                  <div className="title-section">
                    <h1 className="app-title">Hello World Chat</h1>
                    <p className="app-subtitle">Welcome, {user?.username || 'User'}!</p>
                  </div>
                  <button 
                    className="logout-button focus-visible"
                    onClick={handleLogout}
                    aria-label={`Logout ${user?.username || 'user'}`}
                    data-touch-enabled="true"
                  >
                    <span className="logout-icon" aria-hidden="true">👋</span>
                    <span className="logout-text">Logout</span>
                  </button>
                </div>
              </div>
        
        <div className="chat-messages">
          {loading && (
            <div className="message-bubble loading" role="status" aria-live="polite">
              <div className="loading-dots" data-testid="loading-dots">
                <span></span>
                <span></span>
                <span></span>
              </div>
              <p className="loading-text" aria-live="polite">Loading greeting...</p>
            </div>
          )}
          
          {error && (
            <div className="message-bubble error" role="alert" aria-live="assertive">
              <p className="error-text">❌ {error}</p>
              <button 
                type="button"
                className="retry-button focus-visible" 
                onClick={handleRetry}
                aria-label="Retry loading greeting"
                data-touch-enabled="true"
                onFocus={(e) => e.target.classList.add('focus-visible')}
                onBlur={(e) => e.target.classList.remove('focus-visible')}
              >
                🔄 Try Again
              </button>
            </div>
          )}
          
          {!loading && !error && greeting && (
            <div className="message-bubble success" role="region" aria-live="polite">
              <p className="greeting-text" aria-live="polite" data-high-contrast-ready="true">👋 {greeting}</p>
              <span className="message-time">
                {new Date().toLocaleTimeString([], { 
                  hour: '2-digit', 
                  minute: '2-digit' 
                })}
              </span>
              <button 
                className="refresh-button focus-visible"
                onClick={() => {
                  if (!loading) {
                    loadGreeting();
                  }
                }}
                disabled={loading}
                aria-label="Get new greeting"
                data-touch-enabled="true"
                onFocus={(e) => e.target.classList.add('focus-visible')}
                onBlur={(e) => e.target.classList.remove('focus-visible')}
              >
                🎲 New Greeting
              </button>
            </div>
          )}
        </div>
            </>
          )}
        </div>
      </div>
    </main>
  );
};

export default HomePage;