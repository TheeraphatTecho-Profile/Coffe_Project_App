import { useCallback, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { showAlert } from '../lib/alert';

interface UseLogoutResult {
  isLoggingOut: boolean;
  requestLogout: () => void;
}

/**
 * Reusable logout hook with shared confirmation and error handling.
 */
export const useLogout = (): UseLogoutResult => {
  const { signOut } = useAuth();
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const performLogout = useCallback(async () => {
    if (isLoggingOut) {
      return;
    }

    setIsLoggingOut(true);

    try {
      await signOut();
    } catch (err) {
      console.error('Logout failed:', err);
      showAlert('ออกจากระบบไม่สำเร็จ', 'ไม่สามารถออกจากระบบได้ กรุณาลองใหม่อีกครั้ง');
    } finally {
      setIsLoggingOut(false);
    }
  }, [isLoggingOut, signOut]);

  const requestLogout = useCallback(() => {
    if (isLoggingOut) {
      return;
    }

    showAlert(
      'ออกจากระบบ',
      'คุณต้องการออกจากระบบใช่หรือไม่?',
      [
        { text: 'ยกเลิก', style: 'cancel' },
        {
          text: 'ออกจากระบบ',
          style: 'destructive',
          onPress: () => {
            void performLogout();
          },
        },
      ]
    );
  }, [isLoggingOut, performLogout]);

  return {
    isLoggingOut,
    requestLogout,
  };
};
