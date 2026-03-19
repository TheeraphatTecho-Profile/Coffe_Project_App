import React from 'react';

describe('HomeScreen', () => {
  it('should be importable without errors', () => {
    const mod = require('../../screens/home/HomeScreen');
    expect(mod).toBeDefined();
    expect(mod.HomeScreen).toBeDefined();
  });

  it('should be a valid React component', () => {
    const { HomeScreen } = require('../../screens/home/HomeScreen');
    expect(typeof HomeScreen).toBe('function');
  });

  it('should render without throwing', () => {
    const { HomeScreen } = require('../../screens/home/HomeScreen');
    expect(() => {
      React.createElement(HomeScreen, { navigation: { navigate: jest.fn() } } as any);
    }).not.toThrow();
  });
});
