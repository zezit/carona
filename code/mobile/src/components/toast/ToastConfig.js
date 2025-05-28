import { colors, typography, radius, shadows } from '../../theme';
import { View, Text } from 'react-native';
import { nativeToastConfig } from './NativeToastConfig';

// Use native-looking toast config
export const toastConfig = {
  // Success toast style using native styles
  success: nativeToastConfig.success,

  // Info toast style using native styles
  info: nativeToastConfig.info,

  // Error toast style using native styles
  error: nativeToastConfig.error,
};
