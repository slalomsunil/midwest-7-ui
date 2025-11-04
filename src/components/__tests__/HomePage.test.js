import React from 'react';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import HomePage from '../HomePage';
import * as api from '../../services/api';

// Mock the API service
jest.mock('../../services/api');
const mockFetchGreeting = api.fetchGreeting;

describe('HomePage', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render the homepage with loading state initially', () => {
    mockFetchGreeting.mockImplementation(() => new Promise(() => {})); // Never resolves

    render(<HomePage />);

    expect(screen.getByText('Hello World Chat')).toBeInTheDocument();
    expect(screen.getByText('WhatsApp-style Greeting')).toBeInTheDocument();
    expect(screen.getByText('Loading greeting...')).toBeInTheDocument();
    expect(screen.getByTestId('loading-dots')).toBeInTheDocument();
  });

  it('should display greeting message on successful API call', async () => {
    mockFetchGreeting.mockResolvedValueOnce({ message: 'Hello World' });

    render(<HomePage />);

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
});