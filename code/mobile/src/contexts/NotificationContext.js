import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { Alert, Platform } from 'react-native';
import { Client } from '@stomp/stompjs';
import SockJS from 'sockjs-client';
import { WS_URL } from '../services/websocket/config';
import { useAuthContext } from './AuthContext';
import { useToastNotifications } from '../hooks/useToastNotifications';
import { apiClient } from '../services/api/apiClient';

const NotificationContext = createContext(null);

export const useNotification = () => {
    const context = useContext(NotificationContext);
    if (!context) {
        throw new Error('useNotification must be used within a NotificationProvider');
    }
    return context;
};

export const NotificationProvider = ({ children }) => {
  const [socket, setSocket] = useState(null);
  const [connected, setConnected] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [navigationRef, setNavigationRef] = useState(null);
  const { user, authToken } = useAuthContext();
  const { showToast, showNotification } = useToastNotifications();

    useEffect(() => {
        console.log('NotificationContext: Initializing STOMP connection to', WS_URL);

        const socket = new SockJS(`${WS_URL}/ws-notificacoes`);
        const stompClient = new Client({
            webSocketFactory: () => socket,
            debug: (str) => {
                console.log('STOMP: ', str);
            },
            reconnectDelay: 5000,
            heartbeatIncoming: 4000,
            heartbeatOutgoing: 4000,
        });

        // Connection status will be handled by STOMP client events

        stompClient.onConnect = () => {
            console.log('STOMP: Connected');
            setConnected(true);

            // Function to handle notifications
            const handleNotificationMessage = (message) => {
                try {
                    let notification;
                    try {
                        notification = JSON.parse(message.body);
                    } catch (e) {
                        console.error('Error parsing notification body:', e);
                        console.log('Raw message body:', message.body);
                        // Try to recover from JSON parsing error
                        if (typeof message.body === 'string') {
                            // Remove any non-JSON content and try again
                            const jsonStart = message.body.indexOf('{');
                            const jsonEnd = message.body.lastIndexOf('}');
                            if (jsonStart >= 0 && jsonEnd >= 0) {
                                try {
                                    notification = JSON.parse(message.body.substring(jsonStart, jsonEnd + 1));
                                } catch (e2) {
                                    console.error('Second attempt to parse notification failed:', e2);
                                    return;
                                }
                            } else {
                                return;
                            }
                        } else {
                            return;
                        }
                    }
                    
                    console.log('Received notification:', notification);
                    
                    // Add timestamp if missing
                    if (!notification.createdAt && !notification.timestamp) {
                        notification.createdAt = new Date().toISOString();
                    }
                    
                    // Store notification in state
                    addNotification(notification);

                    // Handle specific notification types
                    switch (notification.type) {
                        case 'RIDE_MATCH_REQUEST':
                            handleRideMatchRequest(notification);
                            break;
                        default:
                            console.log('Basic toast shown for notification type:', notification.type);
                            showToast({
                                type: 'notification',
                                title: getNotificationTitle(notification),
                                message: getNotificationMessage(notification),
                                time: new Date().toLocaleTimeString('pt-BR', {
                                    hour: '2-digit',
                                    minute: '2-digit'
                                }),
                                duration: 5000,
                                onPress: () => handleNotificationPress(notification),
                            });
                    }
                } catch (error) {
                    console.error('Error processing notification:', error);
                }
            };

            // Subscribe to user-specific notifications if user is logged in
            if (user?.id) {
                console.log('Subscribing to user-specific notifications for user ID:', user.id);
                stompClient.subscribe(`/topic/user/${user.id}/notifications`, handleNotificationMessage);
            }

            // Subscribe to global notifications
            stompClient.subscribe('/topic/notificacoes', handleNotificationMessage);
        };

        stompClient.onStompError = (frame) => {
            console.error('STOMP: Protocol error', frame);
        };

        stompClient.onWebSocketError = (error) => {
            console.error('WebSocket Error:', error);
            setConnected(false);
        };

        stompClient.onDisconnect = () => {
            console.log('STOMP: Disconnected');
            setConnected(false);
        };

        stompClient.activate();
        setSocket(stompClient);

        return () => {
            if (stompClient.active) {
                stompClient.deactivate();
            }
        };
    }, [user?.id]); // Re-run effect when user ID changes

    const handleRideMatchRequest = (notification) => {
        console.debug('Ride match request notification:', notification);
        
        // Try to parse payload if it's a string, but default to empty object if payload doesn't exist
        let payloadData = {};
        if (notification.payload) {
            if (typeof notification.payload === 'string') {
                try {
                    payloadData = JSON.parse(notification.payload);
                } catch (e) {
                    console.log('Failed to parse notification payload:', e);
                    payloadData = {};
                }
            } else if (typeof notification.payload === 'object') {
                payloadData = notification.payload;
            }
        }
        
        const formattedTime = new Date().toLocaleTimeString('pt-BR', {
            hour: '2-digit',
            minute: '2-digit'
        });
        
        // Get passenger name from various possible locations
        const passengerName = notification.recipient?.nome || 
                              notification.passageiro?.nome ||
                              payloadData?.estudante?.nome || 
                              payloadData?.passageiro?.nome ||
                              'Novo passageiro';

        const rideDetails = {
            origem: notification.origem || payloadData?.origem || payloadData?.from || 'Origem não especificada',
            destino: notification.destino || payloadData?.destino || payloadData?.to || 'Destino não especificado',
        };

        console.log('About to show notification with:', {
            title: 'Nova Solicitação de Carona',
            message: `${passengerName} quer uma carona`,
            subtitle: `${rideDetails.origem} → ${rideDetails.destino}`,
            passengerName,
            rideDetails
        });

        showNotification(
            'Nova Solicitação de Carona',
            `${passengerName} quer uma carona`,
            `${rideDetails.origem} → ${rideDetails.destino}`,
            () => handleNotificationPress(notification)
        );
    };

    const getNotificationTitle = (notification) => {
        switch (notification.type) {
            case 'RIDE_MATCH_REQUEST':
                return 'Nova Solicitação de Carona';
            case 'RIDE_REQUEST_ACCEPTED':
                return 'Solicitação Aceita';
            case 'RIDE_REQUEST_REJECTED':
                return 'Solicitação Recusada';
            case 'RIDE_CANCELLED':
                return 'Carona Cancelada';
            case 'RIDE_STARTED':
                return 'Carona Iniciada';
            case 'PASSENGER_REMOVED':
                return 'Removido da Carona';
            case 'RIDE_REMINDER':
                return 'Lembrete de Carona';
            case 'SYSTEM':
                return 'Notificação do Sistema';
            default:
                return notification.title || 'Nova Notificação';
        }
    };

    const getNotificationMessage = (notification) => {
        // Try to parse payload if it's a string
        let payloadData = notification.payload;
        if (typeof notification.payload === 'string') {
            try {
                payloadData = JSON.parse(notification.payload);
            } catch (e) {
                console.log('Failed to parse notification payload in getNotificationMessage:', e);
                payloadData = {};
            }
        }

        const passengerName = notification.recipient?.nome || 
                             payloadData?.estudante?.nome || 
                             payloadData?.passageiro?.nome || 
                             'Usuário';

        switch (notification.type) {
            case 'RIDE_MATCH_REQUEST':
                return `${passengerName} solicitou uma carona`;
            case 'RIDE_REQUEST_ACCEPTED':
                return `Sua solicitação de carona foi aceita`;
            case 'RIDE_REQUEST_REJECTED':
                return `Sua solicitação de carona foi recusada`;
            case 'RIDE_CANCELLED':
                return `Uma carona foi cancelada`;
            case 'RIDE_STARTED':
                return `Sua carona foi iniciada pelo motorista`;
            case 'RIDE_REMINDER':
                return `Lembrete: Você tem uma carona agendada`;
            case 'SYSTEM':
                return payloadData?.message || notification.message || 'Mensagem do sistema';
            default:
                return notification.message || 'Você recebeu uma nova notificação';
        }
    };

    const handleNotificationPress = (notification) => {
        console.log('Notification pressed:', notification);
        
        if (!navigationRef) {
            console.warn('Navigation ref not available for notification press');
            return;
        }

        switch (notification.type) {
            case 'RIDE_MATCH_REQUEST':
                handleRideMatchRequestPress(notification);
                break;
            case 'RIDE_REQUEST_ACCEPTED':
            case 'RIDE_REQUEST_REJECTED':
            case 'RIDE_CANCELLED':
            case 'RIDE_STARTED':
            case 'RIDE_REMINDER':
                // Navigate to the Rides tab to show user's rides
                navigationRef.current?.navigate('TabNavigator', {
                    screen: 'Rides'
                });
                break;
            default:
                // For other notifications, navigate to notifications screen
                navigationRef.current?.navigate('TabNavigator', {
                    screen: 'Notifications'
                });
                break;
        }
    };

    const handleRideMatchRequestPress = async (notification) => {
        console.log('Ride match request pressed:', notification);
        
        try {
            // First try to get caronaId directly from the notification object
            let caronaId = notification.caronaId;
            
            // If not found, try to parse payload
            if (!caronaId && notification.payload) {
                let payloadData = {};
                if (typeof notification.payload === 'string') {
                    try {
                        payloadData = JSON.parse(notification.payload);
                    } catch (e) {
                        console.error('Failed to parse notification payload:', e);
                        Alert.alert('Erro', 'Não foi possível processar os dados da notificação.');
                        return;
                    }
                } else if (typeof notification.payload === 'object') {
                    payloadData = notification.payload;
                }
                caronaId = payloadData.caronaId;
            }
            
            if (!caronaId) {
                console.error('No caronaId found in notification:', notification);
                Alert.alert('Erro', 'Informações da carona não encontradas na notificação.');
                return;
            }
            
            console.log('Found caronaId:', caronaId);
            
            // Fetch ride details using the caronaId
            const response = await apiClient.get(`/carona/${caronaId}`, {
                headers: { 'Authorization': `Bearer ${authToken}` }
            });
            
            if (response.success && response.data) {
                console.log('Successfully fetched ride details:', response.data);
                
                // Debug navigation reference
                console.log('Navigation ref exists:', !!navigationRef);
                console.log('Navigation ref current exists:', !!navigationRef?.current);
                console.log('Navigation ref current navigate function exists:', !!navigationRef?.current?.navigate);
                
                // Try using the global navigation state
                if (navigationRef?.current?.isReady && navigationRef.current.isReady()) {
                    console.log('Navigation is ready, attempting to navigate');
                    try {
                        navigationRef.current.navigate('ManageRequests', { 
                            ride: response.data 
                        });
                        console.log('Navigation command executed successfully');
                    } catch (navError) {
                        console.error('Navigation error:', navError);
                        Alert.alert('Erro', 'Erro de navegação. Tente abrir a tela manualmente.');
                    }
                } else if (navigationRef?.current?.navigate) {
                    console.log('Navigation exists but may not be ready, attempting anyway');
                    try {
                        // Use setTimeout to delay navigation slightly
                        setTimeout(() => {
                            navigationRef.current.navigate('ManageRequests', { 
                                ride: response.data 
                            });
                            console.log('Delayed navigation command executed successfully');
                        }, 100);
                    } catch (navError) {
                        console.error('Delayed navigation error:', navError);
                        Alert.alert('Erro', 'Erro de navegação. Tente abrir a tela manualmente.');
                    }
                } else {
                    console.warn('Navigation not available - showing alert instead');
                    Alert.alert(
                        'Nova Solicitação de Carona', 
                        'Você tem uma nova solicitação de carona. Por favor, abra o app para visualizar os detalhes.',
                        [{ text: 'OK' }]
                    );
                }
            } else {
                console.error('Failed to fetch ride details:', response.error);
                Alert.alert('Erro', 'Não foi possível carregar os detalhes da carona.');
            }
        } catch (error) {
            console.error('Error handling ride match request press:', error);
            Alert.alert('Erro', 'Ocorreu um erro ao abrir os detalhes da carona.');
        }
    }

  const addNotification = (notification) => {
    setNotifications(prev => [notification, ...prev]);
    // Increment unread count when new notification arrives
    if (notification.status !== 'RECONHECIDO') {
      setUnreadCount(prev => prev + 1);
    }
  };

  const clearNotifications = () => {
    setNotifications([]);
  };

  const setAllNotifications = useCallback((notificationsList) => {
    setNotifications(notificationsList);
  }, []);

  const appendNotifications = useCallback((newNotifications) => {
    setNotifications(prev => {
      // Filter out duplicates based on id
      const existingIds = new Set(prev.map(n => n.id));
      const filteredNew = newNotifications.filter(n => !existingIds.has(n.id));
      return [...prev, ...filteredNew];
    });
  }, []);

  const fetchUnreadCount = useCallback(async () => {
    if (!user?.id || !authToken) return;

    try {
      const response = await apiClient.get(`/notificacoes/unread-count`, {
        params: {
          userId: user.id
        },
        headers: {
          'Authorization': `Bearer ${authToken}`
        }
      });

      if (response && response.data !== undefined) {
        setUnreadCount(response.data);
      }
    } catch (error) {
      console.error('Error fetching unread count:', error);
    }
  }, [user?.id, authToken]);

  const markAsRead = useCallback(async (notificationId) => {
    if (!authToken || !user?.id) return;

    try {
      await apiClient.put(`/notificacoes/${notificationId}/read`, null, {
        params: {
          userId: user.id
        },
        headers: {
          'Authorization': `Bearer ${authToken}`
        }
      });
      
      // Update local unread count
      setUnreadCount(prev => Math.max(0, prev - 1));
      
      // Update notification in the list
      setNotifications(prev => 
        prev.map(notif => 
          notif.id === notificationId 
            ? { ...notif, status: 'RECONHECIDO' }
            : notif
        )
      );
      
      return true;
    } catch (error) {
      console.error('Error marking notification as read:', error);
      return false;
    }
  }, [authToken, user?.id]);

  // Fetch unread count on mount and when user changes
  useEffect(() => {
    if (user?.id) {
      fetchUnreadCount();
    }
  }, [user?.id, fetchUnreadCount]);

  const value = {
    connected,
    socket,
    notifications,
    addNotification,
    clearNotifications,
    unreadCount,
    fetchUnreadCount,
    markAsRead,
    setAllNotifications,
    appendNotifications,
    setNavigationRef
  };

    return (
        <NotificationContext.Provider value={value}>
            {children}
        </NotificationContext.Provider>
    );
};
