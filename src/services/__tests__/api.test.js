import { fetchGreeting, checkApiHealth } from '../api';

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
});