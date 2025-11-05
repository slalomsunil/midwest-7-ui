import React, { useEffect, useRef, useState } from 'react';
import './MessageList.css';

const MessageList = ({ messages, currentUserId }) => {
  const messagesEndRef = useRef(null);
  const [showingOriginal, setShowingOriginal] = useState(new Set());

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const formatTime = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  const toggleMessageView = (messageId) => {
    setShowingOriginal(prev => {
      const newSet = new Set(prev);
      if (newSet.has(messageId)) {
        newSet.delete(messageId);
      } else {
        newSet.add(messageId);
      }
      return newSet;
    });
  };

  const renderMessage = (message, index) => {
    const isSentByMe = message.senderId === currentUserId;
    const messageClass = isSentByMe ? 'message sent' : 'message received';
    const isShowingOriginal = showingOriginal.has(message.id || index);
    const hasTransformation = message.original && message.transformed && message.original !== message.transformed;

    return (
      <div key={message.id || index} className={messageClass}>
        <div className="message-content">
          <div className="message-text transformed">
            {isShowingOriginal ? message.original : message.transformed}
          </div>
          {hasTransformation && (
            <button 
              className="toggle-message-btn"
              onClick={() => toggleMessageView(message.id || index)}
              aria-label={isShowingOriginal ? "See transformed message" : "See original message"}
            >
              {isShowingOriginal ? '↩ See transformed' : '👁 See original'}
            </button>
          )}
          {isSentByMe && message.original && message.original !== message.transformed && !hasTransformation && (
            <div className="message-text original">
              Original: {message.original}
            </div>
          )}
          <div className="message-meta">
            <span className="message-mode">{message.mode}</span>
            <span className="message-time">{formatTime(message.createdAt)}</span>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="message-list">
      {messages.length === 0 ? (
        <div className="empty-state">
          <p>No messages yet. Start the conversation!</p>
        </div>
      ) : (
        messages.map((message, index) => renderMessage(message, index))
      )}
      <div ref={messagesEndRef} />
    </div>
  );
};

export default MessageList;
