import NotificationService from '../../services/notificationService';

describe('NotificationService', () => {
  beforeEach(() => {
    // Clear all notifications before each test
    NotificationService.clearAllNotifications();
    // Clear any running timers
    jest.clearAllTimers();
  });

  afterEach(() => {
    // Clean up any remaining timers
    jest.runOnlyPendingTimers();
    jest.useRealTimers();
  });

  describe('addNotification', () => {
    test('should add a new notification', () => {
      NotificationService.addNotification('user1');
      
      const notification = NotificationService.getNotificationState('user1');
      expect(notification).toBeDefined();
      expect(notification.userId).toBe('user1');
      expect(notification.hasUnreadMessage).toBe(true);
      expect(notification.isBlinking).toBe(true);
    });

    test('should not duplicate notifications for same user', () => {
      NotificationService.addNotification('user1');
      NotificationService.addNotification('user1'); // Second call
      
      const notification = NotificationService.getNotificationState('user1');
      expect(notification).toBeDefined();
      expect(notification.userId).toBe('user1');
    });

    test('should set blinking to false after timeout', () => {
      jest.useFakeTimers();
      
      NotificationService.addNotification('user1');
      
      let notification = NotificationService.getNotificationState('user1');
      expect(notification.isBlinking).toBe(true);
      
      // Fast-forward time past the blink duration
      jest.advanceTimersByTime(11000); // 11 seconds (blink duration is 10 seconds)
      
      notification = NotificationService.getNotificationState('user1');
      expect(notification.isBlinking).toBe(false);
      expect(notification.hasUnreadMessage).toBe(true);
    });
  });

  describe('stopBlinking', () => {
    test('should stop blinking for a user', () => {
      NotificationService.addNotification('user1');
      NotificationService.stopBlinking('user1');
      
      const notification = NotificationService.getNotificationState('user1');
      expect(notification.isBlinking).toBe(false);
      expect(notification.hasUnreadMessage).toBe(true);
    });

    test('should handle stopping blinking for non-existent user', () => {
      expect(() => {
        NotificationService.stopBlinking('nonexistent');
      }).not.toThrow();
    });
  });

  describe('clearNotification', () => {
    test('should remove a notification completely', () => {
      NotificationService.addNotification('user1');
      NotificationService.clearNotification('user1');
      
      const notification = NotificationService.getNotificationState('user1');
      expect(notification).toBeNull();
    });

    test('should handle clearing non-existent notification', () => {
      expect(() => {
        NotificationService.clearNotification('nonexistent');
      }).not.toThrow();
    });
  });

  describe('clearAllNotifications', () => {
    test('should clear all notifications', () => {
      NotificationService.addNotification('user1');
      NotificationService.addNotification('user2');
      NotificationService.addNotification('user3');
      
      NotificationService.clearAllNotifications();
      
      expect(NotificationService.getNotificationState('user1')).toBeNull();
      expect(NotificationService.getNotificationState('user2')).toBeNull();
      expect(NotificationService.getNotificationState('user3')).toBeNull();
    });
  });

  describe('getNotificationState', () => {
    test('should return null for non-existent notification', () => {
      const notification = NotificationService.getNotificationState('nonexistent');
      expect(notification).toBeNull();
    });

    test('should return notification state for existing notification', () => {
      NotificationService.addNotification('user1');
      
      const notification = NotificationService.getNotificationState('user1');
      expect(notification).toBeDefined();
      expect(notification.userId).toBe('user1');
      expect(notification.hasUnreadMessage).toBe(true);
      expect(notification.lastMessageTime).toBeCloseTo(Date.now(), -2); // Within 100ms
    });
  });

  describe('notification timing', () => {
    test('should track notification timestamps correctly', () => {
      const beforeTime = Date.now();
      NotificationService.addNotification('user1');
      const afterTime = Date.now();
      
      const notification = NotificationService.getNotificationState('user1');
      expect(notification.lastMessageTime).toBeGreaterThanOrEqual(beforeTime);
      expect(notification.lastMessageTime).toBeLessThanOrEqual(afterTime);
    });

    test('should set blinkStartTime when notification is added', () => {
      const beforeTime = Date.now();
      NotificationService.addNotification('user1');
      const afterTime = Date.now();
      
      const notification = NotificationService.getNotificationState('user1');
      expect(notification.blinkStartTime).toBeGreaterThanOrEqual(beforeTime);
      expect(notification.blinkStartTime).toBeLessThanOrEqual(afterTime);
    });
  });
});