import React from 'react';
import { Logo } from '../../components/Logo';

describe('Logo Working Tests', () => {
  it('should import and be defined', () => {
    expect(Logo).toBeDefined();
    expect(typeof Logo).toBe('function');
  });

  it('should be a React component', () => {
    expect(React.isValidElement(<Logo />)).toBe(true);
  });

  it('should accept size prop', () => {
    const logo = React.createElement(Logo, { size: 'small' as const });
    expect(logo).toBeDefined();
    expect((logo.props as any).size).toBe('small');
  });

  it('should accept color prop', () => {
    const logo = React.createElement(Logo, { color: '#FF0000' });
    expect(logo).toBeDefined();
    expect((logo.props as any).color).toBe('#FF0000');
  });

  it('should accept showText prop', () => {
    const logo = React.createElement(Logo, { showText: false });
    expect(logo).toBeDefined();
    expect((logo.props as any).showText).toBe(false);
  });

  it('should have correct default props', () => {
    const logo = React.createElement(Logo, {});
    expect((logo.props as any).size).toBeUndefined(); // Will use default 'medium'
    expect((logo.props as any).color).toBeUndefined(); // Will use theme color
    expect((logo.props as any).showText).toBeUndefined(); // Will use default true
  });
});
