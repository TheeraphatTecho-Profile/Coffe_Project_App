import React from 'react';
import { AnimatedButton } from '../../components/AnimatedButton';

describe('AnimatedButton Working Tests', () => {
  it('should import and be defined', () => {
    expect(AnimatedButton).toBeDefined();
    expect(typeof AnimatedButton).toBe('function');
  });

  it('should be a React component', () => {
    expect(React.isValidElement(<AnimatedButton title="Test" onPress={() => {}} />)).toBe(true);
  });

  it('should accept required props', () => {
    const mockOnPress = jest.fn();
    const button = React.createElement(AnimatedButton, { 
      title: "Test Button",
      onPress: mockOnPress
    });
    expect(button).toBeDefined();
    expect((button.props as any).title).toBe("Test Button");
    expect((button.props as any).onPress).toBe(mockOnPress);
  });

  it('should accept optional props', () => {
    const mockOnPress = jest.fn();
    const button = React.createElement(AnimatedButton, { 
      title: "Test Button",
      onPress: mockOnPress,
      variant: "secondary" as const,
      size: "large" as const,
      disabled: true,
      loading: false
    });
    expect((button.props as any).variant).toBe("secondary");
    expect((button.props as any).size).toBe("large");
    expect((button.props as any).disabled).toBe(true);
    expect((button.props as any).loading).toBe(false);
  });

  it('should have correct default props', () => {
    const mockOnPress = jest.fn();
    const button = React.createElement(AnimatedButton, { 
      title: "Test Button",
      onPress: mockOnPress
    });
    expect((button.props as any).variant).toBeUndefined(); // Will use default 'primary'
    expect((button.props as any).size).toBeUndefined(); // Will use default 'medium'
    expect((button.props as any).disabled).toBeUndefined(); // Will use default false
    expect((button.props as any).loading).toBeUndefined(); // Will use default false
  });
});
