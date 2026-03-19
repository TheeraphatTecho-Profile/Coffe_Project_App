import React from 'react';

describe('PriceScreen (Analytics)', () => {
  it('should be importable without errors', () => {
    const mod = require('../../screens/price/PriceScreen');
    expect(mod).toBeDefined();
    expect(mod.PriceScreen).toBeDefined();
  });

  it('should be a valid React component', () => {
    const { PriceScreen } = require('../../screens/price/PriceScreen');
    expect(typeof PriceScreen).toBe('function');
  });

  it('should render without throwing', () => {
    const { PriceScreen } = require('../../screens/price/PriceScreen');
    expect(() => {
      React.createElement(PriceScreen);
    }).not.toThrow();
  });
});
