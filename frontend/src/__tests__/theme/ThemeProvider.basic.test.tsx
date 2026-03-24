import React from 'react';
import { render } from '@testing-library/react-native';
import { View } from 'react-native';

// Import directly to avoid any module resolution issues
import { ThemeProvider } from '../../theme/ThemeProvider';

describe('ThemeProvider Basic', () => {
  it('should render children without theme context usage', () => {
    const { getByTestId } = render(
      <ThemeProvider>
        <View testID="test-child" />
      </ThemeProvider>
    );

    expect(getByTestId('test-child')).toBeTruthy();
  });

  it('should not crash when rendering', () => {
    expect(() => {
      render(
        <ThemeProvider>
          <View />
        </ThemeProvider>
      );
    }).not.toThrow();
  });
});
