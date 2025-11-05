import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import App from './App';
import * as api from './services/api';
import * as session from './services/session';

// Mock the API and session services
jest.mock('./services/api');
jest.mock('./services/session');

const mockFetchGreeting = api.fetchGreeting;
const mockGetSession = session.getSession;
const mockIsAuthenticated = session.isAuthenticated;

test('renders Hello World Chat title when logged in', async () => {
  // Mock user session
  const mockUser = {
    id: 1,
    username: 'testuser',
    createdAt: '2025-01-01T00:00:00Z'
  };
  
  mockGetSession.mockReturnValue(mockUser);
  mockIsAuthenticated.mockReturnValue(true);
  mockFetchGreeting.mockResolvedValueOnce({ message: 'Hello World' });
  
  render(<App />);
  
  // Wait for the HomePage to render
  await waitFor(() => {
    const titleElement = screen.getByText('Hello World Chat');
    expect(titleElement).toBeInTheDocument();
  });
});

test('renders Midwest Chat title when not logged in', () => {
  // Mock no session
  mockGetSession.mockReturnValue(null);
  mockIsAuthenticated.mockReturnValue(false);
  
  render(<App />);
  
  const titleElement = screen.getByText('Midwest Chat');
  expect(titleElement).toBeInTheDocument();
});
