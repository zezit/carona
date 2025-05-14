import { Client } from '@stomp/stompjs';
import SockJS from 'sockjs-client';
import { useEffect } from 'react';
import { Alert } from 'react-native';
import { API_BASE_URL } from '@env';

export default function NotificationSocket() {
  useEffect(() => {

    const socket = new SockJS(`${API_BASE_URL|| 'http://localhost:8080'}/ws-notificacoes`);
    const stompClient = new Client({
      webSocketFactory: () => socket,
      onConnect: () => {
        console.log("Conectado ao WebSocket");

        stompClient.subscribe('/topic/notificacoes', (message) => {
          const body = message.body;
          Alert.alert("Notificação", body);
        });
      },
      onDisconnect: () => {
        console.log("Desconectado do WebSocket");
      },
      debug: (str) => {
        console.log(str);
      }
    });

    stompClient.activate();

    return () => {
      stompClient.deactivate();
    };
  }, []);

  return null;
}
