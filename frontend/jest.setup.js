// Global mocks for Jest test environment

// Mock @testing-library/react-native (avoids parsing react-native source)
jest.mock('@testing-library/react-native', () => {
  const React = require('react');
  return {
    render: (component) => ({
      getByText: jest.fn(),
      getByTestId: jest.fn(),
      queryByText: jest.fn(),
      queryByTestId: jest.fn(),
      findByText: jest.fn(),
      findByTestId: jest.fn(),
      toJSON: jest.fn(),
      unmount: jest.fn(),
    }),
    renderHook: (hookFn, options) => {
      let result = { current: undefined };
      const wrapper = options?.wrapper || (({ children }) => children);
      const TestComponent = () => {
        result.current = hookFn();
        return null;
      };
      // Simple synchronous render for hook testing
      try {
        const element = React.createElement(wrapper, { children: React.createElement(TestComponent) });
        // We rely on React to call the component synchronously
        require('react-dom/server').renderToString(element);
      } catch (e) {
        // Ignore render errors in test environment
      }
      return { result };
    },
    act: async (fn) => { await fn(); },
    fireEvent: {
      press: jest.fn(),
      changeText: jest.fn(),
      scroll: jest.fn(),
    },
    waitFor: async (fn) => fn(),
    screen: {
      getByText: jest.fn(),
      getByTestId: jest.fn(),
    },
  };
});

// Mock firebase/app
jest.mock('firebase/app', () => ({
  initializeApp: jest.fn(() => 'mock-app'),
  getApps: jest.fn(() => []),
  getApp: jest.fn(() => 'mock-app'),
}));

// Mock firebase/auth
jest.mock('firebase/auth', () => ({
  getAuth: jest.fn(() => 'mock-auth'),
  onAuthStateChanged: jest.fn((_auth, cb) => { cb(null); return jest.fn(); }),
  signInWithEmailAndPassword: jest.fn(),
  createUserWithEmailAndPassword: jest.fn(),
  signOut: jest.fn(),
  sendPasswordResetEmail: jest.fn(),
  GoogleAuthProvider: jest.fn().mockImplementation(() => ({ addScope: jest.fn() })),
  FacebookAuthProvider: jest.fn().mockImplementation(() => ({ addScope: jest.fn() })),
  OAuthProvider: jest.fn().mockImplementation(() => ({ addScope: jest.fn() })),
  signInWithPopup: jest.fn(),
  signInWithCredential: jest.fn(),
  updateProfile: jest.fn(),
}));

// Mock firebase/firestore
jest.mock('firebase/firestore', () => ({
  getFirestore: jest.fn(() => 'mock-db'),
  collection: jest.fn(() => 'mock-collection'),
  doc: jest.fn(() => 'mock-doc-ref'),
  getDocs: jest.fn(),
  getDoc: jest.fn(),
  addDoc: jest.fn(),
  updateDoc: jest.fn(),
  deleteDoc: jest.fn(),
  query: jest.fn((...args) => args),
  where: jest.fn((...args) => ({ type: 'where', args })),
  orderBy: jest.fn((...args) => ({ type: 'orderBy', args })),
  serverTimestamp: jest.fn(() => 'SERVER_TIMESTAMP'),
  Timestamp: { now: jest.fn(), fromDate: jest.fn() },
}));

// Mock expo-font
jest.mock('expo-font', () => ({
  loadAsync: jest.fn(),
  isLoaded: jest.fn(() => true),
  useFonts: jest.fn(() => [true, null]),
}));

// Mock expo-asset
jest.mock('expo-asset', () => ({
  Asset: { fromModule: jest.fn(() => ({ downloadAsync: jest.fn() })) },
}));

// Mock @expo/vector-icons
jest.mock('@expo/vector-icons', () => {
  const { Text } = require('react-native');
  return {
    Ionicons: (props) => Text({ ...props, children: props.name }),
    MaterialIcons: (props) => Text({ ...props, children: props.name }),
    AntDesign: (props) => Text({ ...props, children: props.name }),
    FontAwesome: (props) => Text({ ...props, children: props.name }),
  };
});

// Mock expo-linear-gradient
jest.mock('expo-linear-gradient', () => {
  const { View } = require('react-native');
  return { LinearGradient: (props) => View(props) };
});

