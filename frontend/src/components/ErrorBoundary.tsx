import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Platform,
} from 'react-native';

interface Props {
  children: React.ReactNode;
  fallback?: React.ReactNode;
  onError?: (error: Error, info: React.ErrorInfo) => void;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: React.ErrorInfo | null;
  isAuthError: boolean;
  isNetworkError: boolean;
}

const AUTH_ERROR_CODES = [
  'auth/network-request-failed',
  'auth/popup-closed-by-user',
  'auth/popup-blocked',
  'auth/cancelled-popup-request',
  'auth/internal-error',
  'auth/too-many-requests',
  'auth/user-disabled',
  'auth/invalid-credential',
];

function classifyError(error: Error): { isAuthError: boolean; isNetworkError: boolean } {
  const msg = error.message?.toLowerCase() ?? '';
  const code = (error as any).code ?? '';

  const isNetworkError =
    msg.includes('network') ||
    msg.includes('fetch') ||
    msg.includes('timeout') ||
    msg.includes('connection') ||
    msg.includes('offline') ||
    code === 'auth/network-request-failed';

  const isAuthError =
    AUTH_ERROR_CODES.some(c => code === c) ||
    msg.includes('auth') ||
    msg.includes('sign in') ||
    msg.includes('sign out') ||
    msg.includes('firebase');

  return { isAuthError, isNetworkError };
}

export class ErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      isAuthError: false,
      isNetworkError: false,
    };
  }

  static getDerivedStateFromError(error: Error): Partial<State> {
    const { isAuthError, isNetworkError } = classifyError(error);
    return { hasError: true, error, isAuthError, isNetworkError };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    this.setState({ errorInfo });
    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }
    console.error('[ErrorBoundary] Caught error:', error);
    console.error('[ErrorBoundary] Component stack:', errorInfo.componentStack);
  }

  handleRetry = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
      isAuthError: false,
      isNetworkError: false,
    });
  };

  handleReload = () => {
    if (Platform.OS === 'web') {
      globalThis.location?.reload();
    } else {
      this.handleRetry();
    }
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      const { error, isAuthError, isNetworkError } = this.state;

      let title = 'เกิดข้อผิดพลาด';
      let message = 'แอปพลิเคชันพบปัญหาที่ไม่คาดคิด กรุณาลองใหม่อีกครั้ง';
      let emoji = '⚠️';

      if (isNetworkError) {
        title = 'ไม่มีการเชื่อมต่ออินเทอร์เน็ต';
        message = 'กรุณาตรวจสอบการเชื่อมต่อเครือข่ายและลองใหม่อีกครั้ง';
        emoji = '📡';
      } else if (isAuthError) {
        title = 'ปัญหาการเข้าสู่ระบบ';
        message = 'เกิดข้อผิดพลาดในการยืนยันตัวตน กรุณาลองเข้าสู่ระบบใหม่';
        emoji = '🔐';
      }

      return (
        <View style={styles.container}>
          <View style={styles.card}>
            <Text style={styles.emoji}>{emoji}</Text>
            <Text style={styles.title}>{title}</Text>
            <Text style={styles.message}>{message}</Text>

            {__DEV__ && error && (
              <ScrollView style={styles.debugBox}>
                <Text style={styles.debugText}>{error.toString()}</Text>
              </ScrollView>
            )}

            <TouchableOpacity style={styles.retryButton} onPress={this.handleRetry}>
              <Text style={styles.retryText}>ลองใหม่อีกครั้ง</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.reloadButton} onPress={this.handleReload}>
              <Text style={styles.reloadText}>รีโหลดแอป</Text>
            </TouchableOpacity>
          </View>
        </View>
      );
    }

    return this.props.children;
  }
}

export class AuthErrorBoundary extends React.Component<
  { children: React.ReactNode; onAuthError?: () => void },
  State
> {
  constructor(props: { children: React.ReactNode; onAuthError?: () => void }) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      isAuthError: false,
      isNetworkError: false,
    };
  }

  static getDerivedStateFromError(error: Error): Partial<State> {
    const { isAuthError, isNetworkError } = classifyError(error);
    return { hasError: true, error, isAuthError, isNetworkError };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    this.setState({ errorInfo });
    console.error('[AuthErrorBoundary] Auth error caught:', error.message);
    if (this.props.onAuthError) {
      this.props.onAuthError();
    }
  }

  handleRetry = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
      isAuthError: false,
      isNetworkError: false,
    });
  };

  render() {
    if (this.state.hasError) {
      const { isNetworkError } = this.state;
      return (
        <View style={styles.container}>
          <View style={styles.card}>
            <Text style={styles.emoji}>{isNetworkError ? '📡' : '🔐'}</Text>
            <Text style={styles.title}>
              {isNetworkError ? 'ไม่มีการเชื่อมต่อ' : 'เข้าสู่ระบบไม่สำเร็จ'}
            </Text>
            <Text style={styles.message}>
              {isNetworkError
                ? 'กรุณาตรวจสอบอินเทอร์เน็ตและลองอีกครั้ง'
                : 'เกิดปัญหาในการเข้าสู่ระบบ กรุณาลองใหม่'}
            </Text>
            <TouchableOpacity style={styles.retryButton} onPress={this.handleRetry}>
              <Text style={styles.retryText}>ลองอีกครั้ง</Text>
            </TouchableOpacity>
          </View>
        </View>
      );
    }
    return this.props.children;
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F5F7FA',
    padding: 24,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 32,
    alignItems: 'center',
    width: '100%',
    maxWidth: 400,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 4,
  },
  emoji: {
    fontSize: 56,
    marginBottom: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1A2332',
    textAlign: 'center',
    marginBottom: 12,
  },
  message: {
    fontSize: 14,
    color: '#5A6B7D',
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 24,
  },
  debugBox: {
    backgroundColor: '#FFF3E0',
    borderRadius: 8,
    padding: 12,
    width: '100%',
    maxHeight: 120,
    marginBottom: 16,
  },
  debugText: {
    fontSize: 11,
    color: '#E65100',
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
  },
  retryButton: {
    backgroundColor: '#2E7D32',
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 32,
    width: '100%',
    alignItems: 'center',
    marginBottom: 12,
  },
  retryText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  reloadButton: {
    borderWidth: 1.5,
    borderColor: '#CBD5E0',
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 32,
    width: '100%',
    alignItems: 'center',
  },
  reloadText: {
    color: '#5A6B7D',
    fontSize: 15,
    fontWeight: '500',
  },
});
