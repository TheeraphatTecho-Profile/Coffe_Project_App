module.exports = {
  testEnvironment: 'node',
  transform: {
    '^.+\\.(ts|tsx|js|jsx)$': ['babel-jest', {
      presets: [
        ['@babel/preset-env', { targets: { node: 'current' } }],
        '@babel/preset-typescript',
        '@babel/preset-flow',
        ['@babel/preset-react', { runtime: 'automatic' }],
      ],
    }],
  },
  transformIgnorePatterns: [
    'node_modules/(?!((jest-)?react-native|@react-native(-community)?)|expo(nent)?|@expo(nent)?/.*|react-navigation|@react-navigation/.*|native-base|react-native-svg|firebase|@firebase|@testing-library)',
  ],
  setupFiles: ['./jest.setup.js'],
  testPathIgnorePatterns: [
    'firebase\\.mock\\.ts$',
    'node_modules/',
  ],
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json'],
  moduleNameMapper: {
    '^react-native$': '<rootDir>/__mocks__/react-native.js',
    '^react-native/(.*)$': '<rootDir>/__mocks__/react-native.js',
  },
};
