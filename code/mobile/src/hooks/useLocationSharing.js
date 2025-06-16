import { useState, useEffect, useCallback } from 'react';
import { Alert } from 'react-native';
import LocationSharingService from '../services/websocket/LocationSharingService';
import { useAuthContext } from '../contexts/AuthContext';

/**
 * Hook for managing real-time location sharing during ongoing rides
 */
export const useLocationSharing = () => {
  const [isConnected, setIsConnected] = useState(false);
  const [isLocationSharingActive, setIsLocationSharingActive] = useState(false);
  const [currentDriverLocation, setCurrentDriverLocation] = useState(null);
  const [connectionError, setConnectionError] = useState(null);
  const { authToken } = useAuthContext();

  // Initialize connection when component mounts
  useEffect(() => {
    let mounted = true;

    const initializeService = async () => {
      if (!authToken) return;

      try {
        await LocationSharingService.initialize(
          authToken,
          // onLocationReceived callback
          (locationData) => {
            if (mounted) {
              setCurrentDriverLocation(locationData);
            }
          },
          // onConnectionStatusChange callback
          (connected) => {
            if (mounted) {
              setIsConnected(connected);
              if (!connected) {
                setConnectionError('Connection lost');
              } else {
                setConnectionError(null);
              }
            }
          }
        );
      } catch (error) {
        console.error('Error initializing location sharing:', error);
        if (mounted) {
          setConnectionError(error.message);
        }
      }
    };

    initializeService();

    // Cleanup on unmount
    return () => {
      mounted = false;
      LocationSharingService.disconnect();
    };
  }, [authToken]);

  /**
   * Start location sharing as a driver
   * @param {number} rideId - The ID of the ongoing ride
   */
  const startDriverLocationSharing = useCallback(async (rideId) => {
    try {
      setConnectionError(null);
      await LocationSharingService.startDriverLocationSharing(rideId);
      setIsLocationSharingActive(true);
      console.log('Driver location sharing started for ride:', rideId);
    } catch (error) {
      console.error('Error starting driver location sharing:', error);
      setConnectionError(error.message);
      
      // Show user-friendly error message
      if (error.message.includes('permission')) {
        Alert.alert(
          'Permissão de Localização',
          'Para compartilhar sua localização durante a carona, é necessário permitir o acesso à localização.',
          [
            { text: 'OK' }
          ]
        );
      } else {
        Alert.alert(
          'Erro',
          'Não foi possível iniciar o compartilhamento de localização. Tente novamente.',
          [
            { text: 'OK' }
          ]
        );
      }
    }
  }, []);

  /**
   * Start receiving location updates as a passenger
   * @param {number} rideId - The ID of the ongoing ride
   */
  const startPassengerLocationReceiving = useCallback((rideId) => {
    try {
      setConnectionError(null);
      LocationSharingService.startPassengerLocationReceiving(rideId);
      setIsLocationSharingActive(true);
      console.log('Passenger location receiving started for ride:', rideId);
    } catch (error) {
      console.error('Error starting passenger location receiving:', error);
      setConnectionError(error.message);
    }
  }, []);

  /**
   * Stop location sharing
   */
  const stopLocationSharing = useCallback(() => {
    LocationSharingService.stopLocationSharing();
    setIsLocationSharingActive(false);
    setCurrentDriverLocation(null);
    setConnectionError(null);
    console.log('Location sharing stopped');
  }, []);

  /**
   * Manually update connection status
   */
  const checkConnectionStatus = useCallback(() => {
    const connected = LocationSharingService.isConnected();
    setIsConnected(connected);
    
    if (!connected) {
      setConnectionError('Not connected to location sharing service');
    }
    
    return connected;
  }, []);

  return {
    // State
    isConnected,
    isLocationSharingActive,
    currentDriverLocation,
    connectionError,
    
    // Actions
    startDriverLocationSharing,
    startPassengerLocationReceiving,
    stopLocationSharing,
    checkConnectionStatus,
    
    // Service info
    currentRideId: LocationSharingService.getCurrentRideId(),
    isDriver: LocationSharingService.getIsDriver(),
  };
};
