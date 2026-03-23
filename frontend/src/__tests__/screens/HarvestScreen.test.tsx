import React from 'react';
import { useAuth } from '../../context/AuthContext';

jest.mock('../../context/AuthContext');

const mockUser = { uid: 'test-user' };
(useAuth as jest.Mock).mockReturnValue({ user: mockUser });

jest.mock('react-native', () => ({
  StyleSheet: {
    create: jest.fn((styles) => styles),
  },
}));

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
