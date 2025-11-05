import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
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

  it('should show toggle button for messages with transformations', () => {
    render(<MessageList messages={mockMessages} currentUserId={1} />);
    
    // Should have toggle buttons for both messages (they have different original/transformed)
    const toggleButtons = screen.getAllByText(/See original/i);
    expect(toggleButtons.length).toBe(2);
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

  describe('Toggle Original/Transformed Message', () => {
    it('should show "See original" button when message has transformed text', () => {
      render(<MessageList messages={mockMessages} currentUserId={1} />);
      
      // Check for "See original" buttons (both sent and received messages should have them)
      const toggleButtons = screen.getAllByText(/See original/i);
      expect(toggleButtons.length).toBeGreaterThan(0);
    });

    it('should toggle to show original message when "See original" is clicked', () => {
      render(<MessageList messages={mockMessages} currentUserId={1} />);
      
      // Find and click the first "See original" button
      const toggleButton = screen.getAllByText(/See original/i)[0];
      fireEvent.click(toggleButton);
      
      // Should now show the original message text prominently
      expect(screen.getByText('Hello')).toBeInTheDocument();
      
      // Button should change to "See transformed"
      expect(screen.getByText(/See transformed/i)).toBeInTheDocument();
    });

    it('should toggle back to transformed message when "See transformed" is clicked', () => {
      render(<MessageList messages={mockMessages} currentUserId={1} />);
      
      // Click to show original
      const toggleButton = screen.getAllByText(/See original/i)[0];
      fireEvent.click(toggleButton);
      
      // Click to show transformed again
      const transformedButton = screen.getByText(/See transformed/i);
      fireEvent.click(transformedButton);
      
      // Should show "See original" button again
      expect(screen.getAllByText(/See original/i).length).toBeGreaterThan(0);
    });

    it('should not show toggle button when original and transformed are the same', () => {
      const sameMessages = [
        {
          id: 1,
          senderId: 1,
          receiverId: 2,
          original: 'Hello',
          transformed: 'Hello',
          mode: 'pirate',
          createdAt: '2025-11-05T12:00:00Z'
        }
      ];
      
      render(<MessageList messages={sameMessages} currentUserId={1} />);
      
      // Should not have any toggle buttons
      expect(screen.queryByText(/See original/i)).not.toBeInTheDocument();
      expect(screen.queryByText(/See transformed/i)).not.toBeInTheDocument();
    });
  });
});
