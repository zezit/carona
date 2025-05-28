import React from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Toast from './Toast';
import { useToast } from '../../contexts/ToastContext';
import { SPACING } from '../../constants';

const { height: screenHeight } = Dimensions.get('window');

const ToastContainer = () => {
  const { toasts, dismissToast } = useToast();
  const insets = useSafeAreaInsets();

  if (toasts.length === 0) {
    return null;
  }

  return (
    <View 
      style={[
        styles.container, 
        { 
          paddingTop: insets.top + SPACING.md,
          maxHeight: screenHeight * 0.8, // Prevent overflow
        }
      ]} 
      pointerEvents="box-none"
    >
      <View style={styles.toastList}>
        {toasts.map((toast) => (
          <Toast
            key={toast.id}
            toast={toast}
            onDismiss={dismissToast}
          />
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 9999,
    paddingHorizontal: SPACING.lg,
    paddingBottom: SPACING.md,
    pointerEvents: 'box-none',
    alignItems: 'center', // Center horizontally
  },
  toastList: {
    width: '100%',
    alignItems: 'center', // Center the toasts
  },
});

export default ToastContainer;