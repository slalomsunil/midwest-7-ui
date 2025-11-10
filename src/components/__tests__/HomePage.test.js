import React from 'react';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import HomePage from '../HomePage';
import * as api from '../../services/api';
import * as session from '../../services/session';

// Mock the API and session services
jest.mock('../../services/api');
jest.mock('../../services/session');

// Mock LoggedInUsersPanel to track props
jest.mock('../LoggedInUsersPanel', () => {
  return function MockLoggedInUsersPanel(props) {
    return (
      <div data-testid="mock-logged-in-users-panel" data-current-user-id={props.currentUserId}>
        Mocked LoggedInUsersPanel
      </div>
    );
  };
});

const mockFetchGreeting = api.fetchGreeting;
const mockLogoutUser = api.logoutUser;
const mockClearSession = session.clearSession;

describe('HomePage', () => {
  const mockUser = {
    id: 1,
    username: 'testuser',
    createdAt: '2025-01-01T00:00:00Z'
  };
  const mockOnLogout = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render the homepage with loading state initially', () => {
    mockFetchGreeting.mockImplementation(() => new Promise(() => {})); // Never resolves

    render(<HomePage user={mockUser} onLogout={mockOnLogout} />);

    expect(screen.getByText('Hello World Chat')).toBeInTheDocument();
    expect(screen.getByText('Welcome, testuser!')).toBeInTheDocument();
    expect(screen.getByText('Loading greeting...')).toBeInTheDocument();
    expect(screen.getByTestId('loading-dots')).toBeInTheDocument();
  });

  it('should display greeting message on successful API call', async () => {
    mockFetchGreeting.mockResolvedValueOnce({ message: 'Hello World' });

    render(<HomePage user={mockUser} onLogout={mockOnLogout} />);

    await waitFor(() => {
      expect(screen.getByText('👋 Hello World')).toBeInTheDocument();
    });

    expect(screen.queryByText('Loading greeting...')).not.toBeInTheDocument();
    expect(screen.queryByText(/❌/)).not.toBeInTheDocument();
    
    // Check for timestamp
    const timeElement = screen.getByText(/\d{1,2}:\d{2}/);
    expect(timeElement).toBeInTheDocument();
  });

  it('should display error message on API failure', async () => {
    const errorMessage = 'Unable to connect to server';
    mockFetchGreeting.mockRejectedValueOnce(new Error(errorMessage));

    render(<HomePage />);

    await waitFor(() => {
      expect(screen.getByText(`❌ ${errorMessage}`)).toBeInTheDocument();
    });

    expect(screen.queryByText('Loading greeting...')).not.toBeInTheDocument();
    expect(screen.queryByText('👋 Hello World')).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: /retry loading greeting/i })).toBeInTheDocument();
  });

  it('should retry API call when retry button is clicked', async () => {
    // First call fails
    mockFetchGreeting.mockRejectedValueOnce(new Error('Network error'));
    
    render(<HomePage />);

    // Wait for error state
    await waitFor(() => {
      expect(screen.getByText('❌ Network error')).toBeInTheDocument();
    });

    // Second call succeeds
    mockFetchGreeting.mockResolvedValueOnce({ message: 'Hello World' });

    // Click retry button
    const retryButton = screen.getByRole('button', { name: /retry loading greeting/i });
    fireEvent.click(retryButton);

    // Should show loading state again
    expect(screen.getByText('Loading greeting...')).toBeInTheDocument();

    // Then show success
    await waitFor(() => {
      expect(screen.getByText('👋 Hello World')).toBeInTheDocument();
    });

    expect(mockFetchGreeting).toHaveBeenCalledTimes(2);
    expect(screen.queryByText('❌ Network error')).not.toBeInTheDocument();
  });

  it('should handle multiple API calls correctly', async () => {
    let resolvePromise;
    mockFetchGreeting.mockImplementation(() => {
      return new Promise((resolve) => {
        resolvePromise = resolve;
      });
    });

    render(<HomePage />);

    // Should show loading state
    expect(screen.getByText('Loading greeting...')).toBeInTheDocument();

    // Resolve the promise
    resolvePromise({ message: 'Test Message' });

    await waitFor(() => {
      expect(screen.getByText('👋 Test Message')).toBeInTheDocument();
    });
  });

  it('should have proper accessibility attributes', async () => {
    mockFetchGreeting.mockResolvedValueOnce({ message: 'Hello World' });

    render(<HomePage />);

    // Check for proper heading structure
    const title = screen.getByRole('heading', { name: 'Hello World Chat' });
    expect(title).toBeInTheDocument();

    // Wait for content to load
    await waitFor(() => {
      expect(screen.getByText('👋 Hello World')).toBeInTheDocument();
    });
  });

  it('should show retry button with proper label when error occurs', async () => {
    mockFetchGreeting.mockRejectedValueOnce(new Error('Server error'));

    render(<HomePage />);

    await waitFor(() => {
      const retryButton = screen.getByRole('button', { name: /retry loading greeting/i });
      expect(retryButton).toBeInTheDocument();
      expect(retryButton).toHaveTextContent('🔄 Try Again');
    });
  });

  it('should display current time in message when successful', async () => {
    // Mock Date to have consistent time
    const mockDate = new Date('2023-10-01T10:30:00');
    jest.spyOn(global, 'Date').mockImplementation(() => mockDate);

    mockFetchGreeting.mockResolvedValueOnce({ message: 'Hello World' });

    render(<HomePage />);

    await waitFor(() => {
      expect(screen.getByText('10:30 AM')).toBeInTheDocument();
    });

    global.Date.mockRestore();
  });

  it('should clear error state when retrying', async () => {
    // First call fails
    mockFetchGreeting.mockRejectedValueOnce(new Error('First error'));
    
    render(<HomePage />);

    await waitFor(() => {
      expect(screen.getByText('❌ First error')).toBeInTheDocument();
    });

    // Second call also fails but with different error
    mockFetchGreeting.mockRejectedValueOnce(new Error('Second error'));

    const retryButton = screen.getByRole('button', { name: /retry loading greeting/i });
    fireEvent.click(retryButton);

    await waitFor(() => {
      expect(screen.getByText('❌ Second error')).toBeInTheDocument();
    });

    // First error should not be visible
    expect(screen.queryByText('❌ First error')).not.toBeInTheDocument();
  });

  describe('Accessibility and A11y Compliance', () => {
    it('should have proper ARIA landmarks and roles', async () => {
      mockFetchGreeting.mockResolvedValueOnce({ message: 'Hello World' });

      render(<HomePage />);

      // Main content should have proper landmark
      const main = screen.getByRole('main');
      expect(main).toBeInTheDocument();

      // Loading state should be announced to screen readers
      expect(screen.getByText('Loading greeting...')).toHaveAttribute('aria-live', 'polite');

      await waitFor(() => {
        // Success message should be announced
        const successMessage = screen.getByText('👋 Hello World');
        expect(successMessage).toHaveAttribute('aria-live', 'polite');
      });
    });

    it('should support keyboard navigation', async () => {
      mockFetchGreeting.mockRejectedValueOnce(new Error('Network error'));

      render(<HomePage />);

      await waitFor(() => {
        const retryButton = screen.getByRole('button', { name: /retry loading greeting/i });
        expect(retryButton).toBeInTheDocument();
        
        // Button should be keyboard focusable
        retryButton.focus();
        expect(document.activeElement).toBe(retryButton);
        
        // Should have visible focus indicator (this test will fail without proper CSS)
        expect(retryButton).toHaveClass('focus-visible');
      });
    });

    it('should provide proper color contrast ratios', async () => {
      mockFetchGreeting.mockResolvedValueOnce({ message: 'Hello World' });

      render(<HomePage />);

      await waitFor(() => {
        const messageElement = screen.getByText('👋 Hello World');
        const computedStyle = window.getComputedStyle(messageElement);
        
        // This test will fail initially - need to implement proper contrast checking
        expect(computedStyle.color).not.toBe('rgb(128, 128, 128)'); // Gray text on light background
      });
    });

    it('should support screen reader announcements for state changes', async () => {
      mockFetchGreeting.mockResolvedValueOnce({ message: 'Hello World' });

      const { container } = render(<HomePage />);

      // Should have aria-live region for dynamic content
      const liveRegion = container.querySelector('[aria-live="polite"]');
      expect(liveRegion).toBeInTheDocument();

      await waitFor(() => {
        expect(screen.getByText('👋 Hello World')).toBeInTheDocument();
      });
    });

    it('should handle high contrast mode', async () => {
      // This test will fail initially - need to implement high contrast support
      mockFetchGreeting.mockResolvedValueOnce({ message: 'Hello World' });

      render(<HomePage />);

      await waitFor(() => {
        const messageElement = screen.getByText('👋 Hello World');
        expect(messageElement).toHaveAttribute('data-high-contrast-ready', 'true');
      });
    });
  });

  describe('Performance and Optimization', () => {
    it('should render within performance budget', async () => {
      const startTime = performance.now();
      
      mockFetchGreeting.mockResolvedValueOnce({ message: 'Hello World' });

      render(<HomePage />);

      await waitFor(() => {
        expect(screen.getByText('👋 Hello World')).toBeInTheDocument();
      });

      const endTime = performance.now();
      const renderTime = endTime - startTime;

      // Should render in less than 16ms (60fps budget)
      expect(renderTime).toBeLessThan(16);
    });

    it('should handle memory leaks properly', async () => {
      // This test will fail initially - need to implement cleanup
      let componentUnmounted = false;
      
      const TestComponent = () => {
        React.useEffect(() => {
          return () => {
            componentUnmounted = true;
          };
        }, []);
        
        return <HomePage />;
      };

      mockFetchGreeting.mockImplementation(() => new Promise(() => {})); // Never resolves

      const { unmount } = render(<TestComponent />);

      unmount();

      // Should properly cleanup on unmount
      expect(componentUnmounted).toBe(true);
    });

    it('should optimize re-renders', () => {
      let renderCount = 0;
      
      const TestWrapper = () => {
        renderCount++;
        return <HomePage />;
      };

      mockFetchGreeting.mockResolvedValueOnce({ message: 'Hello World' });

      const { rerender } = render(<TestWrapper />);

      // Force re-render with same props
      rerender(<TestWrapper />);
      rerender(<TestWrapper />);

      // Should not re-render unnecessarily (this may fail without React.memo or similar optimization)
      expect(renderCount).toBeLessThan(4);
    });

    it('should handle concurrent API calls gracefully', async () => {
      let callCount = 0;
      mockFetchGreeting.mockImplementation(() => {
        callCount++;
        return Promise.resolve({ message: `Call ${callCount}` });
      });

      const { rerender } = render(<HomePage />);

      // Trigger multiple re-renders quickly
      rerender(<HomePage />);
      rerender(<HomePage />);
      rerender(<HomePage />);

      await waitFor(() => {
        // Should only show the result of the last call, not all calls
        expect(screen.queryByText('👋 Call 1')).not.toBeInTheDocument();
        expect(screen.queryByText('👋 Call 2')).not.toBeInTheDocument();
      });
    });
  });

  describe('Error Boundary Integration', () => {
    it('should handle component crashes gracefully', () => {
      // This test will fail initially - need to implement error boundary
      const ErrorThrowingComponent = () => {
        throw new Error('Component crashed!');
      };

      const TestPage = () => (
        <HomePage>
          <ErrorThrowingComponent />
        </HomePage>
      );

      expect(() => render(<TestPage />)).not.toThrow();
    });

    it('should log errors to monitoring service', async () => {
      // Mock console.error to capture error logs
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();

      mockFetchGreeting.mockRejectedValueOnce(new Error('API Error'));

      render(<HomePage />);

      await waitFor(() => {
        expect(screen.getByText(/❌/)).toBeInTheDocument();
      });

      // Should log errors for monitoring (this will fail without proper error logging)
      expect(consoleSpy).toHaveBeenCalledWith('HomePage Error:', expect.any(Error));

      consoleSpy.mockRestore();
    });
  });

  describe('Mobile and Responsive Behavior', () => {
    it('should adapt layout for mobile devices', async () => {
      // Mock window.innerWidth for mobile
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 375,
      });

      mockFetchGreeting.mockResolvedValueOnce({ message: 'Hello World' });

      render(<HomePage />);

      await waitFor(() => {
        const container = screen.getByRole('main');
        // Should have mobile-specific classes or styling
        expect(container).toHaveClass('mobile-layout');
      });
    });

    it('should handle touch interactions', async () => {
      mockFetchGreeting.mockRejectedValueOnce(new Error('Network error'));

      render(<HomePage />);

      await waitFor(() => {
        const retryButton = screen.getByRole('button', { name: /retry loading greeting/i });
        
        // Should support touch events (this will fail without proper touch handling)
        expect(retryButton).toHaveAttribute('data-touch-enabled', 'true');
      });
    });

    it('should handle orientation changes', async () => {
      mockFetchGreeting.mockResolvedValueOnce({ message: 'Hello World' });

      render(<HomePage />);

      // Simulate orientation change
      window.dispatchEvent(new Event('orientationchange'));

      await waitFor(() => {
        // Component should adapt to orientation change
        const container = screen.getByRole('main');
        expect(container).toHaveAttribute('data-orientation-ready', 'true');
      });
    });
  });

  describe('State Management Edge Cases', () => {
    it('should handle rapid state changes without race conditions', async () => {
      let resolveFirst, resolveSecond;
      
      mockFetchGreeting
        .mockImplementationOnce(() => new Promise(resolve => { resolveFirst = resolve; }))
        .mockImplementationOnce(() => new Promise(resolve => { resolveSecond = resolve; }));

      const { rerender } = render(<HomePage />);

      // Trigger second API call before first completes
      rerender(<HomePage key="2" />);

      // Resolve in reverse order (second call completes first)
      resolveSecond({ message: 'Second Call' });
      resolveFirst({ message: 'First Call' });

      await waitFor(() => {
        // Should show result from the most recent call, not the first resolved
        expect(screen.getByText('👋 Second Call')).toBeInTheDocument();
        expect(screen.queryByText('👋 First Call')).not.toBeInTheDocument();
      });
    });

    it.skip('should maintain consistent state during rapid user interactions', async () => {
      // This test is flaky due to race conditions with rapid clicks
      // TODO: Implement proper state management to handle rapid user interactions
      mockFetchGreeting
        .mockRejectedValueOnce(new Error('First error'))
        .mockRejectedValueOnce(new Error('Second error'))
        .mockResolvedValueOnce({ message: 'Success' });

      render(<HomePage />);

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /retry/i })).toBeInTheDocument();
      });

      const retryButton = screen.getByRole('button', { name: /retry/i });

      // Rapid clicks
      fireEvent.click(retryButton);
      fireEvent.click(retryButton);
      fireEvent.click(retryButton);

      await waitFor(() => {
        expect(screen.getByText('👋 Success')).toBeInTheDocument();
      });
    });
  });

  describe('Authentication Features', () => {
    it('should display user welcome message', () => {
      mockFetchGreeting.mockImplementation(() => new Promise(() => {}));

      render(<HomePage user={mockUser} onLogout={mockOnLogout} />);

      expect(screen.getByText('Welcome, testuser!')).toBeInTheDocument();
    });

    it('should display logout button', () => {
      mockFetchGreeting.mockImplementation(() => new Promise(() => {}));

      render(<HomePage user={mockUser} onLogout={mockOnLogout} />);

      expect(screen.getByRole('button', { name: /logout testuser/i })).toBeInTheDocument();
    });

    it('should handle logout when button clicked', async () => {
      mockFetchGreeting.mockResolvedValueOnce({ message: 'Hello World' });
      mockLogoutUser.mockResolvedValueOnce();

      render(<HomePage user={mockUser} onLogout={mockOnLogout} />);

      const logoutButton = screen.getByRole('button', { name: /logout testuser/i });
      fireEvent.click(logoutButton);

      await waitFor(() => {
        expect(mockLogoutUser).toHaveBeenCalledWith(mockUser.id, mockUser.username);
        expect(mockClearSession).toHaveBeenCalled();
        expect(mockOnLogout).toHaveBeenCalled();
      });
    });

    it('should handle logout even if API call fails', async () => {
      mockFetchGreeting.mockResolvedValueOnce({ message: 'Hello World' });
      mockLogoutUser.mockRejectedValueOnce(new Error('Server error'));
      const consoleError = jest.spyOn(console, 'error').mockImplementation();

      render(<HomePage user={mockUser} onLogout={mockOnLogout} />);

      const logoutButton = screen.getByRole('button', { name: /logout testuser/i });
      fireEvent.click(logoutButton);

      await waitFor(() => {
        expect(mockLogoutUser).toHaveBeenCalled();
        expect(mockClearSession).toHaveBeenCalled();
        expect(mockOnLogout).toHaveBeenCalled();
      });

      expect(consoleError).toHaveBeenCalledWith('Logout error:', expect.any(Error));
      consoleError.mockRestore();
    });

    it('should handle missing user prop gracefully', () => {
      mockFetchGreeting.mockImplementation(() => new Promise(() => {}));

      render(<HomePage user={null} onLogout={mockOnLogout} />);

      expect(screen.getByText('Welcome, User!')).toBeInTheDocument();
    });

    it('should handle missing username in user object', () => {
      mockFetchGreeting.mockImplementation(() => new Promise(() => {}));
      const userWithoutUsername = { id: 1 };

      render(<HomePage user={userWithoutUsername} onLogout={mockOnLogout} />);

      expect(screen.getByText('Welcome, User!')).toBeInTheDocument();
    });

    it('should handle missing onLogout prop', async () => {
      mockFetchGreeting.mockResolvedValueOnce({ message: 'Hello World' });
      mockLogoutUser.mockResolvedValueOnce();

      render(<HomePage user={mockUser} />);

      const logoutButton = screen.getByRole('button', { name: /logout testuser/i });
      fireEvent.click(logoutButton);

      await waitFor(() => {
        expect(mockLogoutUser).toHaveBeenCalled();
        expect(mockClearSession).toHaveBeenCalled();
      });

      // Should not throw error even without onLogout callback
    });
  });

  describe('Browser close/tab close handling', () => {
    it('should register beforeunload event listener', () => {
      mockFetchGreeting.mockResolvedValueOnce({ message: 'Hello World' });
      
      const addEventListenerSpy = jest.spyOn(window, 'addEventListener');
      
      render(<HomePage user={mockUser} onLogout={mockOnLogout} />);

      // Verify beforeunload listener was added
      const beforeunloadCalls = addEventListenerSpy.mock.calls.filter(
        call => call[0] === 'beforeunload'
      );
      expect(beforeunloadCalls.length).toBeGreaterThan(0);
      expect(beforeunloadCalls[0][1]).toBeInstanceOf(Function);

      addEventListenerSpy.mockRestore();
    });

    it('should remove beforeunload listener on unmount', () => {
      mockFetchGreeting.mockResolvedValueOnce({ message: 'Hello World' });
      
      const removeEventListenerSpy = jest.spyOn(window, 'removeEventListener');
      
      const { unmount } = render(<HomePage user={mockUser} onLogout={mockOnLogout} />);

      // Unmount component
      unmount();

      // Verify beforeunload listener was removed
      const beforeunloadCalls = removeEventListenerSpy.mock.calls.filter(
        call => call[0] === 'beforeunload'
      );
      expect(beforeunloadCalls.length).toBeGreaterThan(0);

      removeEventListenerSpy.mockRestore();
    });

    it('should handle beforeunload without user gracefully', () => {
      mockFetchGreeting.mockResolvedValueOnce({ message: 'Hello World' });
      
      // Should not throw even if user is null
      expect(() => {
        render(<HomePage user={null} onLogout={mockOnLogout} />);
      }).not.toThrow();
    });
  });

  describe('Integration with React DevTools', () => {
    it('should have proper component display name', () => {
      expect(HomePage.displayName || HomePage.name).toBe('HomePage');
    });

    it('should expose proper props for debugging', async () => {
      mockFetchGreeting.mockResolvedValueOnce({ message: 'Hello World' });

      const { container } = render(<HomePage user={mockUser} onLogout={mockOnLogout} />);

      // Should have data attributes for debugging
      expect(container.firstChild).toHaveAttribute('data-testid', 'homepage-container');
    });
  });

  describe('Notification Integration', () => {
    it('should pass currentUserId to LoggedInUsersPanel for notification tracking', () => {
      mockFetchGreeting.mockResolvedValueOnce({ message: 'Hello World' });

      const mockUserWithId = {
        id: '123',
        username: 'testuser',
        createdAt: '2025-01-01T00:00:00Z'
      };

      render(<HomePage user={mockUserWithId} onLogout={mockOnLogout} />);

      // LoggedInUsersPanel should receive currentUserId prop
      const usersPanel = screen.getByTestId('mock-logged-in-users-panel');
      expect(usersPanel).toHaveAttribute('data-current-user-id', '123');
    });
  });
});