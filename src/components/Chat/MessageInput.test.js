import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import MessageInput from './MessageInput';

describe('MessageInput Component', () => {
  const mockOnSendMessage = jest.fn();
  const defaultProps = {
    onSendMessage: mockOnSendMessage,
    selectedMode: 'pirate',
    disabled: false
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render input field and send button', () => {
    render(<MessageInput {...defaultProps} />);
    
    expect(screen.getByPlaceholderText(/Type a message in Pirate Mode/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { type: 'submit' })).toBeInTheDocument();
  });

  it('should display selected mode indicator', () => {
    render(<MessageInput {...defaultProps} />);
    
    expect(screen.getByText('Pirate Mode')).toBeInTheDocument();
    expect(screen.getByText('🏴‍☠️')).toBeInTheDocument();
  });

  it('should update input value when typing', () => {
    render(<MessageInput {...defaultProps} />);
    
    const input = screen.getByPlaceholderText(/Type a message/i);
    fireEvent.change(input, { target: { value: 'Hello world' } });
    
    expect(input.value).toBe('Hello world');
  });

  it('should call onSendMessage when form is submitted', () => {
    render(<MessageInput {...defaultProps} />);
    
    const input = screen.getByPlaceholderText(/Type a message/i);
    const form = input.closest('form');
    
    fireEvent.change(input, { target: { value: 'Test message' } });
    fireEvent.submit(form);
    
    expect(mockOnSendMessage).toHaveBeenCalledWith('Test message');
  });

  it('should clear input after sending message', () => {
    render(<MessageInput {...defaultProps} />);
    
    const input = screen.getByPlaceholderText(/Type a message/i);
    fireEvent.change(input, { target: { value: 'Test message' } });
    fireEvent.submit(input.closest('form'));
    
    expect(input.value).toBe('');
  });

  it('should not send empty messages', () => {
    render(<MessageInput {...defaultProps} />);
    
    const input = screen.getByPlaceholderText(/Type a message/i);
    fireEvent.change(input, { target: { value: '   ' } });
    fireEvent.submit(input.closest('form'));
    
    expect(mockOnSendMessage).not.toHaveBeenCalled();
  });

  it('should send message on Enter key press', () => {
    render(<MessageInput {...defaultProps} />);
    
    const input = screen.getByPlaceholderText(/Type a message/i);
    fireEvent.change(input, { target: { value: 'Test message' } });
    fireEvent.keyPress(input, { key: 'Enter', code: 'Enter', charCode: 13 });
    
    expect(mockOnSendMessage).toHaveBeenCalledWith('Test message');
  });

  it('should not send on Shift+Enter', () => {
    render(<MessageInput {...defaultProps} />);
    
    const input = screen.getByPlaceholderText(/Type a message/i);
    fireEvent.change(input, { target: { value: 'Test message' } });
    fireEvent.keyPress(input, { key: 'Enter', code: 'Enter', charCode: 13, shiftKey: true });
    
    expect(mockOnSendMessage).not.toHaveBeenCalled();
  });

  it('should disable input when disabled prop is true', () => {
    render(<MessageInput {...defaultProps} disabled={true} />);
    
    const input = screen.getByPlaceholderText('Connecting...');
    expect(input).toBeDisabled();
  });

  it('should disable send button when input is empty', () => {
    render(<MessageInput {...defaultProps} />);
    
    const button = screen.getByRole('button', { type: 'submit' });
    expect(button).toBeDisabled();
  });

  it('should enable send button when input has value', () => {
    render(<MessageInput {...defaultProps} />);
    
    const input = screen.getByPlaceholderText(/Type a message/i);
    fireEvent.change(input, { target: { value: 'Hello' } });
    
    const button = screen.getByRole('button', { type: 'submit' });
    expect(button).not.toBeDisabled();
  });
});
