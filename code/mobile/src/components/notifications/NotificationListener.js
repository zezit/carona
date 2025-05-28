import React from 'react';
import { useNotification } from '../../contexts/NotificationContext';
import { useToastNotifications } from '../../hooks/useToastNotifications';

export const NotificationListener = () => {
  const { connected } = useNotification();
  const { showSuccess } = useToastNotifications();

  React.useEffect(() => {
    // Show connection status toast
    if (connected) {
      showSuccess('Notificações ativadas', 'Conectado');
    }
  }, [connected, showSuccess]);

  return null;
};

export default NotificationListener;
