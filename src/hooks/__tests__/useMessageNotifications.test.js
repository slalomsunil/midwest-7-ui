import { renderHook, act } from '@testing-library/react';
import { useMessageNotifications } from '../../hooks/useMessageNotifications';

// Mock the notification service and websocket service
jest.mock('../../services/notificationService', () => ({
  addNotification: jest.fn(),
  clearNotification: jest.fn(),
  clearAllNotifications: jest.fn(),
  getNotificationState: jest.fn(),
  getAllNotifications: jest.fn(() => new Map()),
  getNotificationCount: jest.fn(() => 0)
}));

jest.mock('../../services/socketService', () => ({
  on: jest.fn(),
  off: jest.fn(),
  emit: jest.fn()
}));

describe('useMessageNotifications Hook', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('should initialize with empty notifications', () => {
    const { result } = renderHook(() => useMessageNotifications('user1'));
    
    expect(result.current.notifications).toBeInstanceOf(Map);
    expect(result.current.notifications.size).toBe(0);
  });

  test('should provide clearNotification function', () => {
    const { result } = renderHook(() => useMessageNotifications('user1'));
    
    expect(typeof result.current.clearNotification).toBe('function');
  });

  test('should call clearNotification with correct userId', () => {
    const notificationService = require('../../services/notificationService');
    const { result } = renderHook(() => useMessageNotifications('user1'));
    
    act(() => {
      result.current.clearNotification('user2');
    });
    
    expect(notificationService.clearNotification).toHaveBeenCalledWith('user2');
  });

  test('should setup WebSocket event listeners on mount', () => {
    const socketService = require('../../services/socketService');
    
    renderHook(() => useMessageNotifications('user1'));
    
    expect(socketService.on).toHaveBeenCalledWith('message_notification', expect.any(Function));
    expect(socketService.on).toHaveBeenCalledWith('session_cleared', expect.any(Function));
  });

  test('should cleanup WebSocket event listeners on unmount', () => {
    const socketService = require('../../services/socketService');
    const { unmount } = renderHook(() => useMessageNotifications('user1'));
    
    unmount();
    
    expect(socketService.off).toHaveBeenCalledWith('message_notification', expect.any(Function));
    expect(socketService.off).toHaveBeenCalledWith('session_cleared', expect.any(Function));
  });

  test('should handle message notification for current user', () => {
    const notificationService = require('../../services/notificationService');
    const socketService = require('../../services/socketService');
    
    let messageNotificationHandler;
    socketService.on.mockImplementation((event, handler) => {
      if (event === 'message_notification') {
        messageNotificationHandler = handler;
      }
    });
    
    renderHook(() => useMessageNotifications('user1'));
    
    // Simulate receiving a message notification
    const notificationData = {
      fromUserId: 'user2',
      toUserId: 'user1',
      messagePreview: 'Hello!',
      timestamp: Date.now()
    };
    
    act(() => {
      messageNotificationHandler(notificationData);
    });
    
    expect(notificationService.addNotification).toHaveBeenCalledWith('user2');
  });

  test('should not handle message notification for other users', () => {
    const notificationService = require('../../services/notificationService');
    const socketService = require('../../services/socketService');
    
    let messageNotificationHandler;
    socketService.on.mockImplementation((event, handler) => {
      if (event === 'message_notification') {
        messageNotificationHandler = handler;
      }
    });
    
    renderHook(() => useMessageNotifications('user1'));
    
    // Simulate receiving a message notification for different user
    const notificationData = {
      fromUserId: 'user2',
      toUserId: 'user3', // Different user
      messagePreview: 'Hello!',
      timestamp: Date.now()
    };
    
    act(() => {
      messageNotificationHandler(notificationData);
    });
    
    expect(notificationService.addNotification).not.toHaveBeenCalled();
  });

  test('should clear all notifications on session cleared', () => {
    const notificationService = require('../../services/notificationService');
    const socketService = require('../../services/socketService');
    
    let sessionClearedHandler;
    socketService.on.mockImplementation((event, handler) => {
      if (event === 'session_cleared') {
        sessionClearedHandler = handler;
      }
    });
    
    renderHook(() => useMessageNotifications('user1'));
    
    act(() => {
      sessionClearedHandler();
    });
    
    expect(notificationService.clearAllNotifications).toHaveBeenCalled();
  });

  test('should handle message notification when currentUserId is a number but toUserId is a string', () => {
    const notificationService = require('../../services/notificationService');
    const socketService = require('../../services/socketService');
    
    let messageNotificationHandler;
    socketService.on.mockImplementation((event, handler) => {
      if (event === 'message_notification') {
        messageNotificationHandler = handler;
      }
    });
    
    // currentUserId is a NUMBER (as it comes from the database)
    renderHook(() => useMessageNotifications(123));
    
    // Backend sends toUserId as STRING (because it uses .toString())
    const notificationData = {
      fromUserId: '456',
      toUserId: '123', // STRING version of the number
      messagePreview: 'Hello!',
      timestamp: Date.now()
    };
    
    act(() => {
      messageNotificationHandler(notificationData);
    });
    
    // This should work even with type mismatch
    expect(notificationService.addNotification).toHaveBeenCalledWith('456');
  });
});