import React from 'react';

describe('ProfileScreen', () => {
  it('should be importable without errors', () => {
    const mod = require('../../screens/profile/ProfileScreen');
    expect(mod).toBeDefined();
    expect(mod.ProfileScreen).toBeDefined();
  });

  it('should be a valid React component', () => {
    const { ProfileScreen } = require('../../screens/profile/ProfileScreen');
    expect(typeof ProfileScreen).toBe('function');
  });

  it('should render without throwing', () => {
    const { ProfileScreen } = require('../../screens/profile/ProfileScreen');
    expect(() => {
      React.createElement(ProfileScreen);
    }).not.toThrow();
  });
});
