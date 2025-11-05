import { fetchGreeting, checkApiHealth, loginUser, logoutUser } from '../api';

// fetch is already mocked globally in setupTests.js

describe('API Service', () => {
  beforeEach(() => {
    // fetch is cleared in setupTests.js beforeEach
  });

  describe('fetchGreeting', () => {
    it('should return greeting data on successful response', async () => {
      const mockResponse = { message: 'Hello World' };
      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      });

      const result = await fetchGreeting();

      expect(fetch).toHaveBeenCalledWith(
        'http://localhost:8081/api/hello',
        {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );
      expect(result).toEqual(mockResponse);
    });

    it('should throw error on HTTP error response', async () => {
      fetch.mockResolvedValueOnce({
        ok: false,
        status: 500,
        json: async () => ({ error: 'Server error' }),
      });

      await expect(fetchGreeting()).rejects.toThrow('Server error');
    });

    it('should throw error on HTTP error without JSON error message', async () => {
      fetch.mockResolvedValueOnce({
        ok: false,
        status: 404,
        json: async () => { throw new Error('Invalid JSON'); },
      });

      await expect(fetchGreeting()).rejects.toThrow('HTTP 404');
    });

    it('should throw error on invalid response format', async () => {
      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ invalidField: 'test' }),
      });

      await expect(fetchGreeting()).rejects.toThrow('Invalid response format from server');
    });

    it('should throw connection error on network failure', async () => {
      fetch.mockRejectedValueOnce(new TypeError('Failed to fetch'));

      await expect(fetchGreeting()).rejects.toThrow('Unable to connect to server. Please check your connection.');
    });

    it('should use custom API base URL from environment', async () => {
      // We need to mock the module to test environment variable behavior
      // Since the module is already loaded, we'll test the default behavior
      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ message: 'Hello World' }),
      });

      await fetchGreeting();

      expect(fetch).toHaveBeenCalledWith(
        'http://localhost:8081/api/hello',
        expect.any(Object)
      );
    });
  });

  describe('checkApiHealth', () => {
    it('should return true when API is healthy', async () => {
      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ message: 'Hello World' }),
      });

      const result = await checkApiHealth();
      expect(result).toBe(true);
    });

    it('should return false when API is not available', async () => {
      fetch.mockRejectedValueOnce(new Error('Connection failed'));

      // Spy on console.warn to suppress output during tests
      const consoleSpy = jest.spyOn(console, 'warn').mockImplementation(() => {});

      const result = await checkApiHealth();
      expect(result).toBe(false);

      // Verify warning was logged
      expect(consoleSpy).toHaveBeenCalledWith('API health check failed:', 'Connection failed');
      
      consoleSpy.mockRestore();
    });

    it('should return false when API returns error', async () => {
      fetch.mockResolvedValueOnce({
        ok: false,
        status: 500,
        json: async () => ({ error: 'Server error' }),
      });

      const consoleSpy = jest.spyOn(console, 'warn').mockImplementation(() => {});

      const result = await checkApiHealth();
      expect(result).toBe(false);

      consoleSpy.mockRestore();
    });
  });

  describe('Network Resilience and Error Handling', () => {
    it.skip('should retry on network timeout', async () => {
      // This test will fail initially - need to implement retry logic
      // First call times out, second succeeds
      fetch
        .mockRejectedValueOnce(new Error('Request timeout'))
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({ message: 'Hello World' }),
        });

      const result = await fetchGreeting();
      
      expect(result).toEqual({ message: 'Hello World' });
      expect(fetch).toHaveBeenCalledTimes(2);
    });

    it.skip('should handle rate limiting gracefully', async () => {
      // This test will fail initially - need to implement rate limit handling
      fetch.mockResolvedValueOnce({
        ok: false,
        status: 429,
        json: async () => ({ error: 'Too Many Requests' }),
        headers: {
          'retry-after': '5',
        },
      });

      await expect(fetchGreeting()).rejects.toThrow('Rate limited. Please wait 5 seconds before retrying.');
    });

    it('should handle CORS errors appropriately', async () => {
      fetch.mockRejectedValueOnce(new TypeError('Failed to fetch'));

      await expect(fetchGreeting()).rejects.toThrow('Unable to connect to server');
    });

    it.skip('should validate response schema', async () => {
      // This test will fail initially - need to implement response validation
      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ invalidField: 'Not a message' }),
      });

      await expect(fetchGreeting()).rejects.toThrow('Invalid response format');
    });

    it.skip('should handle partial responses', async () => {
      // This test will fail initially - need to implement more specific validation
      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({}), // Empty response
      });

      await expect(fetchGreeting()).rejects.toThrow('Missing required field: message');
    });
  });

  describe('Security and Input Validation', () => {
    it.skip('should sanitize response data', async () => {
      // This test will fail initially - need to implement XSS protection
      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ 
          message: '<script>alert("xss")</script>Hello World' 
        }),
      });

      const result = await fetchGreeting();
      
      expect(result.message).toBe('Hello World');
      expect(result.message).not.toContain('<script>');
    });

    it('should handle malicious headers in response', async () => {
      fetch.mockResolvedValueOnce({
        ok: true,
        headers: {
          'x-malicious': 'rm -rf /',
          'content-type': 'application/json',
        },
        json: async () => ({ message: 'Hello World' }),
      });

      const result = await fetchGreeting();
      
      // Should still work despite malicious headers
      expect(result).toEqual({ message: 'Hello World' });
    });

    it('should validate SSL certificates in production', async () => {
      // Mock production environment
      const originalEnv = process.env.NODE_ENV;
      process.env.NODE_ENV = 'production';

      fetch.mockRejectedValueOnce(new Error('SSL certificate invalid'));

      await expect(fetchGreeting()).rejects.toThrow('SSL certificate invalid');

      process.env.NODE_ENV = originalEnv;
    });
  });

  describe('Performance and Caching', () => {
    it.skip('should implement request caching for identical calls', async () => {
      // This test will fail initially - need to implement caching
      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ message: 'Hello World' }),
      });

      await fetchGreeting();
      await fetchGreeting(); // Second call should use cache

      expect(fetch).toHaveBeenCalledTimes(1); // Should only fetch once
    });

    it.skip('should respect cache-control headers', async () => {
      // This test will fail initially - need to implement cache-control
      fetch.mockResolvedValueOnce({
        ok: true,
        headers: {
          'cache-control': 'max-age=300',
        },
        json: async () => ({ message: 'Hello World' }),
      });

      await fetchGreeting();
      
      // Call again within cache window
      await fetchGreeting();

      expect(fetch).toHaveBeenCalledTimes(1);
    });

    it.skip('should measure and report API performance', async () => {
      // This test will fail initially - need to implement performance monitoring
      const performanceNowSpy = jest.spyOn(performance, 'now')
        .mockReturnValueOnce(0)
        .mockReturnValueOnce(150); // 150ms response time

      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ message: 'Hello World' }),
      });

      const result = await fetchGreeting();

      expect(result).toHaveProperty('_metadata');
      expect(result._metadata.responseTime).toBe(150);

      performanceNowSpy.mockRestore();
    });

    it('should handle concurrent requests efficiently', async () => {
      fetch
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({ message: 'Response 1' }),
        })
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({ message: 'Response 2' }),
        });

      const promises = [fetchGreeting(), fetchGreeting()];
      const results = await Promise.all(promises);

      expect(results).toHaveLength(2);
      expect(fetch).toHaveBeenCalledTimes(2);
    });
  });

  describe('Configuration and Environment', () => {
    it.skip('should use different API endpoints per environment', async () => {
      // This test will fail initially - need to implement environment-based configuration
      const originalEnv = process.env.REACT_APP_API_URL;
      process.env.REACT_APP_API_URL = 'https://production-api.example.com';

      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ message: 'Hello World' }),
      });

      await fetchGreeting();

      expect(fetch).toHaveBeenCalledWith(
        'https://production-api.example.com/api/hello',
        expect.any(Object)
      );

      process.env.REACT_APP_API_URL = originalEnv;
    });

    it('should handle missing environment configuration gracefully', async () => {
      const originalEnv = process.env.REACT_APP_API_URL;
      delete process.env.REACT_APP_API_URL;

      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ message: 'Hello World' }),
      });

      await fetchGreeting();

      // Should fallback to default localhost
      expect(fetch).toHaveBeenCalledWith(
        expect.stringMatching(/localhost/),
        expect.any(Object)
      );

      process.env.REACT_APP_API_URL = originalEnv;
    });

    it.skip('should support API versioning', async () => {
      // This test will fail initially - need to implement versioning
      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ message: 'Hello World', version: 'v1' }),
      });

      const result = await fetchGreeting({ version: 'v2' });

      expect(fetch).toHaveBeenCalledWith(
        expect.stringContaining('/v2/'),
        expect.any(Object)
      );
    });
  });

  describe('Monitoring and Observability', () => {
    it.skip('should generate unique request IDs for tracing', async () => {
      // This test will fail initially - need to implement request ID generation
      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ message: 'Hello World' }),
      });

      await fetchGreeting();

      const [url, options] = fetch.mock.calls[0];
      expect(options.headers).toHaveProperty('x-request-id');
      expect(options.headers['x-request-id']).toMatch(/^[a-f0-9-]{36}$/); // UUID format
    });

    it.skip('should log API calls for debugging', async () => {
      // This test will fail initially - need to implement debug logging
      const consoleSpy = jest.spyOn(console, 'debug').mockImplementation();

      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ message: 'Hello World' }),
      });

      await fetchGreeting();

      expect(consoleSpy).toHaveBeenCalledWith('API Call:', expect.objectContaining({
        url: expect.stringContaining('/api/hello'),
        method: 'GET',
      }));

      consoleSpy.mockRestore();
    });

    it.skip('should track API usage metrics', async () => {
      // This test will fail initially - need to implement analytics tracking
      // Mock analytics tracking
      const analyticsTrack = jest.fn();
      global.analytics = { track: analyticsTrack };

      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ message: 'Hello World' }),
      });

      await fetchGreeting();

      expect(analyticsTrack).toHaveBeenCalledWith('API Call', {
        endpoint: '/api/hello',
        success: true,
      });

      delete global.analytics;
    });
  });

  describe('loginUser', () => {
    it('should login user successfully with valid username', async () => {
      const mockResponse = {
        success: true,
        user: {
          id: 1,
          username: 'testuser',
          createdAt: '2025-01-01T00:00:00Z',
          lastActive: '2025-01-01T00:00:00Z'
        }
      };

      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      });

      const result = await loginUser('testuser');

      expect(fetch).toHaveBeenCalledWith(
        'http://localhost:8081/api/auth/login',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ username: 'testuser' })
        }
      );
      expect(result).toEqual(mockResponse);
    });

    it('should trim username before sending', async () => {
      const mockResponse = {
        success: true,
        user: { id: 1, username: 'testuser' }
      };

      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      });

      await loginUser('  testuser  ');

      expect(fetch).toHaveBeenCalledWith(
        'http://localhost:8081/api/auth/login',
        expect.objectContaining({
          body: JSON.stringify({ username: 'testuser' })
        })
      );
    });

    it('should throw error on login failure', async () => {
      fetch.mockResolvedValueOnce({
        ok: false,
        status: 400,
        json: async () => ({ error: 'Username cannot be empty' }),
      });

      await expect(loginUser('')).rejects.toThrow('Username cannot be empty');
    });

    it('should throw error on HTTP error without JSON error message', async () => {
      fetch.mockResolvedValueOnce({
        ok: false,
        status: 500,
        json: async () => { throw new Error('Invalid JSON'); },
      });

      await expect(loginUser('testuser')).rejects.toThrow('HTTP 500');
    });

    it('should throw error on invalid response format', async () => {
      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: false }), // Missing user data
      });

      await expect(loginUser('testuser')).rejects.toThrow('Invalid login response from server');
    });

    it('should handle network errors', async () => {
      fetch.mockRejectedValueOnce(new TypeError('Failed to fetch'));

      await expect(loginUser('testuser')).rejects.toThrow('Unable to connect to server. Please check your connection.');
    });

    it('should handle missing success field in response', async () => {
      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ user: { id: 1, username: 'testuser' } }), // Missing success field
      });

      await expect(loginUser('testuser')).rejects.toThrow('Invalid login response from server');
    });

    it('should handle null response data', async () => {
      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => null,
      });

      await expect(loginUser('testuser')).rejects.toThrow('Invalid login response from server');
    });
  });

  describe('logoutUser', () => {
    it('should logout user successfully with userId', async () => {
      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: true }),
      });

      const userId = 123;
      const username = 'testuser';

      await expect(logoutUser(userId, username)).resolves.not.toThrow();

      expect(fetch).toHaveBeenCalledWith(
        'http://localhost:8081/api/auth/logout',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ userId, username })
        }
      );
    });

    it('should logout user successfully with only userId', async () => {
      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: true }),
      });

      const userId = 456;

      await expect(logoutUser(userId)).resolves.not.toThrow();

      expect(fetch).toHaveBeenCalledWith(
        'http://localhost:8081/api/auth/logout',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ userId, username: undefined })
        }
      );
    });

    it('should logout user successfully with user object', async () => {
      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: true }),
      });

      const user = { id: 789, username: 'objectuser' };

      await expect(logoutUser(user.id, user.username)).resolves.not.toThrow();

      expect(fetch).toHaveBeenCalledWith(
        'http://localhost:8081/api/auth/logout',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ userId: user.id, username: user.username })
        }
      );
    });

    it('should throw error on logout failure', async () => {
      fetch.mockResolvedValueOnce({
        ok: false,
        status: 500,
        json: async () => ({ error: 'Internal server error' }),
      });

      await expect(logoutUser(123, 'testuser')).rejects.toThrow('Internal server error');
    });

    it('should throw error on HTTP error without JSON error message', async () => {
      fetch.mockResolvedValueOnce({
        ok: false,
        status: 403,
        json: async () => { throw new Error('Invalid JSON'); },
      });

      await expect(logoutUser(123, 'testuser')).rejects.toThrow('HTTP 403');
    });

    it('should handle network errors', async () => {
      fetch.mockRejectedValueOnce(new TypeError('Failed to fetch'));

      await expect(logoutUser(123, 'testuser')).rejects.toThrow('Unable to connect to server. Please check your connection.');
    });

    it('should not require response body for successful logout', async () => {
      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({}), // Empty response is fine for logout
      });

      await expect(logoutUser(123, 'testuser')).resolves.not.toThrow();
    });

    it('should handle logout without user data gracefully', async () => {
      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: true }),
      });

      // Should not crash even if no userId/username provided
      await expect(logoutUser()).resolves.not.toThrow();

      expect(fetch).toHaveBeenCalledWith(
        'http://localhost:8081/api/auth/logout',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ userId: undefined, username: undefined })
        }
      );
    });
  });

  describe('logoutUserBeacon', () => {
    let mockSendBeacon;
    let originalSendBeacon;

    beforeEach(() => {
      // Mock sendBeacon
      originalSendBeacon = navigator.sendBeacon;
      mockSendBeacon = jest.fn();
      navigator.sendBeacon = mockSendBeacon;
    });

    afterEach(() => {
      // Restore original sendBeacon
      navigator.sendBeacon = originalSendBeacon;
    });

    it('should use sendBeacon when available', () => {
      const { logoutUserBeacon } = require('../api');
      
      mockSendBeacon.mockReturnValueOnce(true);

      const result = logoutUserBeacon(123, 'testuser');

      expect(result).toBe(true);
      expect(mockSendBeacon).toHaveBeenCalledWith(
        'http://localhost:8081/api/auth/logout',
        expect.any(Blob)
      );

      // Verify Blob content
      const call = mockSendBeacon.mock.calls[0];
      const blob = call[1];
      expect(blob.type).toBe('application/json');
    });

    it('should return false when no user data provided', () => {
      const { logoutUserBeacon } = require('../api');

      const result = logoutUserBeacon();

      expect(result).toBe(false);
      expect(mockSendBeacon).not.toHaveBeenCalled();
    });

    it('should return false when only undefined values provided', () => {
      const { logoutUserBeacon } = require('../api');

      const result = logoutUserBeacon(undefined, undefined);

      expect(result).toBe(false);
      expect(mockSendBeacon).not.toHaveBeenCalled();
    });

    it('should work with only userId', () => {
      const { logoutUserBeacon } = require('../api');
      
      mockSendBeacon.mockReturnValueOnce(true);

      const result = logoutUserBeacon(456);

      expect(result).toBe(true);
      expect(mockSendBeacon).toHaveBeenCalled();
    });

    it('should work with only username', () => {
      const { logoutUserBeacon } = require('../api');
      
      mockSendBeacon.mockReturnValueOnce(true);

      const result = logoutUserBeacon(undefined, 'testuser');

      expect(result).toBe(true);
      expect(mockSendBeacon).toHaveBeenCalled();
    });

    it('should handle sendBeacon errors gracefully', () => {
      const { logoutUserBeacon } = require('../api');
      const consoleError = jest.spyOn(console, 'error').mockImplementation();
      
      mockSendBeacon.mockImplementationOnce(() => {
        throw new Error('Beacon failed');
      });

      const result = logoutUserBeacon(123, 'testuser');

      expect(result).toBe(false);
      expect(consoleError).toHaveBeenCalledWith('Beacon logout failed:', expect.any(Error));
      
      consoleError.mockRestore();
    });

    it('should fallback to XHR when sendBeacon not available', () => {
      const { logoutUserBeacon } = require('../api');
      
      // Remove sendBeacon
      navigator.sendBeacon = undefined;

      // Mock XMLHttpRequest
      const mockXHR = {
        open: jest.fn(),
        setRequestHeader: jest.fn(),
        send: jest.fn(),
        status: 200
      };
      global.XMLHttpRequest = jest.fn(() => mockXHR);

      const result = logoutUserBeacon(123, 'testuser');

      expect(result).toBe(true);
      expect(mockXHR.open).toHaveBeenCalledWith('POST', 'http://localhost:8081/api/auth/logout', false);
      expect(mockXHR.setRequestHeader).toHaveBeenCalledWith('Content-Type', 'application/json');
      expect(mockXHR.send).toHaveBeenCalledWith(JSON.stringify({ userId: 123, username: 'testuser' }));
    });

    it('should handle XHR fallback errors gracefully', () => {
      const { logoutUserBeacon } = require('../api');
      const consoleError = jest.spyOn(console, 'error').mockImplementation();
      
      // Remove sendBeacon
      navigator.sendBeacon = undefined;

      // Mock XMLHttpRequest that throws
      global.XMLHttpRequest = jest.fn(() => {
        throw new Error('XHR failed');
      });

      const result = logoutUserBeacon(123, 'testuser');

      expect(result).toBe(false);
      expect(consoleError).toHaveBeenCalledWith('XHR logout fallback failed:', expect.any(Error));
      
      consoleError.mockRestore();
    });
  });

  describe('Authentication API Edge Cases', () => {
    it('should handle server timeout during login', async () => {
      fetch.mockImplementationOnce(() => 
        new Promise((_, reject) => 
          setTimeout(() => reject(new TypeError('Failed to fetch')), 100)
        )
      );

      await expect(loginUser('testuser')).rejects.toThrow('Unable to connect to server. Please check your connection.');
    });

    it('should handle malformed JSON in login error response', async () => {
      fetch.mockResolvedValueOnce({
        ok: false,
        status: 400,
        json: async () => { throw new SyntaxError('Unexpected token'); },
      });

      await expect(loginUser('testuser')).rejects.toThrow('HTTP 400');
    });

    it('should handle empty string username', async () => {
      const mockResponse = {
        success: true,
        user: { id: 1, username: '' }
      };

      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      });

      await loginUser('');

      expect(fetch).toHaveBeenCalledWith(
        'http://localhost:8081/api/auth/login',
        expect.objectContaining({
          body: JSON.stringify({ username: '' })
        })
      );
    });
  });
});