import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import LoggedInUsersPanel from '../LoggedInUsersPanel';

describe('LoggedInUsersPanel', () => {
  const mockUsers = [
    {
      id: 1,
      username: 'alice',
      display_name: 'Alice Smith',
      profile_image: null,
      last_active: new Date().toISOString(),
    },
    {
      id: 2,
      username: 'bob',
      display_name: 'Bob Jones',
      profile_image: null,
      last_active: new Date().toISOString(),
    },
  ];

  it('renders loading state', () => {
    render(<LoggedInUsersPanel users={[]} loading={true} error={null} />);
    
    expect(screen.getByText(/loading users/i)).toBeInTheDocument();
  });

  it('renders error state', () => {
    const error = new Error('Network error');
    render(<LoggedInUsersPanel users={[]} loading={false} error={error} />);
    
    expect(screen.getByText(/unable to load online users/i)).toBeInTheDocument();
    expect(screen.getByText(/network error/i)).toBeInTheDocument();
  });

  it('renders empty state when no users are online', () => {
    render(<LoggedInUsersPanel users={[]} loading={false} error={null} />);
    
    expect(screen.getByText(/no one else is online right now/i)).toBeInTheDocument();
    expect(screen.getByText(/check back soon/i)).toBeInTheDocument();
  });

  it('renders list of online users', () => {
    render(<LoggedInUsersPanel users={mockUsers} loading={false} error={null} />);
    
    expect(screen.getByText('Alice Smith')).toBeInTheDocument();
    expect(screen.getByText('Bob Jones')).toBeInTheDocument();
    expect(screen.getByText('2')).toBeInTheDocument(); // user count
  });

  it('displays username when display_name is not available', () => {
    const usersWithoutDisplayName = [
      {
        id: 3,
        username: 'charlie',
        display_name: null,
        profile_image: null,
        last_active: new Date().toISOString(),
      },
    ];
    
    render(<LoggedInUsersPanel users={usersWithoutDisplayName} loading={false} error={null} />);
    
    expect(screen.getByText('charlie')).toBeInTheDocument();
  });

  it('calls onUserClick when user is clicked', () => {
    const handleUserClick = jest.fn();
    render(
      <LoggedInUsersPanel 
        users={mockUsers} 
        loading={false} 
        error={null}
        onUserClick={handleUserClick}
      />
    );
    
    const aliceItem = screen.getByText('Alice Smith').closest('.user-item');
    aliceItem.click();
    
    expect(handleUserClick).toHaveBeenCalledWith(mockUsers[0]);
  });

  it('displays active status for recent activity', () => {
    render(<LoggedInUsersPanel users={mockUsers} loading={false} error={null} />);
    
    // Should show "Active now" or similar for recent activity
    const statusElements = screen.getAllByText(/active/i);
    expect(statusElements.length).toBeGreaterThan(0);
  });

  it('renders user avatars with initials', () => {
    render(<LoggedInUsersPanel users={mockUsers} loading={false} error={null} />);
    
    // Alice Smith should have initials "AS"
    expect(screen.getByText('AS')).toBeInTheDocument();
    // Bob Jones should have initials "BJ"
    expect(screen.getByText('BJ')).toBeInTheDocument();
  });

  it('renders online indicator for all users', () => {
    const { container } = render(
      <LoggedInUsersPanel users={mockUsers} loading={false} error={null} />
    );
    
    const indicators = container.querySelectorAll('.online-indicator');
    expect(indicators.length).toBe(mockUsers.length);
  });
});
