import { Platform, Alert as RNAlert } from 'react-native';

type AlertButton = {
  text: string;
  onPress?: () => void;
  style?: 'default' | 'cancel' | 'destructive';
};

/**
 * Cross-platform Alert that works on both native and web.
 * - Native: uses React Native Alert.alert
 * - Web: uses globalThis.confirm for 2-button dialogs, globalThis.alert for single-button
 */
export const showAlert = (
  title: string,
  message?: string,
  buttons?: AlertButton[]
): void => {
  if (Platform.OS !== 'web') {
    RNAlert.alert(title, message, buttons);
    return;
  }

  if (!buttons || buttons.length <= 1) {
    const text = message ? `${title}\n\n${message}` : title;
    globalThis.alert?.(text);
    buttons?.[0]?.onPress?.();
    return;
  }

  const confirmButton = buttons.find(
    (b) => b.style !== 'cancel' && b.style !== 'destructive'
  ) ?? buttons[buttons.length - 1];
  const cancelButton = buttons.find((b) => b.style === 'cancel');
  const destructiveButton = buttons.find((b) => b.style === 'destructive');

  const actionButton = destructiveButton ?? confirmButton;
  const text = message ? `${title}\n\n${message}` : title;

  const confirmed = globalThis.confirm?.(text);
  if (confirmed) {
    actionButton?.onPress?.();
  } else {
    cancelButton?.onPress?.();
  }
};
