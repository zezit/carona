import { Client } from '@stomp/stompjs';
import SockJS from 'sockjs-client';
import * as Location from 'expo-location';
import { WS_URL } from './config';

/**
 * Service for real-time location sharing during ongoing rides
 */
class LocationSharingService {
  constructor() {
    this.stompClient = null;
    this.connected = false;
    this.locationSubscription = null;
    this.currentRideId = null;
    this.isDriver = false;
    this.locationUpdateInterval = null;
    this.authToken = null;
    this.onLocationReceived = null;
    this.onConnectionStatusChange = null;
  }

  /**
   * Initialize connection for location sharing
   * @param {string} authToken - Authentication token (not used for now)
   * @param {function} onLocationReceived - Callback for receiving location updates
   * @param {function} onConnectionStatusChange - Callback for connection status changes
   */
  async initialize(authToken, onLocationReceived, onConnectionStatusChange) {
    this.authToken = authToken;
    this.onLocationReceived = onLocationReceived;
    this.onConnectionStatusChange = onConnectionStatusChange;

    try {
      console.log('LocationSharingService: Initializing connection to', WS_URL);

      const socket = new SockJS(`${WS_URL}/ws-location`);
      this.stompClient = new Client({
        webSocketFactory: () => socket,
        debug: (str) => {
          console.log('Location STOMP:', str);
        },
        reconnectDelay: 5000,
        heartbeatIncoming: 4000,
        heartbeatOutgoing: 4000,
        // Remove authentication headers for now
        connectHeaders: {}
      });

      this.stompClient.onConnect = () => {
        console.log('Location sharing WebSocket connected');
        this.connected = true;
        if (this.onConnectionStatusChange) {
          this.onConnectionStatusChange(true);
        }
      };

      this.stompClient.onWebSocketError = (error) => {
        console.error('Location sharing WebSocket error:', error);
        this.connected = false;
        if (this.onConnectionStatusChange) {
          this.onConnectionStatusChange(false);
        }
      };

      this.stompClient.onDisconnect = () => {
        console.log('Location sharing WebSocket disconnected');
        this.connected = false;
        if (this.onConnectionStatusChange) {
          this.onConnectionStatusChange(false);
        }
      };

      this.stompClient.activate();

    } catch (error) {
      console.error('Error initializing location sharing service:', error);
      throw error;
    }
  }

  /**
   * Start location sharing for a driver in an ongoing ride
   * @param {number} rideId - The ID of the ongoing ride
   */
  async startDriverLocationSharing(rideId) {
    if (!this.connected || !this.stompClient || !this.stompClient.connected) {
      throw new Error('WebSocket not connected or STOMP client not ready');
    }

    try {
      this.currentRideId = rideId;
      this.isDriver = true;

      // Request location permissions
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        throw new Error('Location permission denied');
      }

      console.log(`Starting location sharing for driver in ride ${rideId}`);

      // Start watching location with high accuracy
      this.locationSubscription = await Location.watchPositionAsync(
        {
          accuracy: Location.Accuracy.High,
          timeInterval: 5000, // Update every 5 seconds
          distanceInterval: 10, // Update when moved 10 meters
        },
        (location) => {
          this.sendLocationUpdate(location);
        }
      );

      console.log('Driver location tracking started');

    } catch (error) {
      console.error('Error starting driver location sharing:', error);
      throw error;
    }
  }

  /**
   * Start listening for location updates as a passenger
   * @param {number} rideId - The ID of the ongoing ride
   */
  startPassengerLocationReceiving(rideId) {
    if (!this.connected || !this.stompClient || !this.stompClient.connected) {
      throw new Error('WebSocket not connected or STOMP client not ready');
    }

    try {
      this.currentRideId = rideId;
      this.isDriver = false;

      console.log(`Starting to receive location updates for passenger in ride ${rideId}`);

      // Subscribe to location updates for this ride
      const locationTopic = `/topic/carona/${rideId}/location`;
      this.stompClient.subscribe(locationTopic, (message) => {
        try {
          const locationData = JSON.parse(message.body);
          console.log('Received driver location update:', locationData);
          
          if (this.onLocationReceived) {
            this.onLocationReceived(locationData);
          }
        } catch (error) {
          console.error('Error parsing location update:', error);
        }
      }, {
        id: `passenger-location-${rideId}`
        // Remove authorization headers for now
      });

      console.log(`Subscribed to location updates: ${locationTopic}`);

    } catch (error) {
      console.error('Error starting passenger location receiving:', error);
      throw error;
    }
  }

  /**
   * Send current location to other participants
   * @param {object} location - Location object from Expo Location
   */
  sendLocationUpdate(location) {
    if (!this.connected || !this.stompClient || !this.stompClient.connected || !this.currentRideId || !this.isDriver) {
      console.warn('Cannot send location update - connection not ready:', {
        connected: this.connected,
        hasStompClient: !!this.stompClient,
        stompConnected: this.stompClient?.connected,
        hasRideId: !!this.currentRideId,
        isDriver: this.isDriver
      });
      return;
    }

    try {
      const locationUpdate = {
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
        accuracy: location.coords.accuracy,
        speed: location.coords.speed,
        bearing: location.coords.heading,
        timestamp: new Date().toISOString()
      };

      const destination = `/app/carona/${this.currentRideId}/location`;
      this.stompClient.publish({
        destination: destination,
        body: JSON.stringify(locationUpdate)
      });

      console.log(`Location update sent for ride ${this.currentRideId}:`, locationUpdate);

    } catch (error) {
      console.error('Error sending location update:', error);
    }
  }

  /**
   * Stop location sharing
   */
  stopLocationSharing() {
    try {
      console.log('Stopping location sharing');

      // Stop location subscription
      if (this.locationSubscription) {
        this.locationSubscription.remove();
        this.locationSubscription = null;
      }

      // Clear interval if any
      if (this.locationUpdateInterval) {
        clearInterval(this.locationUpdateInterval);
        this.locationUpdateInterval = null;
      }

      // Reset state
      this.currentRideId = null;
      this.isDriver = false;

      console.log('Location sharing stopped');

    } catch (error) {
      console.error('Error stopping location sharing:', error);
    }
  }

  /**
   * Disconnect from WebSocket
   */
  disconnect() {
    try {
      this.stopLocationSharing();

      if (this.stompClient && this.stompClient.connected) {
        this.stompClient.deactivate();
      }

      this.connected = false;
      this.stompClient = null;

      console.log('Location sharing service disconnected');

    } catch (error) {
      console.error('Error disconnecting location sharing service:', error);
    }
  }

  /**
   * Get connection status
   * @returns {boolean} Connection status
   */
  isConnected() {
    return this.connected && this.stompClient && this.stompClient.connected;
  }

  /**
   * Get current ride ID
   * @returns {number|null} Current ride ID
   */
  getCurrentRideId() {
    return this.currentRideId;
  }

  /**
   * Check if user is driver
   * @returns {boolean} True if user is driver
   */
  getIsDriver() {
    return this.isDriver;
  }
}

// Export singleton instance
export default new LocationSharingService();
