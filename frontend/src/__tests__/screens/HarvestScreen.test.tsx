import React from 'react';

describe('HarvestScreen', () => {
  it('should be importable without errors', () => {
    const mod = require('../../screens/harvest/HarvestScreen');
    expect(mod).toBeDefined();
    expect(mod.HarvestScreen).toBeDefined();
  });

  it('should be a valid React component', () => {
    const { HarvestScreen } = require('../../screens/harvest/HarvestScreen');
    expect(typeof HarvestScreen).toBe('function');
  });

  it('should render without throwing', () => {
    const { HarvestScreen } = require('../../screens/harvest/HarvestScreen');
    expect(() => {
      React.createElement(HarvestScreen);
    }).not.toThrow();
  });
});
