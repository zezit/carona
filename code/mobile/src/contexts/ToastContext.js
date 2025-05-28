import React, { createContext, useContext, useState, useCallback, useRef } from 'react';
import { Animated, Dimensions, Platform } from 'react-native';

const ToastContext = createContext();

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};

const DEFAULT_DURATION = 4000;
const ANIMATION_DURATION = 300;

export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);
  const toastCounter = useRef(0);

  const generateId = useCallback(() => {
    toastCounter.current += 1;
    return `toast_${toastCounter.current}_${Date.now()}`;
  }, []);

  const addToast = useCallback((config) => {
    const id = generateId();
    const toast = {
      id,
      animatedValue: new Animated.Value(0),
      duration: DEFAULT_DURATION,
      ...config,
    };

    setToasts(prev => [toast, ...prev]);

    // Auto dismiss
    if (toast.duration > 0) {
      setTimeout(() => {
        dismissToast(id);
      }, toast.duration);
    }

    return id;
  }, [generateId]);

  const dismissToast = useCallback((id) => {
    setToasts(prev => {
      const toast = prev.find(t => t.id === id);
      if (toast) {
        // Animate out
        Animated.timing(toast.animatedValue, {
          toValue: -1,
          duration: ANIMATION_DURATION,
          useNativeDriver: true,
        }).start(() => {
          setToasts(current => current.filter(t => t.id !== id));
        });
      }
      return prev;
    });
  }, []);

  const dismissAllToasts = useCallback(() => {
    setToasts(prev => {
      prev.forEach(toast => {
        Animated.timing(toast.animatedValue, {
          toValue: -1,
          duration: ANIMATION_DURATION,
          useNativeDriver: true,
        }).start();
      });
      return [];
    });
  }, []);

  // Toast type helpers
  const showSuccess = useCallback((message, options = {}) => {
    return addToast({
      type: 'success',
      message,
      ...options,
    });
  }, [addToast]);

  const showError = useCallback((message, options = {}) => {
    return addToast({
      type: 'error',
      message,
      ...options,
    });
  }, [addToast]);

  const showInfo = useCallback((message, options = {}) => {
    return addToast({
      type: 'info',
      message,
      ...options,
    });
  }, [addToast]);

  const showWarning = useCallback((message, options = {}) => {
    return addToast({
      type: 'warning',
      message,
      ...options,
    });
  }, [addToast]);

  const showNotification = useCallback((notification, options = {}) => {
    return addToast({
      type: 'notification',
      notification,
      ...options,
    });
  }, [addToast]);

  const value = {
    toasts,
    showToast: addToast, // Alias for backward compatibility
    addToast,
    dismissToast,
    dismissAllToasts,
    showSuccess,
    showError,
    showInfo,
    showWarning,
    showNotification,
  };

  return (
    <ToastContext.Provider value={value}>
      {children}
    </ToastContext.Provider>
  );
};
