// Global mocks for Jest test environment

// Mock react-dom/server for renderToString
jest.mock('react-dom/server', () => ({
  renderToString: jest.fn(() => '<div></div>'),
}));

// react-native is handled by moduleNameMapper in jest.config.js
// Do NOT use jest.mock('react-native', ...) here — it conflicts with moduleNameMapper in setupFilesAfterEnv

// Mock Dimensions globally
jest.mock('react-native/Libraries/Utilities/Dimensions', () => ({
  get: jest.fn(() => ({
    width: 375,
    height: 667,
  })),
  addEventListener: jest.fn(),
  removeEventListener: jest.fn(),
}));

// Mock @testing-library/react-native by manually resolving React element trees
jest.mock('@testing-library/react-native', () => {
  const React = require('react');

  // Recursively resolve a React element into a plain tree
  const resolveElement = (el, depth) => {
    if (depth > 20) return null; // prevent infinite recursion
    if (el == null || typeof el === 'boolean') return null;
    if (typeof el === 'string' || typeof el === 'number') return String(el);
    if (Array.isArray(el)) return el.map(c => resolveElement(c, depth + 1)).filter(Boolean);

    // React element - function component
    if (el.type && typeof el.type === 'function') {
      try {
        const result = el.type({ ...el.props });
        return resolveElement(result, depth + 1);
      } catch(e) {
        // Hooks fail outside React runtime — fall back to rendering children
        if (el.props && el.props.children) {
          return resolveElement(el.props.children, depth + 1);
        }
        return null;
      }
    }

    // Host element (string type like 'View', 'Text', 'div')
    const props = { ...(el.props || {}) };
    const rawChildren = props.children;
    delete props.children;

    let children = [];
    if (rawChildren != null) {
      const arr = Array.isArray(rawChildren) ? rawChildren : [rawChildren];
      children = arr.map(c => resolveElement(c, depth + 1)).filter(Boolean);
    }

    return { type: el.type || 'unknown', props, children };
  };

  // Walk resolved tree
  const walkTree = (node, predicate) => {
    if (!node) return null;
    if (typeof node === 'string') return predicate(node) ? node : null;
    if (Array.isArray(node)) {
      for (const child of node) {
        const found = walkTree(child, predicate);
        if (found) return found;
      }
      return null;
    }
    if (predicate(node)) return node;
    for (const child of (node.children || [])) {
      const found = walkTree(child, predicate);
      if (found) return found;
    }
    return null;
  };

  const render = (component) => {
    const resolved = resolveElement(component, 0);

    const getByText = (text) => {
      // Find a node that contains the text as a direct string child
      const found = walkTree(resolved, (node) => {
        if (typeof node === 'string') return node === text;
        if (node.children) {
          return node.children.some(c => typeof c === 'string' && c === text);
        }
        return false;
      });
      if (!found) throw new Error(`Unable to find text: ${text}`);
      return typeof found === 'string' ? { type: 'Text', props: {}, children: [found] } : found;
    };

    const getByTestId = (testId) => {
      const found = walkTree(resolved, (node) => {
        if (typeof node === 'string') return false;
        return node.props && (node.props.testID === testId || node.props['data-testid'] === testId);
      });
      if (!found) throw new Error(`Unable to find testID: ${testId}`);
      return found;
    };

    const queryByText = (text) => { try { return getByText(text); } catch(e) { return null; } };
    const queryByTestId = (testId) => { try { return getByTestId(testId); } catch(e) { return null; } };

    return {
      getByText,
      getByTestId,
      queryByText,
      queryByTestId,
      findByText: async (text) => getByText(text),
      findByTestId: async (testId) => getByTestId(testId),
      toJSON: () => resolved,
      unmount: jest.fn(),
      rerender: jest.fn(),
    };
  };

  const renderHook = (hookFn, options = {}) => {
    const TestRenderer = require('react-test-renderer');
    const Wrapper = options.wrapper || (({ children }) => children);
    const mockResult = { current: undefined };

    const TestComponent = () => {
      mockResult.current = hookFn();
      return null;
    };

    let renderer;
    TestRenderer.act(() => {
      renderer = TestRenderer.create(
        React.createElement(Wrapper, null, React.createElement(TestComponent))
      );
    });

    return {
      result: mockResult,
      rerender: jest.fn(),
      unmount: () => renderer && TestRenderer.act(() => renderer.unmount()),
    };
  };

  return {
    render,
    renderHook,
    act: async (fn) => {
      const TestRenderer = require('react-test-renderer');
      await TestRenderer.act(async () => { await fn(); });
    },
    fireEvent: {
      press: jest.fn((el) => { if (el && el.props && el.props.onPress) el.props.onPress(); }),
      changeText: jest.fn(),
      scroll: jest.fn(),
    },
    waitFor: async (fn) => { return await fn(); },
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
  initializeAuth: jest.fn(() => 'mock-auth'),
  onAuthStateChanged: jest.fn((_auth, cb) => { cb(null); return jest.fn(); }),
  signInWithEmailAndPassword: jest.fn(),
  createUserWithEmailAndPassword: jest.fn(),
  signOut: jest.fn(),
  sendPasswordResetEmail: jest.fn(),
  browserLocalPersistence: 'mock-browser-local-persistence',
  browserPopupRedirectResolver: 'mock-browser-popup-redirect-resolver',
  GoogleAuthProvider: jest.fn().mockImplementation(() => ({ addScope: jest.fn() })),
  FacebookAuthProvider: jest.fn().mockImplementation(() => ({ addScope: jest.fn() })),
  OAuthProvider: jest.fn().mockImplementation(() => ({ addScope: jest.fn() })),
  signInWithPopup: jest.fn(),
  signInWithRedirect: jest.fn().mockResolvedValue(undefined),
  getRedirectResult: jest.fn().mockResolvedValue(null),
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

// Mock @notifee/react-native with all APIs used by NotificationService
const mockNotifee = {
  requestPermission: jest.fn().mockResolvedValue({ authorizationStatus: 1 }),
  getNotificationSettings: jest.fn().mockResolvedValue({ authorizationStatus: 1 }),
  createChannel: jest.fn().mockResolvedValue(undefined),
  displayNotification: jest.fn().mockResolvedValue(undefined),
  createTriggerNotification: jest.fn().mockResolvedValue(undefined),
  cancelNotification: jest.fn().mockResolvedValue(undefined),
  cancelAllNotifications: jest.fn().mockResolvedValue(undefined),
  getTriggerNotificationIds: jest.fn().mockResolvedValue([]),
  onForegroundEvent: jest.fn().mockImplementation(() => jest.fn()),
  onBackgroundEvent: jest.fn().mockImplementation((handler) => handler),
  AndroidImportance: { HIGH: 4, DEFAULT: 3 },
  AndroidVisibility: { PUBLIC: 1 },
  TriggerType: { TIMESTAMP: 0 },
  AndroidStyle: { BIGTEXT: 1 },
  EventType: { PRESS: 1 },
};

jest.mock('@notifee/react-native', () => mockNotifee);

global.__NOTIFEE__ = mockNotifee;

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
