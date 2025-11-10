import React from 'react';
import { render, screen } from '@testing-library/react';
import NotificationBadge from '../NotificationBadge';

describe('NotificationBadge Component', () => {
  test('should render notification count correctly', () => {
    render(<NotificationBadge count={3} userId="user1" />);
    
    expect(screen.getByText('3')).toBeInTheDocument();
    expect(screen.getByRole('status')).toBeInTheDocument();
  });

  test('should display "99+" for counts over 99', () => {
    render(<NotificationBadge count={150} userId="user1" />);
    
    expect(screen.getByText('99+')).toBeInTheDocument();
  });

  test('should not render anything when count is 0', () => {
    render(<NotificationBadge count={0} userId="user1" />);
    
    expect(screen.queryByRole('status')).not.toBeInTheDocument();
  });

  test('should not render anything when count is negative', () => {
    render(<NotificationBadge count={-5} userId="user1" />);
    
    expect(screen.queryByRole('status')).not.toBeInTheDocument();
  });

  test('should have correct accessibility attributes', () => {
    render(<NotificationBadge count={2} userId="user123" />);
    
    const badge = screen.getByRole('status');
    expect(badge).toHaveAttribute('aria-label', '2 unread messages from user user123');
    expect(badge).toHaveAttribute('title', '2 unread messages');
  });

  test('should use singular form for count of 1', () => {
    render(<NotificationBadge count={1} userId="user123" />);
    
    const badge = screen.getByRole('status');
    expect(badge).toHaveAttribute('aria-label', '1 unread message from user user123');
    expect(badge).toHaveAttribute('title', '1 unread message');
  });

  test('should apply custom size and position classes', () => {
    render(
      <NotificationBadge 
        count={5} 
        userId="user1" 
        size="large" 
        position="bottom-left" 
        className="custom-class"
      />
    );
    
    const badge = screen.getByRole('status');
    expect(badge).toHaveClass('notification-badge-overlay--large');
    expect(badge).toHaveClass('notification-badge-overlay--bottom-left');
    expect(badge).toHaveClass('custom-class');
  });

  test('should use default size and position when not specified', () => {
    render(<NotificationBadge count={3} userId="user1" />);
    
    const badge = screen.getByRole('status');
    expect(badge).toHaveClass('notification-badge-overlay--default');
    expect(badge).toHaveClass('notification-badge-overlay--top-right');
  });
});