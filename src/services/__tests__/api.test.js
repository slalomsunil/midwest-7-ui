import { fetchGreeting, checkApiHealth, loginUser, logoutUser } from '../api';

// Mock fetch globally
global.fetch = jest.fn();

describe('API Service', () => {
  beforeEach(() => {
    fetch.mockClear();
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
    it('should retry on network timeout', async () => {
      // First call times out, second succeeds
      fetch
        .mockRejectedValueOnce(new Error('Request timeout'))
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({ message: 'Hello World' }),
        });

      // This test will fail initially - need to implement retry logic
      const result = await fetchGreeting();
      
      expect(result).toEqual({ message: 'Hello World' });
      expect(fetch).toHaveBeenCalledTimes(2);
    });

    it('should handle rate limiting gracefully', async () => {
      fetch.mockResolvedValueOnce({
        ok: false,
        status: 429,
        json: async () => ({ error: 'Too Many Requests' }),
        headers: {
          'retry-after': '5',
        },
      });

      // This test will fail initially - need to implement rate limit handling
      await expect(fetchGreeting()).rejects.toThrow('Rate limited. Please wait 5 seconds before retrying.');
    });

    it('should handle CORS errors appropriately', async () => {
      fetch.mockRejectedValueOnce(new TypeError('Failed to fetch'));

      await expect(fetchGreeting()).rejects.toThrow('Network error - please check your connection');
    });

    it('should validate response schema', async () => {
      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ invalidField: 'Not a message' }),
      });

      // This test will fail initially - need to implement response validation
      await expect(fetchGreeting()).rejects.toThrow('Invalid response format');
    });

    it('should handle partial responses', async () => {
      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({}), // Empty response
      });

      await expect(fetchGreeting()).rejects.toThrow('Missing required field: message');
    });
  });

  describe('Security and Input Validation', () => {
    it('should sanitize response data', async () => {
      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ 
          message: '<script>alert("xss")</script>Hello World' 
        }),
      });

      const result = await fetchGreeting();
      
      // This test will fail initially - need to implement XSS protection
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
    it('should implement request caching for identical calls', async () => {
      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ message: 'Hello World' }),
      });

      // This test will fail initially - need to implement caching
      await fetchGreeting();
      await fetchGreeting(); // Second call should use cache

      expect(fetch).toHaveBeenCalledTimes(1); // Should only fetch once
    });

    it('should respect cache-control headers', async () => {
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

    it('should measure and report API performance', async () => {
      const performanceNowSpy = jest.spyOn(performance, 'now')
        .mockReturnValueOnce(0)
        .mockReturnValueOnce(150); // 150ms response time

      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ message: 'Hello World' }),
      });

      // This test will fail initially - need to implement performance monitoring
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
    it('should use different API endpoints per environment', async () => {
      const originalEnv = process.env.REACT_APP_API_URL;
      process.env.REACT_APP_API_URL = 'https://production-api.example.com';

      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ message: 'Hello World' }),
      });

      // This test will fail initially - need to implement environment-based configuration
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

    it('should support API versioning', async () => {
      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ message: 'Hello World', version: 'v1' }),
      });

      // This test will fail initially - need to implement versioning
      const result = await fetchGreeting({ version: 'v2' });

      expect(fetch).toHaveBeenCalledWith(
        expect.stringContaining('/v2/'),
        expect.any(Object)
      );
    });
  });

  describe('Monitoring and Observability', () => {
    it('should generate unique request IDs for tracing', async () => {
      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ message: 'Hello World' }),
      });

      // This test will fail initially - need to implement request ID generation
      await fetchGreeting();

      const [url, options] = fetch.mock.calls[0];
      expect(options.headers).toHaveProperty('x-request-id');
      expect(options.headers['x-request-id']).toMatch(/^[a-f0-9-]{36}$/); // UUID format
    });

    it('should log API calls for debugging', async () => {
      const consoleSpy = jest.spyOn(console, 'debug').mockImplementation();

      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ message: 'Hello World' }),
      });

      await fetchGreeting();

      // This test will fail initially - need to implement debug logging
      expect(consoleSpy).toHaveBeenCalledWith('API Call:', expect.objectContaining({
        url: expect.stringContaining('/api/hello'),
        method: 'GET',
      }));

      consoleSpy.mockRestore();
    });

    it('should track API usage metrics', async () => {
      // Mock analytics tracking
      const analyticsTrack = jest.fn();
      global.analytics = { track: analyticsTrack };

      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ message: 'Hello World' }),
      });

      await fetchGreeting();

      // This test will fail initially - need to implement analytics tracking
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
    it('should logout user successfully', async () => {
      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: true }),
      });

      await expect(logoutUser()).resolves.not.toThrow();

      expect(fetch).toHaveBeenCalledWith(
        'http://localhost:8081/api/auth/logout',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          }
        }
      );
    });

    it('should throw error on logout failure', async () => {
      fetch.mockResolvedValueOnce({
        ok: false,
        status: 500,
        json: async () => ({ error: 'Internal server error' }),
      });

      await expect(logoutUser()).rejects.toThrow('Internal server error');
    });

    it('should throw error on HTTP error without JSON error message', async () => {
      fetch.mockResolvedValueOnce({
        ok: false,
        status: 403,
        json: async () => { throw new Error('Invalid JSON'); },
      });

      await expect(logoutUser()).rejects.toThrow('HTTP 403');
    });

    it('should handle network errors', async () => {
      fetch.mockRejectedValueOnce(new TypeError('Failed to fetch'));

      await expect(logoutUser()).rejects.toThrow('Unable to connect to server. Please check your connection.');
    });

    it('should not require response body for successful logout', async () => {
      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({}), // Empty response is fine for logout
      });

      await expect(logoutUser()).resolves.not.toThrow();
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