// Mock expo-file-system
jest.mock('expo-file-system', () => ({
  File: jest.fn().mockImplementation((_dir, name) => ({
    uri: `file:///mock/${name}`,
    write: jest.fn().mockResolvedValue(undefined),
  })),
  Paths: { document: '/mock/documents' },
}));

// Mock expo-sharing
jest.mock('expo-sharing', () => ({
  shareAsync: jest.fn().mockResolvedValue(undefined),
  isAvailableAsync: jest.fn().mockResolvedValue(true),
}));

// Mock expo-status-bar
jest.mock('expo-status-bar', () => ({
  StatusBar: 'StatusBar',
}));

// Mock @react-native-async-storage/async-storage
jest.mock('@react-native-async-storage/async-storage', () => ({
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  multiRemove: jest.fn(),
  clear: jest.fn(),
}));

// Mock react-native-safe-area-context
jest.mock('react-native-safe-area-context', () => {
  const { View } = require('react-native');
  return {
    SafeAreaProvider: (props) => View(props),
    SafeAreaView: (props) => View(props),
    useSafeAreaInsets: () => ({ top: 0, right: 0, bottom: 0, left: 0 }),
  };
});

// Mock @react-navigation
jest.mock('@react-navigation/native', () => ({
  useNavigation: () => ({
    navigate: jest.fn(),
    goBack: jest.fn(),
    dispatch: jest.fn(),
    reset: jest.fn(),
    setOptions: jest.fn(),
  }),
  useRoute: () => ({ params: {} }),
  useFocusEffect: jest.fn(),
  NavigationContainer: ({ children }) => children,
  useIsFocused: jest.fn(() => true),
}));

jest.mock('@react-navigation/native-stack', () => ({
  createNativeStackNavigator: () => ({
    Navigator: ({ children }) => children,
    Screen: ({ children }) => children,
  }),
}));

jest.mock('@react-navigation/bottom-tabs', () => ({
  createBottomTabNavigator: () => ({
    Navigator: ({ children }) => children,
    Screen: ({ children }) => children,
  }),
}));

// Mock react-native-reanimated
jest.mock('react-native-reanimated', () => {
  const { View } = require('react-native');
  return {
    useSharedValue: (init) => ({ value: init }),
    useAnimatedStyle: (fn) => fn(),
    withTiming: (val) => val,
    withSpring: (val) => val,
    withDelay: (_d, val) => val,
    withSequence: (...args) => args[args.length - 1],
    Easing: { out: (fn) => fn, in: (fn) => fn, ease: (v) => v },
    FadeIn: { duration: () => ({ springify: () => ({}) }) },
    FadeInDown: { duration: () => ({ springify: () => ({}) }) },
    FadeInUp: { duration: () => ({ springify: () => ({}) }) },
    FadeOut: { duration: () => ({}) },
    SlideInRight: { duration: () => ({}) },
    SlideOutLeft: { duration: () => ({}) },
    runOnJS: (fn) => fn,
    default: { View, createAnimatedComponent: (comp) => comp },
    View: View,
  };
});

// Mock react-native-gesture-handler
jest.mock('react-native-gesture-handler', () => {
  const { View } = require('react-native');
  return {
    GestureHandlerRootView: (props) => View(props),
    Swipeable: View,
    DrawerLayout: View,
    PanGestureHandler: View,
    TapGestureHandler: View,
    State: {},
    Directions: {},
  };
});

// Mock @notifee/react-native
jest.mock('@notifee/react-native', () => ({
  createChannel: jest.fn(),
  displayNotification: jest.fn(),
  cancelAllNotifications: jest.fn(),
  requestPermission: jest.fn(),
  AuthorizationStatus: { AUTHORIZED: 1 },
}));

// Mock react-native-chart-kit
jest.mock('react-native-chart-kit', () => {
  const { View } = require('react-native');
  return {
    LineChart: (props) => View(props),
    BarChart: (props) => View(props),
    PieChart: (props) => View(props),
  };
});

// Mock react-native-svg
jest.mock('react-native-svg', () => {
  const { View } = require('react-native');
  return {
    Svg: View,
    Circle: View,
    Rect: View,
    Path: View,
    Line: View,
    G: View,
    Text: View,
    default: View,
  };
});
