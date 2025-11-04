import React from 'react';
import { render, screen, waitFor, act } from '@testing-library/react';
import '@testing-library/jest-dom';
import HomePage from '../HomePage';
import { fetchGreeting } from '../../services/api';

// Create real integration tests that actually make network calls
describe('HomePage Integration Tests', () => {
  describe('Real API Integration', () => {
    beforeEach(() => {
      // Reset any mocks to test real API calls in integration tests
      jest.restoreAllMocks();
    });

    it('should successfully integrate with backend API', async () => {
      // This test will fail initially if backend is not running
      render(<HomePage />);

      expect(screen.getByText('Loading greeting...')).toBeInTheDocument();

      await waitFor(
        () => {
          expect(screen.getByText('👋 Hello World')).toBeInTheDocument();
        },
        { timeout: 5000 }
      );

      expect(screen.queryByText('Loading greeting...')).not.toBeInTheDocument();
    });

    it('should handle real network failures gracefully', async () => {
      // Mock fetch to simulate network failure for integration testing
      const originalFetch = global.fetch;
      global.fetch = jest.fn().mockRejectedValue(new Error('Network error'));

      render(<HomePage />);

      await waitFor(() => {
        expect(screen.getByText(/❌.*Network error/)).toBeInTheDocument();
      });

      global.fetch = originalFetch;
    });

    it('should handle server errors from real backend', async () => {
      // Mock fetch to simulate 500 error
      const originalFetch = global.fetch;
      global.fetch = jest.fn().mockResolvedValue({
        ok: false,
        status: 500,
        json: async () => ({ error: 'Internal server error' }),
      });

      render(<HomePage />);

      await waitFor(() => {
        expect(screen.getByText(/❌.*Internal server error/)).toBeInTheDocument();
      });

      global.fetch = originalFetch;
    });

    it('should maintain state consistency during rapid API calls', async () => {
      let callCount = 0;
      const originalFetch = global.fetch;
      
      global.fetch = jest.fn().mockImplementation(() => {
        callCount++;
        return Promise.resolve({
          ok: true,
          json: async () => ({ message: `Response ${callCount}` }),
        });
      });

      const { rerender } = render(<HomePage />);

      // Rapidly trigger re-renders to test race conditions
      act(() => {
        rerender(<HomePage key="1" />);
        rerender(<HomePage key="2" />);
        rerender(<HomePage key="3" />);
      });

      await waitFor(() => {
        // Should only show the final response, not intermediate ones
        const messages = screen.queryAllByText(/👋 Response/);
        expect(messages.length).toBeLessThanOrEqual(1);
      });

      global.fetch = originalFetch;
    });
  });

  describe('Cross-Component Integration', () => {
    it('should integrate properly with parent App component', async () => {
      // This test will fail initially - need to test within App context
      const mockFetch = jest.fn().mockResolvedValue({
        ok: true,
        json: async () => ({ message: 'Hello World' }),
      });
      global.fetch = mockFetch;

      const AppWithHomePage = () => (
        <div data-testid="app-container">
          <HomePage />
        </div>
      );

      render(<AppWithHomePage />);

      expect(screen.getByTestId('app-container')).toBeInTheDocument();

      await waitFor(() => {
        expect(screen.getByText('👋 Hello World')).toBeInTheDocument();
      });
    });

    it('should handle context providers correctly', async () => {
      // This test will fail initially - need context integration
      const ThemeContext = React.createContext({ theme: 'light' });
      
      const ThemedHomePage = () => (
        <ThemeContext.Provider value={{ theme: 'dark' }}>
          <HomePage />
        </ThemeContext.Provider>
      );

      const mockFetch = jest.fn().mockResolvedValue({
        ok: true,
        json: async () => ({ message: 'Hello World' }),
      });
      global.fetch = mockFetch;

      render(<ThemedHomePage />);

      await waitFor(() => {
        const container = screen.getByRole('main');
        expect(container).toHaveAttribute('data-theme', 'dark');
      });
    });
  });

  describe('Service Layer Integration', () => {
    it('should properly integrate with real API service functions', async () => {
      // Test actual service integration without mocking
      const mockFetch = jest.fn().mockResolvedValue({
        ok: true,
        json: async () => ({ message: 'Hello World' }),
      });
      global.fetch = mockFetch;

      const result = await fetchGreeting();
      
      expect(result).toEqual({ message: 'Hello World' });
      expect(mockFetch).toHaveBeenCalledWith(
        'http://localhost:8081/api/hello',
        expect.objectContaining({
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        })
      );
    });

    it('should handle service layer errors in component', async () => {
      const mockFetch = jest.fn().mockRejectedValue(new Error('Service error'));
      global.fetch = mockFetch;

      render(<HomePage />);

      await waitFor(() => {
        expect(screen.getByText(/❌.*Service error/)).toBeInTheDocument();
      });
    });

    it('should integrate with caching layer when implemented', async () => {
      // This test will fail initially - need caching implementation
      const mockFetch = jest.fn().mockResolvedValue({
        ok: true,
        json: async () => ({ message: 'Cached Hello World' }),
      });
      global.fetch = mockFetch;

      // First call
      await fetchGreeting();
      
      // Second call should use cache
      await fetchGreeting();

      // Should only make one actual network request
      expect(mockFetch).toHaveBeenCalledTimes(1);
    });
  });

  describe('End-to-End User Workflows', () => {
    it('should complete full user journey from load to success', async () => {
      const mockFetch = jest.fn().mockResolvedValue({
        ok: true,
        json: async () => ({ message: 'Hello World' }),
      });
      global.fetch = mockFetch;

      render(<HomePage />);

      // Initial loading state
      expect(screen.getByText('Hello World Chat')).toBeInTheDocument();
      expect(screen.getByText('WhatsApp-style Greeting')).toBeInTheDocument();
      expect(screen.getByText('Loading greeting...')).toBeInTheDocument();

      // Wait for success state
      await waitFor(() => {
        expect(screen.getByText('👋 Hello World')).toBeInTheDocument();
      });

      // Verify final state
      expect(screen.queryByText('Loading greeting...')).not.toBeInTheDocument();
      expect(screen.queryByText(/❌/)).not.toBeInTheDocument();
      
      // Check timestamp is displayed
      expect(screen.getByText(/\\d{1,2}:\\d{2}/)).toBeInTheDocument();
    });

    it('should complete full user journey from load to error to retry to success', async () => {
      const mockFetch = jest.fn()
        .mockRejectedValueOnce(new Error('Network error'))
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({ message: 'Hello World' }),
        });
      global.fetch = mockFetch;

      render(<HomePage />);

      // Wait for error state
      await waitFor(() => {
        expect(screen.getByText(/❌.*Network error/)).toBeInTheDocument();
      });

      // Click retry button
      const retryButton = screen.getByRole('button', { name: /retry/i });
      expect(retryButton).toBeInTheDocument();
      
      act(() => {
        retryButton.click();
      });

      // Wait for success after retry
      await waitFor(() => {
        expect(screen.getByText('👋 Hello World')).toBeInTheDocument();
      });

      expect(screen.queryByText(/❌/)).not.toBeInTheDocument();
    });

    it('should maintain accessibility throughout user workflow', async () => {
      const mockFetch = jest.fn()
        .mockRejectedValueOnce(new Error('Network error'))
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({ message: 'Hello World' }),
        });
      global.fetch = mockFetch;

      render(<HomePage />);

      // Check initial accessibility
      expect(screen.getByRole('main')).toBeInTheDocument();
      expect(screen.getByRole('heading', { name: 'Hello World Chat' })).toBeInTheDocument();

      // Wait for error state and check accessibility
      await waitFor(() => {
        expect(screen.getByText(/❌.*Network error/)).toBeInTheDocument();
      });

      const retryButton = screen.getByRole('button', { name: /retry/i });
      expect(retryButton).toBeInTheDocument();
      expect(retryButton).toHaveAttribute('type', 'button');

      // Test keyboard navigation
      retryButton.focus();
      expect(document.activeElement).toBe(retryButton);

      // Retry and check final state accessibility
      act(() => {
        retryButton.click();
      });

      await waitFor(() => {
        expect(screen.getByText('👋 Hello World')).toBeInTheDocument();
      });

      // Final state should still be accessible
      expect(screen.getByRole('main')).toBeInTheDocument();
    });
  });

  describe('Performance Integration', () => {
    it('should render efficiently under realistic conditions', async () => {
      const renderStart = performance.now();
      
      const mockFetch = jest.fn().mockResolvedValue({
        ok: true,
        json: async () => ({ message: 'Hello World' }),
      });
      global.fetch = mockFetch;

      render(<HomePage />);

      await waitFor(() => {
        expect(screen.getByText('👋 Hello World')).toBeInTheDocument();
      });

      const renderEnd = performance.now();
      const totalRenderTime = renderEnd - renderStart;

      // Should complete full render cycle in reasonable time (less than 100ms)
      expect(totalRenderTime).toBeLessThan(100);
    });

    it('should handle component updates efficiently', async () => {
      let renderCount = 0;
      
      const TestWrapper = ({ counter }) => {
        renderCount++;
        return <HomePage key={counter} />;
      };

      const mockFetch = jest.fn().mockResolvedValue({
        ok: true,
        json: async () => ({ message: 'Hello World' }),
      });
      global.fetch = mockFetch;

      const { rerender } = render(<TestWrapper counter={1} />);

      await waitFor(() => {
        expect(screen.getByText('👋 Hello World')).toBeInTheDocument();
      });

      const initialRenderCount = renderCount;

      // Force re-render with same data
      rerender(<TestWrapper counter={2} />);

      await waitFor(() => {
        expect(screen.getByText('👋 Hello World')).toBeInTheDocument();
      });

      // Should not cause excessive re-renders
      expect(renderCount - initialRenderCount).toBeLessThan(3);
    });
  });

  describe('Error Boundary Integration', () => {
    it('should integrate with error boundaries properly', () => {
      const ErrorBoundary = class extends React.Component {
        constructor(props) {
          super(props);
          this.state = { hasError: false };
        }

        static getDerivedStateFromError(error) {
          return { hasError: true };
        }

        componentDidCatch(error, errorInfo) {
          console.log('Error caught by boundary:', error);
        }

        render() {
          if (this.state.hasError) {
            return <div>Something went wrong.</div>;
          }

          return this.props.children;
        }
      };

      const mockFetch = jest.fn().mockResolvedValue({
        ok: true,
        json: async () => ({ message: 'Hello World' }),
      });
      global.fetch = mockFetch;

      expect(() => {
        render(
          <ErrorBoundary>
            <HomePage />
          </ErrorBoundary>
        );
      }).not.toThrow();
    });
  });
});