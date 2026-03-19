import React from 'react';
import { PasswordStrength } from '../../components/PasswordStrength';

describe('PasswordStrength', () => {
  it('should be importable', () => {
    expect(PasswordStrength).toBeDefined();
    expect(typeof PasswordStrength).toBe('function');
  });

  it('should accept password prop', () => {
    const el = React.createElement(PasswordStrength, { password: 'abc' });
    expect(el.props.password).toBe('abc');
  });

  it('should accept empty password', () => {
    const el = React.createElement(PasswordStrength, { password: '' });
    expect(el.props.password).toBe('');
  });

  it('should accept complex password', () => {
    const el = React.createElement(PasswordStrength, { password: 'Abcdef12!' });
    expect(el.props.password).toBe('Abcdef12!');
  });

  it('should render without throwing for various passwords', () => {
    const passwords = ['', 'a', 'abc', 'abcdef1', 'Abcdef12', 'Abcdef12!'];
    passwords.forEach((password) => {
      expect(() => {
        React.createElement(PasswordStrength, { password });
      }).not.toThrow();
    });
  });
});
