import React from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { AuthProvider } from './src/contexts/AuthContext';
import { ToastProvider } from './src/contexts/ToastContext';
import { NotificationProvider } from './src/contexts/NotificationContext';
import ToastContainer from './src/components/ui/ToastContainer';
import AppNavigator from './src/navigation/AppNavigator';
import RatingOverlay from './src/components/common/RatingOverlay';

export default function App() {
  return (
    <SafeAreaProvider>
      <AuthProvider>
        <ToastProvider>
          <NotificationProvider>
            <AppNavigator />
            <ToastContainer />
            <RatingOverlay />
          </NotificationProvider>
        </ToastProvider>
      </AuthProvider>
    </SafeAreaProvider>
  );
}
