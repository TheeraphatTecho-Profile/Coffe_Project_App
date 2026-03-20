// Mock react-native for Jest (avoids parsing RN 0.83 Flow/TS source)
const React = require('react');

// Create proper mock components that handle props correctly
const createMockComponent = (name) => (props) => {
  if (typeof props.children === 'function') {
    return props.children();
  }
  return React.createElement(name, props);
};

const View = createMockComponent('View');
const Text = createMockComponent('Text');
const TouchableOpacity = createMockComponent('TouchableOpacity');
const ScrollView = createMockComponent('ScrollView');
const TextInput = createMockComponent('TextInput');
const Image = createMockComponent('Image');
const FlatList = createMockComponent('FlatList');
const ActivityIndicator = createMockComponent('ActivityIndicator');
const Switch = createMockComponent('Switch');
const Modal = createMockComponent('Modal');
const Pressable = createMockComponent('Pressable');
const RefreshControl = createMockComponent('RefreshControl');
const KeyboardAvoidingView = createMockComponent('KeyboardAvoidingView');

// Enhanced StyleSheet mock that returns the input styles
const StyleSheet = {
  create: jest.fn((styles) => {
    // Ensure all style objects are properly returned
    const processedStyles = {};
    Object.keys(styles).forEach(key => {
      processedStyles[key] = styles[key];
    });
    return processedStyles;
  }),
  flatten: jest.fn((style) => {
    if (Array.isArray(style)) {
      return Object.assign({}, ...style);
    }
    return style || {};
  }),
  absoluteFillObject: { position: 'absolute', left: 0, right: 0, top: 0, bottom: 0 },
  hairlineWidth: 1,
  compose: jest.fn((style1, style2) => ({ ...style1, ...style2 })),
};

// TypeScript type mocks (these are just empty objects for type checking)
const ViewStyle = {};
const TextStyle = {};
const ImageStyle = {};
const NativeSyntheticEvent = {};
const TextInputChangeEventData = {};
const LayoutChangeEvent = {};
const ScrollViewScrollEventData = {};

// Export everything including individual exports for named imports
const mockReactNative = {
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
  StyleSheet,
  ViewStyle,
  TextStyle,
  ImageStyle,
  NativeSyntheticEvent,
  TextInputChangeEventData,
  LayoutChangeEvent,
  ScrollViewScrollEventData,
  Platform: {
    OS: 'android',
    select: (obj) => obj.android || obj.default,
    Version: 33,
    isPad: false,
    isTVOS: false,
  },
  Dimensions: {
    get: jest.fn(() => ({ width: 375, height: 812, scale: 2, fontScale: 1 })),
    addEventListener: jest.fn(() => ({ remove: jest.fn() })),
    removeEventListener: jest.fn(),
  },
  Alert: {
    alert: jest.fn(),
    prompt: jest.fn(),
  },
  Animated: {
    View,
    Text,
    Image,
    ScrollView,
    FlatList,
    Value: jest.fn(() => ({
      setValue: jest.fn(),
      getValue: jest.fn(() => 0),
      interpolate: jest.fn(() => 0),
      addListener: jest.fn(),
      removeListener: jest.fn(),
    })),
    timing: jest.fn(() => ({ start: jest.fn((cb) => cb && cb({ finished: true })) })),
    spring: jest.fn(() => ({ start: jest.fn((cb) => cb && cb({ finished: true })) })),
    parallel: jest.fn(() => ({ start: jest.fn((cb) => cb && cb({ finished: true })) })),
    sequence: jest.fn(() => ({ start: jest.fn((cb) => cb && cb({ finished: true })) })),
    createAnimatedComponent: (comp) => comp,
    event: jest.fn(() => jest.fn()),
    ValueXY: jest.fn(() => ({
      x: { setValue: jest.fn(), getValue: jest.fn(() => 0) },
      y: { setValue: jest.fn(), getValue: jest.fn(() => 0) },
    })),
  },
  Linking: {
    openURL: jest.fn(() => Promise.resolve()),
    canOpenURL: jest.fn(() => Promise.resolve(true)),
    addEventListener: jest.fn(() => ({ remove: jest.fn() })),
    removeEventListener: jest.fn(),
    getInitialURL: jest.fn(() => Promise.resolve(null)),
  },
  PixelRatio: {
    get: jest.fn(() => 2),
    getFontScale: jest.fn(() => 1),
    getPixelSizeForLayoutSize: jest.fn((size) => size * 2),
    roundToNearestPixel: jest.fn((size) => size),
  },
  useColorScheme: jest.fn(() => 'light'),
  useWindowDimensions: jest.fn(() => ({ width: 375, height: 812, scale: 2, fontScale: 1 })),
  StatusBar: {
    setBarStyle: jest.fn(),
    setBackgroundColor: jest.fn(),
    setHidden: jest.fn(),
    setNetworkActivityIndicatorVisible: jest.fn(),
  },
  Keyboard: {
    dismiss: jest.fn(),
    addListener: jest.fn(() => ({ remove: jest.fn() })),
    removeListener: jest.fn(),
    removeAllListeners: jest.fn(),
  },
  I18nManager: {
    isRTL: false,
    getConstants: jest.fn(() => ({ isRTL: false })),
  },
  AppState: {
    currentState: 'active',
    addEventListener: jest.fn(() => ({ remove: jest.fn() })),
    removeEventListener: jest.fn(),
  },
  InteractionManager: {
    runAfterInteractions: jest.fn((callback) => callback()),
  },
  LayoutAnimation: {
    configureNext: jest.fn(),
    Types: {
      spring: 'spring',
      linear: 'linear',
      easeInEaseOut: 'easeInEaseOut',
      easeIn: 'easeIn',
      easeOut: 'easeOut',
      keyboard: 'keyboard',
    },
    Properties: {
      opacity: 'opacity',
      scaleX: 'scaleX',
      scaleY: 'scaleY',
      scaleXY: 'scaleXY',
    },
  },
  PanResponder: {
    create: jest.fn(() => ({
      panHandlers: {},
    })),
  },
  Easing: {
    step0: jest.fn(),
    step1: jest.fn(),
    linear: jest.fn(),
    ease: jest.fn(),
    quad: jest.fn(),
    cubic: jest.fn(),
    sin: jest.fn(),
    circle: jest.fn(),
    elastic: jest.fn(),
    back: jest.fn(),
    bounce: jest.fn(),
    in: jest.fn(),
    out: jest.fn(),
    inOut: jest.fn(),
  },
};

module.exports = mockReactNative;

// Also export individual components for named imports
Object.keys(mockReactNative).forEach(key => {
  module.exports[key] = mockReactNative[key];
});
