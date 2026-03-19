import React from 'react';
import { Input } from '../../components/Input';

describe('Input', () => {
  it('should be importable', () => {
    expect(Input).toBeDefined();
    expect(typeof Input).toBe('function');
  });

  it('should create element with label prop', () => {
    const el = React.createElement(Input, { label: 'Email' });
    expect(el.props.label).toBe('Email');
  });

  it('should accept placeholder prop', () => {
    const el = React.createElement(Input, { placeholder: 'Enter email' });
    expect(el.props.placeholder).toBe('Enter email');
  });

  it('should accept error prop', () => {
    const el = React.createElement(Input, { label: 'Email', error: 'Invalid email' });
    expect(el.props.error).toBe('Invalid email');
  });

  it('should accept hint prop', () => {
    const el = React.createElement(Input, { hint: 'Enter your email address' });
    expect(el.props.hint).toBe('Enter your email address');
  });

  it('should accept isPassword prop', () => {
    const el = React.createElement(Input, { isPassword: true, placeholder: 'Password' });
    expect(el.props.isPassword).toBe(true);
  });

  it('should accept onChangeText callback', () => {
    const mockChange = jest.fn();
    const el = React.createElement(Input, { onChangeText: mockChange });
    expect(el.props.onChangeText).toBe(mockChange);
  });

  it('should accept value prop', () => {
    const el = React.createElement(Input, { value: 'test@example.com' });
    expect(el.props.value).toBe('test@example.com');
  });

  it('should accept rightLabel and onRightLabelPress props', () => {
    const mockPress = jest.fn();
    const el = React.createElement(Input, { rightLabel: 'Forgot?', onRightLabelPress: mockPress });
    expect(el.props.rightLabel).toBe('Forgot?');
    expect(el.props.onRightLabelPress).toBe(mockPress);
  });
});
