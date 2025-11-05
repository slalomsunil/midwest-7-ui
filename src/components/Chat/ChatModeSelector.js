import React, { useState } from 'react';
import { CHAT_MODES } from '../../utils/chatModes';
import './ChatModeSelector.css';

const ChatModeSelector = ({ selectedMode, onModeChange }) => {
  const [isOpen, setIsOpen] = useState(false);

  const handleModeSelect = (modeId) => {
    onModeChange(modeId);
    setIsOpen(false);
  };

  const selectedModeData = CHAT_MODES.find(mode => mode.id === selectedMode) || CHAT_MODES[0];

  return (
    <div className="chat-mode-selector">
      <button 
        className="mode-selector-button"
        onClick={() => setIsOpen(!isOpen)}
        type="button"
      >
        <span className="selected-mode-emoji">{selectedModeData.emoji}</span>
        <span className="selected-mode-name">{selectedModeData.name}</span>
        <span className="dropdown-arrow">{isOpen ? '▲' : '▼'}</span>
      </button>
      
      {isOpen && (
        <div className="mode-dropdown">
          {CHAT_MODES.map((mode) => (
            <button
              key={mode.id}
              className={`mode-option ${mode.id === selectedMode ? 'active' : ''}`}
              onClick={() => handleModeSelect(mode.id)}
              type="button"
            >
              <span className="mode-option-emoji">{mode.emoji}</span>
              <div className="mode-option-text">
                <div className="mode-option-name">{mode.name}</div>
                <div className="mode-option-description">{mode.description}</div>
              </div>
              {mode.id === selectedMode && (
                <span className="checkmark">✓</span>
              )}
            </button>
          ))}
        </div>
      )}
      
      {isOpen && (
        <div 
          className="mode-dropdown-overlay" 
          onClick={() => setIsOpen(false)}
        />
      )}
    </div>
  );
};

export default ChatModeSelector;
