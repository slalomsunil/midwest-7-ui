import React, { useState } from 'react';
import { loginUser } from '../services/api';
import { saveSession } from '../services/session';
import './LoginPage.css';

const LoginPage = ({ onLogin }) => {
  const [username, setUsername] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!username.trim()) {
      setError('Please enter a username');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      
      const response = await loginUser(username);
      saveSession(response.user);
      
      // Notify parent component of successful login
      if (onLogin) {
        onLogin(response.user);
      }
    } catch (err) {
      console.error('Login error:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleUsernameChange = (e) => {
    const value = e.target.value;
    setUsername(value);
    
    // Clear error when user starts typing
    if (error) {
      setError(null);
    }
  };

  return (
    <div className="login-page" role="main">
      <div className="login-container">
        {/* Header */}
        <div className="login-header">
          <div className="logo-container">
            <div className="logo-icon" aria-hidden="true">💬</div>
            <h1 className="app-title">Midwest Chat</h1>
          </div>
          <p className="welcome-text">Welcome! Enter your username to start chatting</p>
        </div>

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="login-form" noValidate>
          <div className="form-group">
            <label htmlFor="username" className="form-label">
              Username
            </label>
            <input
              id="username"
              type="text"
              value={username}
              onChange={handleUsernameChange}
              placeholder="Enter your username"
              className={`form-input ${error ? 'error' : ''}`}
              disabled={loading}
              maxLength={50}
              autoComplete="username"
              aria-describedby={error ? 'username-error' : 'username-help'}
              aria-invalid={error ? 'true' : 'false'}
            />
            <div id="username-help" className="form-help">
              Choose any username - no password required
            </div>
            {error && (
              <div 
                id="username-error" 
                className="form-error" 
                role="alert"
                aria-live="polite"
              >
                {error}
              </div>
            )}
          </div>

          <button
            type="submit"
            className="login-button"
            disabled={loading || !username.trim()}
            aria-describedby="login-status"
          >
            {loading ? (
              <>
                <span className="loading-spinner" aria-hidden="true"></span>
                <span>Logging in...</span>
              </>
            ) : (
              'Start Chatting'
            )}
          </button>

          <div id="login-status" className="sr-only" aria-live="polite">
            {loading ? 'Logging in, please wait' : ''}
          </div>
        </form>

        {/* Footer */}
        <div className="login-footer">
          <p className="privacy-text">
            Your username is stored locally for this session
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;