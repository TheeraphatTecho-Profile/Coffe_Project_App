import React from 'react';
import { render, act } from '@testing-library/react-native';
import { ThemeProvider, useTheme } from '../../theme/ThemeProvider';
import { ThemeMode } from '../../theme/types';

// Test component to access theme context
const TestComponent: React.FC<{ renderFn: (theme: any) => React.ReactNode }> = ({ renderFn }) => {
  const theme = useTheme();
  return <>{renderFn(theme)}</>;
};

describe('ThemeProvider', () => {
  it('should provide light theme by default', () => {
    const mockRender = jest.fn();
    
    render(
      <ThemeProvider>
        <TestComponent renderFn={(theme) => {
          mockRender(theme);
          return null;
        }} />
      </ThemeProvider>
    );

    expect(mockRender).toHaveBeenCalledWith(
      expect.objectContaining({
        themeMode: 'light',
        colors: expect.objectContaining({
          primary: '#2E7D32',
          background: '#F5F7FA',
        }),
      })
    );
  });

  it('should provide dark theme when specified', () => {
    const mockRender = jest.fn();
    
    render(
      <ThemeProvider defaultTheme="dark">
        <TestComponent renderFn={(theme) => {
          mockRender(theme);
          return null;
        }} />
      </ThemeProvider>
    );

    expect(mockRender).toHaveBeenCalledWith(
      expect.objectContaining({
        themeMode: 'dark',
        colors: expect.objectContaining({
          primary: '#4CAF50',
          background: '#0F1419',
        }),
      })
    );
  });

  it('should toggle theme mode', () => {
    let currentTheme: any = null;
    
    const TestToggleComponent: React.FC = () => {
      const theme = useTheme();
      currentTheme = theme;
      
      React.useEffect(() => {
        if (currentTheme.themeMode === 'light') {
          act(() => {
            theme.toggleTheme();
          });
        }
      }, [currentTheme?.themeMode]);
      
      return null;
    };

    render(
      <ThemeProvider>
        <TestToggleComponent />
      </ThemeProvider>
    );

    expect(currentTheme.themeMode).toBe('dark');
  });

  it('should set theme mode explicitly', () => {
    let currentTheme: any = null;
    
    const TestSetComponent: React.FC = () => {
      const theme = useTheme();
      currentTheme = theme;
      
      React.useEffect(() => {
        act(() => {
          theme.setThemeMode('dark' as ThemeMode);
        });
      }, []);
      
      return null;
    };

    render(
      <ThemeProvider>
        <TestSetComponent />
      </ThemeProvider>
    );

    expect(currentTheme.themeMode).toBe('dark');
  });

  it('should provide all theme properties', () => {
    const mockRender = jest.fn();
    
    render(
      <ThemeProvider>
        <TestComponent renderFn={(theme) => {
          mockRender(theme);
          return null;
        }} />
      </ThemeProvider>
    );

    const theme = mockRender.mock.calls[0][0];
    
    expect(theme).toHaveProperty('colors');
    expect(theme).toHaveProperty('spacing');
    expect(theme).toHaveProperty('typography');
    expect(theme).toHaveProperty('radius');
    expect(theme).toHaveProperty('shadows');
    expect(theme).toHaveProperty('animations');
    expect(theme).toHaveProperty('themeMode');
    expect(theme).toHaveProperty('toggleTheme');
    expect(theme).toHaveProperty('setThemeMode');
  });

  it('should throw error when useTheme is used outside provider', () => {
    const consoleError = jest.spyOn(console, 'error').mockImplementation();
    
    expect(() => {
      render(<TestComponent renderFn={() => null} />);
    }).toThrow('useTheme must be used within a ThemeProvider');
    
    consoleError.mockRestore();
  });

  it('should provide consistent theme values', () => {
    const mockRender = jest.fn();
    
    render(
      <ThemeProvider>
        <TestComponent renderFn={(theme) => {
          mockRender(theme);
          return null;
        }} />
      </ThemeProvider>
    );

    const theme = mockRender.mock.calls[0][0];
    
    // Check spacing scale
    expect(theme.spacing.xs).toBe(4);
    expect(theme.spacing.sm).toBe(8);
    expect(theme.spacing.md).toBe(12);
    expect(theme.spacing.lg).toBe(16);
    expect(theme.spacing.xl).toBe(20);
    expect(theme.spacing.xxl).toBe(24);
    expect(theme.spacing.xxxl).toBe(32);
    
    // Check typography
    expect(theme.typography.sizes.xs).toBe(11);
    expect(theme.typography.sizes.md).toBe(15);
    expect(theme.typography.sizes.xxl).toBe(24);
    
    // Check radius
    expect(theme.radius.sm).toBe(8);
    expect(theme.radius.md).toBe(12);
    expect(theme.radius.lg).toBe(16);
    expect(theme.radius.full).toBe(999);
  });

  it('should provide coffee-specific colors', () => {
    const mockRender = jest.fn();
    
    render(
      <ThemeProvider>
        <TestComponent renderFn={(theme) => {
          mockRender(theme);
          return null;
        }} />
      </ThemeProvider>
    );

    const colors = mockRender.mock.calls[0][0].colors;
    
    expect(colors.coffeeBean).toBe('#1A3C2A');
    expect(colors.coffeeLeaf).toBe('#2E7D32');
    expect(colors.coffeeMilk).toBe('#D4A84C');
    expect(colors.mountain).toBe('#607D8B');
    expect(colors.soil).toBe('#5D4037');
  });

  it('should provide status colors', () => {
    const mockRender = jest.fn();
    
    render(
      <ThemeProvider>
        <TestComponent renderFn={(theme) => {
          mockRender(theme);
          return null;
        }} />
      </ThemeProvider>
    );

    const colors = mockRender.mock.calls[0][0].colors;
    
    expect(colors.success).toBe('#2E7D32');
    expect(colors.error).toBe('#D32F2F');
    expect(colors.warning).toBe('#F57C00');
    expect(colors.info).toBe('#1976D2');
  });
});
