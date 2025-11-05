import React, { useState, useEffect } from 'react';
import socket from '../../services/socketService';
import MessageList from './MessageList';
import MessageInput from './MessageInput';
import ChatModeSelector from './ChatModeSelector';
import './ChatWindow.css';

const ChatWindow = ({ currentUser, chatPartner }) => {
  const [messages, setMessages] = useState([]);
  const [selectedMode, setSelectedMode] = useState('pirate');
  const [isConnected, setIsConnected] = useState(false);
  const [isPartnerOnline, setIsPartnerOnline] = useState(false);

  useEffect(() => {
    // Load existing messages from backend
    const loadMessages = async () => {
      try {
        const response = await fetch(`http://localhost:8081/api/chat/messages?userId=${currentUser.id}&partnerId=${chatPartner.id}`);
        if (response.ok) {
          const data = await response.json();
          setMessages(data.messages || []);
        }
      } catch (error) {
        console.error('Error loading messages:', error);
      }
    };

    // Check partner's online status
    const checkPartnerStatus = async () => {
      try {
        const response = await fetch(`http://localhost:8081/api/users/${chatPartner.id}`);
        if (response.ok) {
          const data = await response.json();
          setIsPartnerOnline(data.is_online === 1);
        }
      } catch (error) {
        console.error('Error checking partner status:', error);
      }
    };

    loadMessages();
    checkPartnerStatus();

    // Connect to Socket.io if not already connected
    if (!socket.connected) {
      socket.connect();
    }

    // Ensure user is joined to their room
    socket.emit('user-join', { userId: currentUser.id });

    // Handle connection
    const onConnect = () => {
      setIsConnected(true);
      socket.emit('user-join', { userId: currentUser.id });
    };

    // Handle disconnection
    const onDisconnect = () => {
      setIsConnected(false);
    };

    // Handle new messages
    const onNewMessage = (messageData) => {
      // Only add if it's for this chat
      if ((messageData.senderId === chatPartner.id && messageData.receiverId === currentUser.id) ||
          (messageData.senderId === currentUser.id && messageData.receiverId === chatPartner.id)) {
        setMessages(prev => {
          // Avoid duplicates
          if (prev.some(m => m.id === messageData.id)) {
            return prev;
          }
          return [...prev, messageData];
        });
      }
    };

    // Handle message sent confirmation
    const onMessageSent = (data) => {
      // Update the last message with the transformed version
      setMessages(prev => {
        const updated = [...prev];
        const lastMessage = updated[updated.length - 1];
        if (lastMessage && lastMessage.id === undefined) {
          lastMessage.id = data.id;
          lastMessage.transformed = data.transformed;
        }
        return updated;
      });
    };

    // Handle message errors
    const onMessageError = (error) => {
      console.error('Message error:', error);
      alert(`Error sending message: ${error.error}`);
    };

    // Handle partner online status
    const onUserOnline = (data) => {
      if (data.userId === chatPartner.id) {
        setIsPartnerOnline(true);
      }
    };

    const onUserOffline = (data) => {
      if (data.userId === chatPartner.id) {
        setIsPartnerOnline(false);
      }
    };

    socket.on('connect', onConnect);
    socket.on('disconnect', onDisconnect);
    socket.on('new-message', onNewMessage);
    socket.on('message-sent', onMessageSent);
    socket.on('message-error', onMessageError);
    socket.on('user-online', onUserOnline);
    socket.on('user-offline', onUserOffline);

    // Set initial connection state
    setIsConnected(socket.connected);

    // Cleanup on unmount - DON'T disconnect, just remove listeners
    return () => {
      socket.off('connect', onConnect);
      socket.off('disconnect', onDisconnect);
      socket.off('new-message', onNewMessage);
      socket.off('message-sent', onMessageSent);
      socket.off('message-error', onMessageError);
      socket.off('user-online', onUserOnline);
      socket.off('user-offline', onUserOffline);
      // Don't disconnect - socket is shared across app
    };
  }, [currentUser.id, chatPartner.id]);

  const handleSendMessage = (message) => {
    if (!message.trim()) return;

    // Optimistically add message to UI
    const tempMessage = {
      senderId: currentUser.id,
      receiverId: chatPartner.id,
      original: message,
      transformed: message + ' ⏳', // Temporary until we get transformed version
      mode: selectedMode,
      createdAt: new Date().toISOString()
    };
    setMessages(prev => [...prev, tempMessage]);

    // Send to server
    socket.emit('send-message', {
      senderId: currentUser.id,
      receiverId: chatPartner.id,
      message: message,
      mode: selectedMode
    });
  };

  const handleModeChange = (mode) => {
    setSelectedMode(mode);
  };

  return (
    <div className="chat-window">
      <div className="chat-header">
        <div className="chat-partner-info">
          <h2>{chatPartner.username}</h2>
          <span className={`status ${isPartnerOnline ? 'online' : 'offline'}`}>
            {isPartnerOnline ? '● Online' : '○ Offline'}
          </span>
        </div>
        <ChatModeSelector 
          selectedMode={selectedMode} 
          onModeChange={handleModeChange} 
        />
      </div>
      
      <MessageList 
        messages={messages} 
        currentUserId={currentUser.id} 
      />
      
      <MessageInput 
        onSendMessage={handleSendMessage}
        selectedMode={selectedMode}
        disabled={!isConnected}
      />
      
      {!isConnected && (
        <div className="connection-status">
          <span className="status-indicator">⚠️ Reconnecting...</span>
        </div>
      )}
    </div>
  );
};

export default ChatWindow;
