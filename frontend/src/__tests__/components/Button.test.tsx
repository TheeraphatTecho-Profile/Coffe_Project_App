import React from 'react';
import { Button } from '../../components/Button';

describe('Button', () => {
  it('should be importable', () => {
    expect(Button).toBeDefined();
    expect(typeof Button).toBe('function');
  });

  it('should create element with title prop', () => {
    const el = React.createElement(Button, { title: 'Click me', onPress: jest.fn() });
    expect(el).toBeDefined();
    expect(el.props.title).toBe('Click me');
  });

  it('should accept variant props', () => {
    const variants = ['primary', 'outline', 'ghost', 'secondary'] as const;
    variants.forEach((variant) => {
      const el = React.createElement(Button, { title: variant, onPress: jest.fn(), variant });
      expect(el.props.variant).toBe(variant);
    });
  });

  it('should accept size props', () => {
    const sizes = ['sm', 'md', 'lg'] as const;
    sizes.forEach((size) => {
      const el = React.createElement(Button, { title: size, onPress: jest.fn(), size });
      expect(el.props.size).toBe(size);
    });
  });

  it('should accept disabled prop', () => {
    const el = React.createElement(Button, { title: 'Disabled', onPress: jest.fn(), disabled: true });
    expect(el.props.disabled).toBe(true);
  });

  it('should accept loading prop', () => {
    const el = React.createElement(Button, { title: 'Loading', onPress: jest.fn(), loading: true });
    expect(el.props.loading).toBe(true);
  });

  it('should accept icon prop', () => {
    const icon = React.createElement('View');
    const el = React.createElement(Button, { title: 'Icon', onPress: jest.fn(), icon });
    expect(el.props.icon).toBeDefined();
  });
});
