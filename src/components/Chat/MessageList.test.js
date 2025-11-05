import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import MessageList from './MessageList';

// Mock scrollIntoView
beforeAll(() => {
  Element.prototype.scrollIntoView = jest.fn();
});

describe('MessageList Component', () => {
  const mockMessages = [
    {
      id: 1,
      senderId: 1,
      receiverId: 2,
      original: 'Hello',
      transformed: 'Ahoy matey! ⚓',
      mode: 'pirate',
      createdAt: '2025-11-05T12:00:00Z'
    },
    {
      id: 2,
      senderId: 2,
      receiverId: 1,
      original: 'Hi there',
      transformed: 'BEEP.BOOP.HI.THERE 🤖',
      mode: 'robot',
      createdAt: '2025-11-05T12:01:00Z'
    }
  ];

  it('should render empty state when no messages', () => {
    render(<MessageList messages={[]} currentUserId={1} />);
    
    expect(screen.getByText('No messages yet. Start the conversation!')).toBeInTheDocument();
  });

  it('should render all messages', () => {
    render(<MessageList messages={mockMessages} currentUserId={1} />);
    
    expect(screen.getByText('Ahoy matey! ⚓')).toBeInTheDocument();
    expect(screen.getByText('BEEP.BOOP.HI.THERE 🤖')).toBeInTheDocument();
  });

  it('should show original message for sent messages', () => {
    render(<MessageList messages={mockMessages} currentUserId={1} />);
    
    expect(screen.getByText(/Original: Hello/)).toBeInTheDocument();
  });

  it('should display message mode', () => {
    render(<MessageList messages={mockMessages} currentUserId={1} />);
    
    expect(screen.getByText('pirate')).toBeInTheDocument();
    expect(screen.getByText('robot')).toBeInTheDocument();
  });

  it('should apply correct CSS class for sent messages', () => {
    const { container } = render(<MessageList messages={mockMessages} currentUserId={1} />);
    
    const sentMessage = container.querySelector('.message.sent');
    expect(sentMessage).toBeInTheDocument();
  });

  it('should apply correct CSS class for received messages', () => {
    const { container } = render(<MessageList messages={mockMessages} currentUserId={1} />);
    
    const receivedMessage = container.querySelector('.message.received');
    expect(receivedMessage).toBeInTheDocument();
  });
});
