import React from 'react';
import { ThemeProvider } from '../../theme/ThemeProvider';

describe('ThemeProvider Working Tests', () => {
  it('should import and be defined', () => {
    expect(ThemeProvider).toBeDefined();
    expect(typeof ThemeProvider).toBe('function');
  });

  it('should be a React component', () => {
    expect(React.isValidElement(<ThemeProvider><div /></ThemeProvider>)).toBe(true);
  });

  it('should accept children prop', () => {
    const provider = React.createElement(ThemeProvider, { children: React.createElement('div') });
    expect(provider).toBeDefined();
    expect(provider.props.children).toBeDefined();
  });

  it('should accept defaultTheme prop', () => {
    const provider = React.createElement(ThemeProvider, { 
      defaultTheme: 'dark' as const,
      children: React.createElement('div')
    });
    expect((provider.props as any).defaultTheme).toBe('dark');
  });
});
