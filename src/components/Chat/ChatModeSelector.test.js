import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import ChatModeSelector from './ChatModeSelector';

describe('ChatModeSelector Component', () => {
  const mockOnModeChange = jest.fn();
  const defaultProps = {
    selectedMode: 'pirate',
    onModeChange: mockOnModeChange
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render selected mode', () => {
    render(<ChatModeSelector {...defaultProps} />);
    
    expect(screen.getByText('Pirate Mode')).toBeInTheDocument();
    expect(screen.getByText('🏴‍☠️')).toBeInTheDocument();
  });

  it('should show dropdown when button is clicked', () => {
    render(<ChatModeSelector {...defaultProps} />);
    
    const button = screen.getByRole('button');
    fireEvent.click(button);
    
    // Should show all 10 modes
    expect(screen.getByText('Shakespeare Mode')).toBeInTheDocument();
    expect(screen.getByText('Robot Mode')).toBeInTheDocument();
    expect(screen.getByText('Horror Mode')).toBeInTheDocument();
  });

  it('should hide dropdown when button is clicked again', () => {
    render(<ChatModeSelector {...defaultProps} />);
    
    const button = screen.getByRole('button');
    fireEvent.click(button); // Open
    fireEvent.click(button); // Close
    
    expect(screen.queryByText('Shakespeare Mode')).not.toBeInTheDocument();
  });

  it('should call onModeChange when a mode is selected', () => {
    render(<ChatModeSelector {...defaultProps} />);
    
    const button = screen.getByRole('button');
    fireEvent.click(button);
    
    const robotModeButton = screen.getByText('Robot Mode').closest('button');
    fireEvent.click(robotModeButton);
    
    expect(mockOnModeChange).toHaveBeenCalledWith('robot');
  });

  it('should close dropdown after selecting a mode', () => {
    render(<ChatModeSelector {...defaultProps} />);
    
    const button = screen.getByRole('button');
    fireEvent.click(button);
    
    const robotModeButton = screen.getByText('Robot Mode').closest('button');
    fireEvent.click(robotModeButton);
    
    expect(screen.queryByText('Shakespeare Mode')).not.toBeInTheDocument();
  });

  it('should show checkmark on selected mode', () => {
    const { container } = render(<ChatModeSelector {...defaultProps} />);
    
    const button = screen.getByRole('button');
    fireEvent.click(button);
    
    const activeModeOption = container.querySelector('.mode-option.active');
    expect(activeModeOption).toHaveClass('active');
    expect(screen.getByText('✓')).toBeInTheDocument();
  });

  it('should display mode descriptions', () => {
    render(<ChatModeSelector {...defaultProps} />);
    
    const button = screen.getByRole('button');
    fireEvent.click(button);
    
    expect(screen.getByText(/Ahoy matey!/i)).toBeInTheDocument();
  });

  it('should close dropdown when overlay is clicked', () => {
    render(<ChatModeSelector {...defaultProps} />);
    
    const button = screen.getByRole('button');
    fireEvent.click(button);
    
    const overlay = document.querySelector('.mode-dropdown-overlay');
    fireEvent.click(overlay);
    
    expect(screen.queryByText('Shakespeare Mode')).not.toBeInTheDocument();
  });

  it('should render all 10 chat modes', () => {
    render(<ChatModeSelector {...defaultProps} />);
    
    const button = screen.getByRole('button');
    fireEvent.click(button);
    
    const expectedModes = [
      'Shakespeare Mode',
      'Robot Mode',
      'Horror Mode',
      'Party Mode',
      'Fantasy Mode',
      'Alien Mode',
      'Detective Mode',
      'Corporate Mode',
      'Gen Z Mode'
    ];
    
    expectedModes.forEach(mode => {
      expect(screen.getByText(mode)).toBeInTheDocument();
    });
    
    // Check pirate mode appears in dropdown (not button)
    const dropdown = document.querySelector('.mode-dropdown');
    expect(dropdown).toContainHTML('Pirate Mode');
  });
});
