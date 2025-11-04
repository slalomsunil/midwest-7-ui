import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import App from './App';
import * as api from './services/api';

// Mock the API service
jest.mock('./services/api');
const mockFetchGreeting = api.fetchGreeting;

test('renders Hello World Chat title', async () => {
  mockFetchGreeting.mockResolvedValueOnce({ message: 'Hello World' });
  
  render(<App />);
  const titleElement = screen.getByText('Hello World Chat');
  expect(titleElement).toBeInTheDocument();
});
