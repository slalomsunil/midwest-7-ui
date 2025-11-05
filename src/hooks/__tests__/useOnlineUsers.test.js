import { renderHook, waitFor } from '@testing-library/react';
import { useOnlineUsers } from '../useOnlineUsers';

// fetch is already mocked globally in setupTests.js

describe('useOnlineUsers', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.runOnlyPendingTimers();
    jest.useRealTimers();
  });

  const mockUsers = [
    {
      id: 1,
      username: 'alice',
      display_name: 'Alice Smith',
      last_active: new Date().toISOString(),
    },
    {
      id: 2,
      username: 'bob',
      display_name: 'Bob Jones',
      last_active: new Date().toISOString(),
    },
  ];

  it('fetches online users on mount', async () => {
    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ success: true, users: mockUsers }),
    });

    const { result } = renderHook(() => useOnlineUsers(1));

    expect(result.current.loading).toBe(true);

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.users).toEqual(mockUsers);
    expect(result.current.error).toBeNull();
  });

  it('excludes current user from request', async () => {
    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ success: true, users: mockUsers }),
    });

    renderHook(() => useOnlineUsers(1));

    await waitFor(() => {
      expect(fetch).toHaveBeenCalledWith(
        expect.stringContaining('excludeUserId=1'),
        expect.any(Object)
      );
    });
  });

  it('handles fetch errors', async () => {
    const errorMessage = 'Network error';
    fetch.mockRejectedValueOnce(new Error(errorMessage));

    const { result } = renderHook(() => useOnlineUsers(1));

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.error).toBeTruthy();
    expect(result.current.error.message).toBe(errorMessage);
  });

  it('polls for updates at specified interval', async () => {
    fetch.mockResolvedValue({
      ok: true,
      json: async () => ({ success: true, users: mockUsers }),
    });

    const pollInterval = 5000;
    renderHook(() => useOnlineUsers(1, pollInterval));

    // Initial fetch
    expect(fetch).toHaveBeenCalledTimes(1);

    // Advance timers by poll interval
    jest.advanceTimersByTime(pollInterval);

    await waitFor(() => {
      expect(fetch).toHaveBeenCalledTimes(2);
    });

    // Advance again
    jest.advanceTimersByTime(pollInterval);

    await waitFor(() => {
      expect(fetch).toHaveBeenCalledTimes(3);
    });
  });

  it('implements exponential backoff on errors', async () => {
    fetch
      .mockRejectedValueOnce(new Error('Error 1'))
      .mockRejectedValueOnce(new Error('Error 2'))
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: true, users: mockUsers }),
      });

    const pollInterval = 5000;
    const { result, unmount } = renderHook(() => useOnlineUsers(1, pollInterval));

    // Initial fetch happens immediately (call 1)
    await waitFor(() => {
      expect(result.current.error).toBeTruthy();
      expect(result.current.error.message).toBe('Error 1');
    });

    const callCountAfterFirstError = fetch.mock.calls.length;

    // The interval should increase due to backoff
    // First error: interval becomes 5000 * 2 = 10000
    jest.advanceTimersByTime(10000);

    // Second fetch after backoff delay
    await waitFor(() => {
      expect(fetch.mock.calls.length).toBeGreaterThan(callCountAfterFirstError);
    });

    // Clean up
    unmount();
  });

  it('provides manual refresh function', async () => {
    fetch.mockResolvedValue({
      ok: true,
      json: async () => ({ success: true, users: mockUsers }),
    });

    const { result } = renderHook(() => useOnlineUsers(1));

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    const initialCallCount = fetch.mock.calls.length;

    // Call refresh
    result.current.refresh();

    await waitFor(() => {
      expect(fetch.mock.calls.length).toBe(initialCallCount + 1);
    });
  });

  it('aborts pending requests on unmount', async () => {
    const abortSpy = jest.spyOn(AbortController.prototype, 'abort');

    fetch.mockImplementation(() => new Promise(() => {})); // Never resolves

    const { unmount } = renderHook(() => useOnlineUsers(1));

    unmount();

    expect(abortSpy).toHaveBeenCalled();

    abortSpy.mockRestore();
  });

  it('pauses polling when tab is hidden', async () => {
    fetch.mockResolvedValue({
      ok: true,
      json: async () => ({ success: true, users: mockUsers }),
    });

    renderHook(() => useOnlineUsers(1, 5000));

    // Initial fetch
    expect(fetch).toHaveBeenCalledTimes(1);

    // Simulate tab becoming hidden
    Object.defineProperty(document, 'hidden', {
      configurable: true,
      get: () => true,
    });

    document.dispatchEvent(new Event('visibilitychange'));

    // Advance timers
    jest.advanceTimersByTime(5000);

    // Should not have made additional calls while hidden
    await waitFor(() => {
      expect(fetch).toHaveBeenCalledTimes(1);
    });
  });

  it('resumes polling when tab becomes visible', async () => {
    fetch.mockResolvedValue({
      ok: true,
      json: async () => ({ success: true, users: mockUsers }),
    });

    renderHook(() => useOnlineUsers(1, 5000));

    // Simulate tab becoming hidden
    Object.defineProperty(document, 'hidden', {
      configurable: true,
      get: () => true,
    });

    document.dispatchEvent(new Event('visibilitychange'));

    // Simulate tab becoming visible again
    Object.defineProperty(document, 'hidden', {
      configurable: true,
      get: () => false,
    });

    const callCountBeforeVisible = fetch.mock.calls.length;

    document.dispatchEvent(new Event('visibilitychange'));

    // Should fetch immediately when becoming visible
    await waitFor(() => {
      expect(fetch.mock.calls.length).toBeGreaterThan(callCountBeforeVisible);
    });
  });
});
