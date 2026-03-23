import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { View, Text } from 'react-native';
import { ThemeProvider } from '../../theme/ThemeProvider';
import { AnimatedButton } from '../../components/AnimatedButton';

describe('AnimatedButton', () => {
  const mockOnPress = jest.fn();

  beforeEach(() => {
    mockOnPress.mockClear();
  });

  const renderWithTheme = (component: React.ReactElement) => {
    return render(
      <ThemeProvider>
        {component}
      </ThemeProvider>
    );
  };

  it('should render with default props', () => {
    const { getByText } = renderWithTheme(
      <AnimatedButton title="Test Button" onPress={mockOnPress} />
    );

    expect(getByText('Test Button')).toBeTruthy();
  });

  it('should handle press events', () => {
    const { getByText } = renderWithTheme(
      <AnimatedButton title="Test Button" onPress={mockOnPress} />
    );

    fireEvent.press(getByText('Test Button'));
    expect(mockOnPress).toHaveBeenCalledTimes(1);
  });

  it('should render with different variants', () => {
    const { getByText, rerender } = renderWithTheme(
      <AnimatedButton title="Primary" onPress={mockOnPress} variant="primary" />
    );

    expect(getByText('Primary')).toBeTruthy();

    rerender(
      <ThemeProvider>
        <AnimatedButton title="Secondary" onPress={mockOnPress} variant="secondary" />
      </ThemeProvider>
    );

    expect(getByText('Secondary')).toBeTruthy();

    rerender(
      <ThemeProvider>
        <AnimatedButton title="Outline" onPress={mockOnPress} variant="outline" />
      </ThemeProvider>
    );

    expect(getByText('Outline')).toBeTruthy();

    rerender(
      <ThemeProvider>
        <AnimatedButton title="Ghost" onPress={mockOnPress} variant="ghost" />
      </ThemeProvider>
    );

    expect(getByText('Ghost')).toBeTruthy();
  });

  it('should render with different sizes', () => {
    const { getByText, rerender } = renderWithTheme(
      <AnimatedButton title="Small" onPress={mockOnPress} size="small" />
    );

    expect(getByText('Small')).toBeTruthy();

    rerender(
      <ThemeProvider>
        <AnimatedButton title="Medium" onPress={mockOnPress} size="medium" />
      </ThemeProvider>
    );

    expect(getByText('Medium')).toBeTruthy();

    rerender(
      <ThemeProvider>
        <AnimatedButton title="Large" onPress={mockOnPress} size="large" />
      </ThemeProvider>
    );

    expect(getByText('Large')).toBeTruthy();
  });

  it('should be disabled when disabled prop is true', () => {
    const { getByText } = renderWithTheme(
      <AnimatedButton title="Disabled" onPress={mockOnPress} disabled={true} />
    );

    const button = getByText('Disabled');
    fireEvent.press(button);
    expect(mockOnPress).not.toHaveBeenCalled();
  });

  it('should show loading state', () => {
    const { getByTestId, queryByText } = renderWithTheme(
      <AnimatedButton title="Loading" onPress={mockOnPress} loading={true} />
    );

    // Should not show text when loading
    expect(queryByText('Loading')).toBeFalsy();
  });

  it('should render with icon', () => {
    const mockIcon = <View testID="test-icon"><Text>Icon</Text></View>;
    
    const { getByTestId } = renderWithTheme(
      <AnimatedButton title="With Icon" onPress={mockOnPress} icon={mockIcon} />
    );

    expect(getByTestId('test-icon')).toBeTruthy();
  });

  it('should apply custom styles', () => {
    const customStyle = { backgroundColor: 'red' };
    const customTextStyle = { color: 'blue' };

    const { getByText } = renderWithTheme(
      <AnimatedButton 
        title="Custom" 
        onPress={mockOnPress} 
        style={customStyle}
        customTextStyle={customTextStyle}
      />
    );

    expect(getByText('Custom')).toBeTruthy();
  });
});
