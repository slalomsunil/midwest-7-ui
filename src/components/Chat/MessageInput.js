import React, { useState } from 'react';
import { getChatModeById } from '../../utils/chatModes';
import './MessageInput.css';

const MessageInput = ({ onSendMessage, selectedMode, disabled }) => {
  const [message, setMessage] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (message.trim() && !disabled) {
      onSendMessage(message);
      setMessage('');
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  const mode = getChatModeById(selectedMode);

  return (
    <form className="message-input-container" onSubmit={handleSubmit}>
      <div className="mode-indicator">
        <span className="mode-emoji">{mode.emoji}</span>
        <span className="mode-name">{mode.name}</span>
      </div>
      <div className="input-wrapper">
        <textarea
          className="message-input"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder={disabled ? 'Connecting...' : `Type a message in ${mode.name}...`}
          disabled={disabled}
          rows="1"
        />
        <button 
          type="submit" 
          className="send-button"
          disabled={!message.trim() || disabled}
        >
          <svg 
            width="24" 
            height="24" 
            viewBox="0 0 24 24" 
            fill="currentColor"
          >
            <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"/>
          </svg>
        </button>
      </div>
    </form>
  );
};

export default MessageInput;
