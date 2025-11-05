import React from 'react';
import './TypingIndicator.css';

const TypingIndicator = ({ username }) => {
  return (
    <div className="typing-indicator">
      <span className="typing-text">{username} is typing</span>
      <div className="typing-dots">
        <span></span>
        <span></span>
        <span></span>
      </div>
    </div>
  );
};

export default TypingIndicator;
