import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import ChatWindow from './ChatWindow';
import socket from '../../services/socketService';

// Mock the socket service
jest.mock('../../services/socketService', () => ({
  connect: jest.fn(),
  disconnect: jest.fn(),
  emit: jest.fn(),
  on: jest.fn(),
  off: jest.fn(),
}));

// Mock child components
jest.mock('./MessageList', () => {
  return function MessageList() {
    return <div data-testid="message-list">Message List</div>;
  };
});

jest.mock('./MessageInput', () => {
  return function MessageInput({ onSendMessage }) {
    return (
      <div data-testid="message-input">
        <button onClick={() => onSendMessage('Test message')}>Send</button>
      </div>
    );
  };
});

jest.mock('./ChatModeSelector', () => {
  return function ChatModeSelector({ onModeChange }) {
    return (
      <div data-testid="mode-selector">
        <button onClick={() => onModeChange('robot')}>Change Mode</button>
      </div>
    );
  };
});

describe('ChatWindow Component', () => {
  const mockCurrentUser = { id: 1, username: 'Alice' };
  const mockChatPartner = { id: 2, username: 'Bob' };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render chat window with all components', () => {
    render(<ChatWindow currentUser={mockCurrentUser} chatPartner={mockChatPartner} />);
    
    expect(screen.getByText('Bob')).toBeInTheDocument();
    expect(screen.getByTestId('message-list')).toBeInTheDocument();
    expect(screen.getByTestId('message-input')).toBeInTheDocument();
    expect(screen.getByTestId('mode-selector')).toBeInTheDocument();
  });

  it('should connect to socket on mount', () => {
    render(<ChatWindow currentUser={mockCurrentUser} chatPartner={mockChatPartner} />);
    
    expect(socket.connect).toHaveBeenCalled();
  });

  it('should emit user-join event on connection', () => {
    render(<ChatWindow currentUser={mockCurrentUser} chatPartner={mockChatPartner} />);
    
    // Simulate socket connection
    const connectHandler = socket.on.mock.calls.find(call => call[0] === 'connect')[1];
    connectHandler();
    
    expect(socket.emit).toHaveBeenCalledWith('user-join', { userId: 1 });
  });

  it('should send message when MessageInput triggers send', () => {
    render(<ChatWindow currentUser={mockCurrentUser} chatPartner={mockChatPartner} />);
    
    const sendButton = screen.getByText('Send');
    fireEvent.click(sendButton);
    
    expect(socket.emit).toHaveBeenCalledWith('send-message', expect.objectContaining({
      senderId: 1,
      receiverId: 2,
      message: 'Test message',
      mode: 'pirate'
    }));
  });

  it('should update mode when ChatModeSelector changes', () => {
    render(<ChatWindow currentUser={mockCurrentUser} chatPartner={mockChatPartner} />);
    
    const changeModeButton = screen.getByText('Change Mode');
    fireEvent.click(changeModeButton);
    
    // Send a message to verify mode changed
    const sendButton = screen.getByText('Send');
    fireEvent.click(sendButton);
    
    expect(socket.emit).toHaveBeenCalledWith('send-message', expect.objectContaining({
      mode: 'robot'
    }));
  });

  it('should show offline status initially', () => {
    render(<ChatWindow currentUser={mockCurrentUser} chatPartner={mockChatPartner} />);
    
    expect(screen.getByText('○ Offline')).toBeInTheDocument();
  });

  it('should cleanup socket on unmount', () => {
    const { unmount } = render(<ChatWindow currentUser={mockCurrentUser} chatPartner={mockChatPartner} />);
    
    unmount();
    
    // Verify all event listeners are removed on unmount
    expect(socket.off).toHaveBeenCalledTimes(9);
    // Note: We no longer call socket.disconnect() - socket is shared across app
    expect(socket.disconnect).not.toHaveBeenCalled();
  });
});
