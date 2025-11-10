import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import LoggedInUsersPanel from '../LoggedInUsersPanel';
import { useMessageNotifications } from '../../hooks/useMessageNotifications';

// Mock the notification hook
jest.mock('../../hooks/useMessageNotifications', () => ({
  useMessageNotifications: jest.fn()
}));

describe('LoggedInUsersPanel with Notifications', () => {
  const mockUsers = [
    {
      id: 'user1',
      username: 'johndoe',
      display_name: 'John Doe',
      last_active: new Date().toISOString()
    },
    {
      id: 'user2',
      username: 'janesmith',
      display_name: 'Jane Smith',
      last_active: new Date(Date.now() - 300000).toISOString() // 5 minutes ago
    }
  ];

  const mockNotifications = new Map([
    ['user1', { userId: 'user1', count: 2, lastMessage: Date.now() }],
    ['user2', { userId: 'user2', count: 0, lastMessage: null }]
  ]);

  beforeEach(() => {
    jest.clearAllMocks();
    useMessageNotifications.mockReturnValue({
      notifications: mockNotifications,
      clearNotification: jest.fn()
    });
  });

  test('should display notification indicators for users with unread messages', () => {
    render(
      <LoggedInUsersPanel 
        users={mockUsers} 
        loading={false} 
        error={null} 
        currentUserId="currentuser"
      />
    );

    // Should apply notification class to user1's row
    const user1Element = screen.getByText('John Doe').closest('.user-item');
    expect(user1Element).toHaveClass('user-item--has-notification');
    
    // Should not apply notification class to user2 (count is 0)
    const user2Element = screen.getByText('Jane Smith').closest('.user-item');
    expect(user2Element).not.toHaveClass('user-item--has-notification');
  });

  test('should call clearNotification when user with notifications is clicked', () => {
    const mockClearNotification = jest.fn();
    const mockOnUserClick = jest.fn();
    
    useMessageNotifications.mockReturnValue({
      notifications: mockNotifications,
      clearNotification: mockClearNotification
    });

    render(
      <LoggedInUsersPanel 
        users={mockUsers} 
        loading={false} 
        error={null} 
        currentUserId="currentuser"
        onUserClick={mockOnUserClick}
      />
    );

    // Click on user1 who has notifications
    const user1Element = screen.getByText('John Doe').closest('.user-item');
    fireEvent.click(user1Element);

    expect(mockClearNotification).toHaveBeenCalledWith('user1');
    expect(mockOnUserClick).toHaveBeenCalledWith(mockUsers[0]);
  });

  test('should not show notifications when hook returns empty Map', () => {
    useMessageNotifications.mockReturnValue({
      notifications: new Map(),
      clearNotification: jest.fn()
    });

    render(
      <LoggedInUsersPanel 
        users={mockUsers} 
        loading={false} 
        error={null} 
        currentUserId="currentuser"
      />
    );

    // Should not have notification class on any user items
    const user1Element = screen.getByText('John Doe').closest('.user-item');
    const user2Element = screen.getByText('Jane Smith').closest('.user-item');
    
    expect(user1Element).not.toHaveClass('user-item--has-notification');
    expect(user2Element).not.toHaveClass('user-item--has-notification');
  });

  test('should handle missing currentUserId gracefully', () => {
    render(
      <LoggedInUsersPanel 
        users={mockUsers} 
        loading={false} 
        error={null}
      />
    );

    expect(screen.getByText('John Doe')).toBeInTheDocument();
    expect(screen.getByText('Jane Smith')).toBeInTheDocument();
  });

  test('should use hook with currentUserId when provided', () => {
    render(
      <LoggedInUsersPanel 
        users={mockUsers} 
        loading={false} 
        error={null} 
        currentUserId="testuser"
      />
    );

    expect(useMessageNotifications).toHaveBeenCalledWith('testuser');
  });

  test('should handle keyboard interaction with notification clearing', () => {
    const mockClearNotification = jest.fn();
    const mockOnUserClick = jest.fn();
    
    // Create fresh mock implementation for this test
    useMessageNotifications.mockImplementation(() => ({
      notifications: mockNotifications,
      clearNotification: mockClearNotification
    }));

    render(
      <LoggedInUsersPanel 
        users={mockUsers} 
        loading={false} 
        error={null} 
        currentUserId="currentuser"
        onUserClick={mockOnUserClick}
      />
    );

    // Try using keyDown instead of keyPress for better test compatibility
    const user1Element = screen.getByText('John Doe').closest('.user-item');
    
    // Simulate pressing Enter key
    fireEvent.keyDown(user1Element, { key: 'Enter', code: 'Enter', charCode: 13, keyCode: 13 });

    expect(mockClearNotification).toHaveBeenCalledWith('user1');
    expect(mockOnUserClick).toHaveBeenCalledWith(mockUsers[0]);
  });

  test('should show blinking animation for users with active blinking state', () => {
    const blinkingNotifications = new Map([
      ['user1', { userId: 'user1', count: 2, lastMessage: Date.now(), isBlinking: true }],
      ['user2', { userId: 'user2', count: 0, lastMessage: null, isBlinking: false }]
    ]);

    useMessageNotifications.mockReturnValue({
      notifications: blinkingNotifications,
      clearNotification: jest.fn()
    });

    render(
      <LoggedInUsersPanel 
        users={mockUsers} 
        loading={false} 
        error={null} 
        currentUserId="currentuser"
      />
    );

    // Should have both notification and blinking classes
    const user1Element = screen.getByText('John Doe').closest('.user-item');
    expect(user1Element).toHaveClass('user-item--has-notification');
    expect(user1Element).toHaveClass('user-item--blinking');
  });
});