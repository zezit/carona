import { useToast } from '../contexts/ToastContext';

/**
 * Custom hook that provides convenient methods for showing different types of toasts
 * @returns {Object} Object containing toast utility functions
 */
export const useToastNotifications = () => {
  const { showToast } = useToast();

  const showSuccess = (message, title = 'Sucesso') => {
    showToast({
      type: 'success',
      title,
      message,
      duration: 3000,
    });
  };

  const showError = (message, title = 'Erro') => {
    showToast({
      type: 'error',
      title,
      message,
      duration: 4000,
    });
  };

  const showWarning = (message, title = 'Atenção') => {
    showToast({
      type: 'warning',
      title,
      message,
      duration: 4000,
    });
  };

  const showInfo = (message, title = 'Informação') => {
    showToast({
      type: 'info',
      title,
      message,
      duration: 3000,
    });
  };

  const showNotification = (title, message, subtitle, onPress) => {
    const time = new Date().toLocaleTimeString('pt-BR', {
      hour: '2-digit',
      minute: '2-digit'
    });

    console.log('useToastNotifications: showNotification called with:', {
      title,
      message, 
      subtitle,
      time,
      hasOnPress: !!onPress
    });

    showToast({
      type: 'ride',
      title,
      message,
      subtitle,
      time,
      duration: 6000,
      onPress,
    });
  };

  const showRideConfirmed = (title, message, onPress) => {
    showToast({
      type: 'rideConfirmed',
      title,
      message,
      duration: 5000,
      onPress,
    });
  };

  const showRideCancelled = (title, message, onPress) => {
    showToast({
      type: 'rideCancelled',
      title,
      message,
      duration: 5000,
      onPress,
    });
  };

  return {
    showSuccess,
    showError,
    showWarning,
    showInfo,
    showNotification,
    showRideConfirmed,
    showRideCancelled,
    showToast, // Direct access to the original function
  };
};
