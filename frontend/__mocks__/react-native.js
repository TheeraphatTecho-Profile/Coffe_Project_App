// Mock react-native for Jest (avoids parsing RN 0.83 Flow/TS source)
const React = require('react');

const View = (props) => React.createElement('View', props);
const Text = (props) => React.createElement('Text', props);
const TouchableOpacity = (props) => React.createElement('TouchableOpacity', props);
const ScrollView = (props) => React.createElement('ScrollView', props);
const TextInput = (props) => React.createElement('TextInput', props);
const Image = (props) => React.createElement('Image', props);
const FlatList = (props) => React.createElement('FlatList', props);
const ActivityIndicator = (props) => React.createElement('ActivityIndicator', props);
const Switch = (props) => React.createElement('Switch', props);
const Modal = (props) => React.createElement('Modal', props);
const Pressable = (props) => React.createElement('Pressable', props);
const RefreshControl = (props) => React.createElement('RefreshControl', props);
const KeyboardAvoidingView = (props) => React.createElement('KeyboardAvoidingView', props);

module.exports = {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  TextInput,
  Image,
  FlatList,
  ActivityIndicator,
  Switch,
  Modal,
  Pressable,
  RefreshControl,
  KeyboardAvoidingView,
  StyleSheet: {
    create: (styles) => styles,
    flatten: (style) => style || {},
    absoluteFillObject: { position: 'absolute', left: 0, right: 0, top: 0, bottom: 0 },
    hairlineWidth: 1,
  },
  Platform: {
    OS: 'android',
    select: (obj) => obj.android || obj.default,
    Version: 33,
  },
  Dimensions: {
    get: () => ({ width: 375, height: 812, scale: 2, fontScale: 1 }),
    addEventListener: jest.fn(() => ({ remove: jest.fn() })),
  },
  Alert: {
    alert: jest.fn(),
  },
  Animated: {
    View,
    Text,
    Image,
    ScrollView,
    FlatList,
    Value: jest.fn(() => ({
      setValue: jest.fn(),
      interpolate: jest.fn(() => 0),
    })),
    timing: jest.fn(() => ({ start: jest.fn((cb) => cb && cb()) })),
    spring: jest.fn(() => ({ start: jest.fn((cb) => cb && cb()) })),
    parallel: jest.fn(() => ({ start: jest.fn((cb) => cb && cb()) })),
    sequence: jest.fn(() => ({ start: jest.fn((cb) => cb && cb()) })),
    createAnimatedComponent: (comp) => comp,
    event: jest.fn(),
  },
  Linking: {
    openURL: jest.fn(),
    canOpenURL: jest.fn(() => Promise.resolve(true)),
    addEventListener: jest.fn(),
    getInitialURL: jest.fn(() => Promise.resolve(null)),
  },
  PixelRatio: {
    get: () => 2,
    getFontScale: () => 1,
    getPixelSizeForLayoutSize: (size) => size * 2,
    roundToNearestPixel: (size) => size,
  },
  useColorScheme: () => 'light',
  useWindowDimensions: () => ({ width: 375, height: 812, scale: 2, fontScale: 1 }),
  StatusBar: {
    setBarStyle: jest.fn(),
    setBackgroundColor: jest.fn(),
  },
  Keyboard: {
    dismiss: jest.fn(),
    addListener: jest.fn(() => ({ remove: jest.fn() })),
  },
  I18nManager: {
    isRTL: false,
  },
  AppState: {
    currentState: 'active',
    addEventListener: jest.fn(() => ({ remove: jest.fn() })),
  },
};
