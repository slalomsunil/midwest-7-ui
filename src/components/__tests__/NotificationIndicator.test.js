// Test imports
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';

// Mock notification components and services before importing
jest.mock('../../services/notificationService', () => ({
  addNotification: jest.fn(),
  stopBlinking: jest.fn(),
  clearNotification: jest.fn(),
  getNotificationState: jest.fn(),
  clearAllNotifications: jest.fn()
}));

jest.mock('../../hooks/useMessageNotifications', () => ({
  useMessageNotifications: jest.fn()
}));

jest.mock('../../services/socketService', () => ({
  on: jest.fn(),
  off: jest.fn(),
  emit: jest.fn()
}));

describe('Notification System Components', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('NotificationIndicator', () => {
    test('should render username with normal class when no notification', async () => {
      // This test will fail until we create the NotificationIndicator component
      const { NotificationIndicator } = require('../NotificationIndicator');
      
      render(
        <NotificationIndicator
          notificationState={null}
          username="TestUser"
          onClick={() => {}}
        />
      );

      const usernameElement = screen.getByText('TestUser');
      expect(usernameElement).toHaveClass('username-normal');
    });

    test('should render username with blinking class when notification is blinking', async () => {
      const { NotificationIndicator } = require('../NotificationIndicator');
      
      const mockNotification = {
        userId: 'user1',
        hasUnreadMessage: true,
        isBlinking: true,
        lastMessageTime: Date.now()
      };

      render(
        <NotificationIndicator
          notificationState={mockNotification}
          username="TestUser"
          onClick={() => {}}
        />
      );

      const usernameElement = screen.getByText('TestUser');
      expect(usernameElement).toHaveClass('username-blinking');
    });

    test('should render username with notification class when has unread but not blinking', async () => {
      const { NotificationIndicator } = require('../NotificationIndicator');
      
      const mockNotification = {
        userId: 'user1',
        hasUnreadMessage: true,
        isBlinking: false,
        lastMessageTime: Date.now()
      };

      render(
        <NotificationIndicator
          notificationState={mockNotification}
          username="TestUser"
          onClick={() => {}}
        />
      );

      const usernameElement = screen.getByText('TestUser');
      expect(usernameElement).toHaveClass('username-has-notification');
    });

    test('should call onClick when clicked', async () => {
      const { NotificationIndicator } = require('../NotificationIndicator');
      const mockOnClick = jest.fn();

      render(
        <NotificationIndicator
          notificationState={null}
          username="TestUser"
          onClick={mockOnClick}
        />
      );

      const usernameElement = screen.getByText('TestUser');
      fireEvent.click(usernameElement);
      
      expect(mockOnClick).toHaveBeenCalledTimes(1);
    });

    test('should have proper ARIA label for accessibility', async () => {
      const { NotificationIndicator } = require('../NotificationIndicator');
      
      const mockNotification = {
        userId: 'user1',
        hasUnreadMessage: true,
        isBlinking: true,
        lastMessageTime: Date.now()
      };

      render(
        <NotificationIndicator
          notificationState={mockNotification}
          username="TestUser"
          onClick={() => {}}
        />
      );

      const usernameElement = screen.getByText('TestUser');
      expect(usernameElement).toHaveAttribute('aria-label', 'TestUser has new messages');
    });
  });
});