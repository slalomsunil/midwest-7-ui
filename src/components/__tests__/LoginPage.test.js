// Tests for LoginPage component
import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import LoginPage from '../LoginPage';
import * as api from '../../services/api';
import * as session from '../../services/session';

// Mock the API and session modules
jest.mock('../../services/api');
jest.mock('../../services/session');

const mockApi = api;
const mockSession = session;

describe('LoginPage Component', () => {
  const mockOnLogin = jest.fn();
  
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Rendering', () => {
    it('should render login form with all elements', () => {
      render(<LoginPage onLogin={mockOnLogin} />);
      
      expect(screen.getByRole('main')).toBeInTheDocument();
      expect(screen.getByText('Midwest Chat')).toBeInTheDocument();
      expect(screen.getByText('Welcome! Enter your username to start chatting')).toBeInTheDocument();
      expect(screen.getByLabelText('Username')).toBeInTheDocument();
      expect(screen.getByPlaceholderText('Enter your username')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /start chatting/i })).toBeInTheDocument();
      expect(screen.getByText('Choose any username - no password required')).toBeInTheDocument();
    });

    it('should have proper ARIA attributes', () => {
      render(<LoginPage onLogin={mockOnLogin} />);
      
      const usernameInput = screen.getByLabelText('Username');
      expect(usernameInput).toHaveAttribute('aria-describedby', 'username-help');
      expect(usernameInput).toHaveAttribute('aria-invalid', 'false');
      
      const submitButton = screen.getByRole('button', { name: /start chatting/i });
      expect(submitButton).toHaveAttribute('aria-describedby', 'login-status');
    });

    it('should show privacy notice', () => {
      render(<LoginPage onLogin={mockOnLogin} />);
      expect(screen.getByText('Your username is stored locally for this session')).toBeInTheDocument();
    });
  });

  describe('Form Validation', () => {
    it('should disable submit button when username is empty', () => {
      render(<LoginPage onLogin={mockOnLogin} />);
      
      const submitButton = screen.getByRole('button', { name: /start chatting/i });
      expect(submitButton).toBeDisabled();
    });

    it('should enable submit button when username is entered', async () => {
      render(<LoginPage onLogin={mockOnLogin} />);
      
      const usernameInput = screen.getByLabelText('Username');
      const submitButton = screen.getByRole('button', { name: /start chatting/i });
      
      await userEvent.type(usernameInput, 'testuser');
      
      expect(submitButton).toBeEnabled();
    });

    it('should show error when submitting empty username', async () => {
      render(<LoginPage onLogin={mockOnLogin} />);
      
      const form = screen.getByRole('form');
      
      // Try to submit with empty username
      fireEvent.submit(form);
      
      expect(screen.getByText('Please enter a username')).toBeInTheDocument();
      expect(mockApi.loginUser).not.toHaveBeenCalled();
    });

    it('should clear error when user starts typing', async () => {
      render(<LoginPage onLogin={mockOnLogin} />);
      
      const usernameInput = screen.getByLabelText('Username');
      
      // Trigger error first
      fireEvent.submit(screen.getByRole('form'));
      expect(screen.getByText('Please enter a username')).toBeInTheDocument();
      
      // Start typing
      await userEvent.type(usernameInput, 't');
      
      expect(screen.queryByText('Please enter a username')).not.toBeInTheDocument();
    });

    it('should trim whitespace from username', async () => {
      mockApi.loginUser.mockResolvedValue({
        success: true,
        user: { id: 1, username: 'testuser' }
      });
      
      render(<LoginPage onLogin={mockOnLogin} />);
      
      const usernameInput = screen.getByLabelText('Username');
      
      await userEvent.type(usernameInput, '  testuser  ');
      fireEvent.submit(screen.getByRole('form'));
      
      await waitFor(() => {
        expect(mockApi.loginUser).toHaveBeenCalledWith('testuser');
      });
    });
  });

  describe('Login Process', () => {
    it('should handle successful login', async () => {
      const mockUserData = {
        id: 1,
        username: 'testuser',
        createdAt: '2025-01-01T00:00:00Z'
      };
      
      mockApi.loginUser.mockResolvedValue({
        success: true,
        user: mockUserData
      });
      
      render(<LoginPage onLogin={mockOnLogin} />);
      
      const usernameInput = screen.getByLabelText('Username');
      const submitButton = screen.getByRole('button', { name: /start chatting/i });
      
      await userEvent.type(usernameInput, 'testuser');
      fireEvent.submit(screen.getByRole('form'));
      
      // Should show loading state
      expect(screen.getByText('Logging in...')).toBeInTheDocument();
      expect(submitButton).toBeDisabled();
      
      await waitFor(() => {
        expect(mockApi.loginUser).toHaveBeenCalledWith('testuser');
        expect(mockSession.saveSession).toHaveBeenCalledWith(mockUserData);
        expect(mockOnLogin).toHaveBeenCalledWith(mockUserData);
      });
    });

    it('should handle login API error', async () => {
      const consoleError = jest.spyOn(console, 'error').mockImplementation();
      
      mockApi.loginUser.mockRejectedValue(new Error('Username cannot be empty'));
      
      render(<LoginPage onLogin={mockOnLogin} />);
      
      const usernameInput = screen.getByLabelText('Username');
      
      await userEvent.type(usernameInput, 'testuser');
      fireEvent.submit(screen.getByRole('form'));
      
      await waitFor(() => {
        expect(screen.getByText('Username cannot be empty')).toBeInTheDocument();
      });
      
      expect(mockSession.saveSession).not.toHaveBeenCalled();
      expect(mockOnLogin).not.toHaveBeenCalled();
      expect(consoleError).toHaveBeenCalledWith('Login error:', expect.any(Error));
      
      consoleError.mockRestore();
    });

    it('should handle network error', async () => {
      mockApi.loginUser.mockRejectedValue(new Error('Unable to connect to server. Please check your connection.'));
      
      render(<LoginPage onLogin={mockOnLogin} />);
      
      const usernameInput = screen.getByLabelText('Username');
      
      await userEvent.type(usernameInput, 'testuser');
      fireEvent.submit(screen.getByRole('form'));
      
      await waitFor(() => {
        expect(screen.getByText('Unable to connect to server. Please check your connection.')).toBeInTheDocument();
      });
    });
  });

  describe('Loading States', () => {
    it('should disable form elements during loading', async () => {
      // Mock a slow API call
      let resolvePromise;
      const promise = new Promise((resolve) => {
        resolvePromise = resolve;
      });
      mockApi.loginUser.mockReturnValue(promise);
      
      render(<LoginPage onLogin={mockOnLogin} />);
      
      const usernameInput = screen.getByLabelText('Username');
      const submitButton = screen.getByRole('button', { name: /start chatting/i });
      
      await userEvent.type(usernameInput, 'testuser');
      fireEvent.submit(screen.getByRole('form'));
      
      // Elements should be disabled during loading
      expect(usernameInput).toBeDisabled();
      expect(submitButton).toBeDisabled();
      expect(screen.getByText('Logging in...')).toBeInTheDocument();
      
      // Resolve the promise
      resolvePromise({
        success: true,
        user: { id: 1, username: 'testuser' }
      });
      
      await waitFor(() => {
        expect(usernameInput).not.toBeDisabled();
      });
    });

    it('should show loading spinner during login', async () => {
      let resolvePromise;
      const promise = new Promise((resolve) => {
        resolvePromise = resolve;
      });
      mockApi.loginUser.mockReturnValue(promise);
      
      render(<LoginPage onLogin={mockOnLogin} />);
      
      const usernameInput = screen.getByLabelText('Username');
      
      await userEvent.type(usernameInput, 'testuser');
      fireEvent.submit(screen.getByRole('form'));
      
      expect(screen.getByText('Logging in...')).toBeInTheDocument();
      expect(document.querySelector('.loading-spinner')).toBeInTheDocument();
      
      resolvePromise({
        success: true,
        user: { id: 1, username: 'testuser' }
      });
      
      await waitFor(() => {
        expect(screen.getByText('Start Chatting')).toBeInTheDocument();
      });
    });
  });

  describe('Accessibility', () => {
    it('should update ARIA attributes on error', async () => {
      render(<LoginPage onLogin={mockOnLogin} />);
      
      const usernameInput = screen.getByLabelText('Username');
      
      // Trigger error
      fireEvent.submit(screen.getByRole('form'));
      
      await waitFor(() => {
        expect(usernameInput).toHaveAttribute('aria-invalid', 'true');
        expect(usernameInput).toHaveAttribute('aria-describedby', 'username-error');
      });
      
      expect(screen.getByRole('alert')).toBeInTheDocument();
    });

    it('should announce loading state to screen readers', async () => {
      let resolvePromise;
      const promise = new Promise((resolve) => {
        resolvePromise = resolve;
      });
      mockApi.loginUser.mockReturnValue(promise);
      
      render(<LoginPage onLogin={mockOnLogin} />);
      
      const usernameInput = screen.getByLabelText('Username');
      
      await userEvent.type(usernameInput, 'testuser');
      fireEvent.submit(screen.getByRole('form'));
      
      expect(screen.getByText('Logging in, please wait')).toBeInTheDocument();
      
      resolvePromise({
        success: true,
        user: { id: 1, username: 'testuser' }
      });
      
      await waitFor(() => {
        expect(screen.queryByText('Logging in, please wait')).not.toBeInTheDocument();
      });
    });
  });

  describe('Edge Cases', () => {
    it('should handle missing onLogin prop', async () => {
      mockApi.loginUser.mockResolvedValue({
        success: true,
        user: { id: 1, username: 'testuser' }
      });
      
      render(<LoginPage />);
      
      const usernameInput = screen.getByLabelText('Username');
      
      await userEvent.type(usernameInput, 'testuser');
      fireEvent.submit(screen.getByRole('form'));
      
      await waitFor(() => {
        expect(mockApi.loginUser).toHaveBeenCalled();
        expect(mockSession.saveSession).toHaveBeenCalled();
      });
      
      // Should not throw error even without onLogin callback
    });

    it('should enforce maximum username length', () => {
      render(<LoginPage onLogin={mockOnLogin} />);
      
      const usernameInput = screen.getByLabelText('Username');
      expect(usernameInput).toHaveAttribute('maxLength', '50');
    });

    it('should have proper form attributes', () => {
      render(<LoginPage onLogin={mockOnLogin} />);
      
      const form = screen.getByRole('form');
      expect(form).toHaveAttribute('noValidate');
      
      const usernameInput = screen.getByLabelText('Username');
      expect(usernameInput).toHaveAttribute('autoComplete', 'username');
    });
  });
});