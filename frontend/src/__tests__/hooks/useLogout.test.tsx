import React from 'react';
import { Text, TouchableOpacity, View } from 'react-native';
import { render, fireEvent, act } from '@testing-library/react-native';
import { useLogout } from '../../hooks/useLogout';
import { useAuth } from '../../context/AuthContext';
import { showAlert } from '../../lib/alert';

jest.mock('../../context/AuthContext', () => ({
  useAuth: jest.fn(),
}));

jest.mock('../../lib/alert', () => ({
  showAlert: jest.fn(),
}));

const TestComponent: React.FC = () => {
  const { requestLogout, isLoggingOut } = useLogout();

  return (
    <View>
      <Text>{isLoggingOut ? 'loading' : 'idle'}</Text>
      <TouchableOpacity onPress={requestLogout}>
        <Text>logout</Text>
      </TouchableOpacity>
    </View>
  );
};

describe('useLogout', () => {
  const mockSignOut = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    (useAuth as jest.Mock).mockReturnValue({
      signOut: mockSignOut,
    });
  });

  it('should show logout confirmation dialog', () => {
    const { getByText } = render(<TestComponent />);

    fireEvent.press(getByText('logout'));

    expect(showAlert).toHaveBeenCalledWith(
      'ออกจากระบบ',
      'คุณต้องการออกจากระบบใช่หรือไม่?',
      expect.arrayContaining([
        expect.objectContaining({ text: 'ยกเลิก', style: 'cancel' }),
        expect.objectContaining({ text: 'ออกจากระบบ', style: 'destructive' }),
      ])
    );
  });

  it('should sign out when confirmation is accepted', async () => {
    mockSignOut.mockResolvedValue(undefined);
    const { getByText } = render(<TestComponent />);

    fireEvent.press(getByText('logout'));

    const buttons = (showAlert as jest.Mock).mock.calls[0][2];

    await act(async () => {
      await buttons[1].onPress();
    });

    expect(mockSignOut).toHaveBeenCalledTimes(1);
    expect(getByText('idle')).toBeTruthy();
  });

  it('should show error feedback when sign out fails', async () => {
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation();
    mockSignOut.mockRejectedValue(new Error('logout failed'));
    const { getByText } = render(<TestComponent />);

    fireEvent.press(getByText('logout'));

    const buttons = (showAlert as jest.Mock).mock.calls[0][2];

    await act(async () => {
      await buttons[1].onPress();
    });

    expect(consoleSpy).toHaveBeenCalledWith('Logout failed:', expect.any(Error));
    expect(showAlert).toHaveBeenLastCalledWith(
      'ออกจากระบบไม่สำเร็จ',
      'ไม่สามารถออกจากระบบได้ กรุณาลองใหม่อีกครั้ง'
    );
    expect(getByText('idle')).toBeTruthy();

    consoleSpy.mockRestore();
  });

  it('should prevent duplicate logout requests while signing out', async () => {
    let resolveSignOut: (() => void) | null = null;
    mockSignOut.mockImplementation(
      () => new Promise<void>((resolve) => {
        resolveSignOut = resolve;
      })
    );

    const { getByText } = render(<TestComponent />);

    fireEvent.press(getByText('logout'));

    const buttons = (showAlert as jest.Mock).mock.calls[0][2];

    await act(async () => {
      await buttons[1].onPress();
    });

    expect(getByText('loading')).toBeTruthy();

    fireEvent.press(getByText('logout'));

    expect(showAlert).toHaveBeenCalledTimes(1);

    await act(async () => {
      resolveSignOut?.();
    });

    expect(getByText('idle')).toBeTruthy();
  });
});
