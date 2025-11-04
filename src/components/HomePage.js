import React, { useState, useEffect } from 'react';
import { fetchGreeting } from '../services/api';
import './HomePage.css';

const HomePage = () => {
  const [greeting, setGreeting] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const loadGreeting = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetchGreeting();
      setGreeting(response.message);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadGreeting();
  }, []);

  const handleRetry = () => {
    loadGreeting();
  };

  return (
    <div className="homepage">
      <div className="chat-container">
        <div className="chat-header">
          <h1 className="app-title">Hello World Chat</h1>
          <p className="app-subtitle">WhatsApp-style Greeting</p>
        </div>
        
        <div className="chat-messages">
          {loading && (
            <div className="message-bubble loading">
              <div className="loading-dots" data-testid="loading-dots">
                <span></span>
                <span></span>
                <span></span>
              </div>
              <p className="loading-text">Loading greeting...</p>
            </div>
          )}
          
          {error && (
            <div className="message-bubble error">
              <p className="error-text">❌ {error}</p>
              <button 
                className="retry-button" 
                onClick={handleRetry}
                aria-label="Retry loading greeting"
              >
                🔄 Try Again
              </button>
            </div>
          )}
          
          {!loading && !error && greeting && (
            <div className="message-bubble success">
              <p className="greeting-text">👋 {greeting}</p>
              <span className="message-time">
                {new Date().toLocaleTimeString([], { 
                  hour: '2-digit', 
                  minute: '2-digit' 
                })}
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default HomePage;