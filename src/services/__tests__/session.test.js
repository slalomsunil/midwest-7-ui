// Tests for session management utilities
import { 
  saveSession, 
  getSession, 
  clearSession, 
  isAuthenticated 
} from '../session';

describe('Session Management', () => {
  beforeEach(() => {
    // Storage is already mocked and cleared in setupTests.js
    jest.clearAllMocks();
  });

  describe('saveSession', () => {
    it('should save user data to sessionStorage', () => {
      const userData = {
        id: 1,
        username: 'testuser',
        createdAt: '2025-01-01T00:00:00Z'
      };

      saveSession(userData);

      expect(sessionStorage.setItem).toHaveBeenCalledWith(
        'midwest_chat_session',
        expect.stringContaining('"user"')
      );
      
      const savedData = JSON.parse(sessionStorage._store['midwest_chat_session']);
      expect(savedData.user).toEqual(userData);
      expect(savedData.timestamp).toBeDefined();
    });

    it('should handle errors gracefully', () => {
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();
      sessionStorage.setItem.mockImplementationOnce(() => {
        throw new Error('Storage quota exceeded');
      });

      const userData = { id: 1, username: 'testuser' };
      
      expect(() => saveSession(userData)).not.toThrow();
      expect(consoleSpy).toHaveBeenCalledWith('Failed to save session:', expect.any(Error));
      
      consoleSpy.mockRestore();
    });
  });

  describe('getSession', () => {
    it('should retrieve user session from sessionStorage', () => {
      const userData = {
        id: 1,
        username: 'testuser',
        createdAt: '2025-01-01T00:00:00Z'
      };
      
      const sessionData = {
        user: userData,
        timestamp: new Date().toISOString()
      };
      
      sessionStorage._store['midwest_chat_session'] = JSON.stringify(sessionData);

      const result = getSession();
      expect(result).toEqual(userData);
    });

    it('should return null when no session exists', () => {
      const result = getSession();
      expect(result).toBeNull();
    });

    it('should return null when session data is invalid JSON', () => {
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();
      sessionStorage._store['midwest_chat_session'] = 'invalid json';

      const result = getSession();
      expect(result).toBeNull();
      expect(consoleSpy).toHaveBeenCalledWith('Failed to get session:', expect.any(Error));
      
      consoleSpy.mockRestore();
    });

    it('should return null when session data has no user property', () => {
      const sessionData = { timestamp: new Date().toISOString() };
      sessionStorage._store['midwest_chat_session'] = JSON.stringify(sessionData);

      const result = getSession();
      expect(result).toBeNull();
    });

    it('should handle storage errors gracefully', () => {
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();
      sessionStorage.getItem.mockImplementationOnce(() => {
        throw new Error('Storage error');
      });

      const result = getSession();
      expect(result).toBeNull();
      expect(consoleSpy).toHaveBeenCalledWith('Failed to get session:', expect.any(Error));
      
      consoleSpy.mockRestore();
    });
  });

  describe('clearSession', () => {
    it('should remove session from sessionStorage', () => {
      // Set up initial session
      sessionStorage._store['midwest_chat_session'] = JSON.stringify({
        user: { id: 1, username: 'testuser' },
        timestamp: new Date().toISOString()
      });

      clearSession();

      expect(sessionStorage.removeItem).toHaveBeenCalledWith('midwest_chat_session');
      expect(sessionStorage._store['midwest_chat_session']).toBeUndefined();
    });

    it('should handle errors gracefully', () => {
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();
      sessionStorage.removeItem.mockImplementationOnce(() => {
        throw new Error('Storage error');
      });

      expect(() => clearSession()).not.toThrow();
      expect(consoleSpy).toHaveBeenCalledWith('Failed to clear session:', expect.any(Error));
      
      consoleSpy.mockRestore();
    });
  });

  describe('isAuthenticated', () => {
    it('should return true when valid session exists', () => {
      const sessionData = {
        user: { id: 1, username: 'testuser' },
        timestamp: new Date().toISOString()
      };
      sessionStorage._store['midwest_chat_session'] = JSON.stringify(sessionData);

      expect(isAuthenticated()).toBe(true);
    });

    it('should return false when no session exists', () => {
      expect(isAuthenticated()).toBe(false);
    });

    it('should return false when session is invalid', () => {
      sessionStorage._store['midwest_chat_session'] = 'invalid json';
      expect(isAuthenticated()).toBe(false);
    });
  });

  describe('Integration scenarios', () => {
    it('should handle complete login/logout flow', () => {
      const userData = {
        id: 1,
        username: 'testuser',
        createdAt: '2025-01-01T00:00:00Z'
      };

      // Initial state - not authenticated
      expect(isAuthenticated()).toBe(false);
      expect(getSession()).toBeNull();

      // Login - save session
      saveSession(userData);
      expect(isAuthenticated()).toBe(true);
      expect(getSession()).toEqual(userData);

      // Logout - clear session
      clearSession();
      expect(isAuthenticated()).toBe(false);
      expect(getSession()).toBeNull();
    });

    it('should handle session persistence across page loads', () => {
      const userData = { id: 1, username: 'testuser' };

      // Save session (simulating login)
      saveSession(userData);

      // Simulate page reload by creating new instance
      const retrievedUser = getSession();
      expect(retrievedUser).toEqual(userData);
      expect(isAuthenticated()).toBe(true);
    });
  });
});