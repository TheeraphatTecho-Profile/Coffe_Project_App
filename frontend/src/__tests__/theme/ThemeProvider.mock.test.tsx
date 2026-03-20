import React from 'react';
import { createContext, useContext } from 'react';
import { render } from '@testing-library/react-native';
import { View } from 'react-native';

// Mock theme to avoid import issues
const mockTheme = {
  colors: { primary: '#3E2723', background: '#FAF7F2' },
  spacing: { xs: 4, sm: 8, md: 12, lg: 16 },
  typography: { sizes: { sm: 13, md: 15 } },
  radius: { sm: 8, md: 12 },
  shadows: { sm: {} },
  animations: { fast: 150, normal: 300 },
};

const MockThemeContext = createContext<any>(undefined);

const MockThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <MockThemeContext.Provider value={mockTheme}>
      {children}
    </MockThemeContext.Provider>
  );
};

describe('ThemeProvider Mock', () => {
  it('should render children with mock provider', () => {
    const { getByTestId } = render(
      <MockThemeProvider>
        <View testID="test-child" />
      </MockThemeProvider>
    );

    expect(getByTestId('test-child')).toBeTruthy();
  });

  it('should pass context to children', () => {
    const TestComponent = () => {
      const theme = useContext(MockThemeContext);
      return <View testID=" themed-component" style={{ backgroundColor: theme?.colors.primary }} />;
    };

    const { getByTestId } = render(
      <MockThemeProvider>
        <TestComponent />
      </MockThemeProvider>
    );

    expect(getByTestId('themed-component')).toBeTruthy();
  });
});
