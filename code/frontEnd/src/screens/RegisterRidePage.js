import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  Alert,
  Animated,
  Keyboard,
  Platform,
  SafeAreaView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';
import MapView, { Marker, Polyline, PROVIDER_GOOGLE } from 'react-native-maps';
import Reanimated, { useSharedValue, useAnimatedStyle, withTiming } from 'react-native-reanimated';
import { apiClient } from '../services/api/apiClient';
import RideFormBottomSheet from '../components/ride/RideFormBottomSheet';
import { useAuthContext } from '../contexts/AuthContext';

const RegisterRidePage = () => {
  const navigation = useNavigation();
  const { authToken, user } = useAuthContext();
  const mapRef = useRef(null);
  const bottomSheetRef = useRef(null);

  // Form state
  const [departure, setDeparture] = useState('');
  const [arrival, setArrival] = useState('');
  const [departureLocation, setDepartureLocation] = useState(null);
  const [arrivalLocation, setArrivalLocation] = useState(null);
  const [departureDate, setDepartureDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [seats, setSeats] = useState('3');
  const [observations, setObservations] = useState('');
  const [loading, setLoading] = useState(false);
  const [routes, setRoutes] = useState([]);
  const [selectedRoute, setSelectedRoute] = useState(null);
  const [duration, setDuration] = useState(0);
  const [mapHeight, setMapHeight] = useState('100%');
  const [activeAutocomplete, setActiveAutocomplete] = useState(null);
  
  // Track the bottom sheet position/index
  const [bottomSheetIndex, setBottomSheetIndex] = useState(0);
  
  // Animated value for button opacity - changed from useRef(new Animated.Value(1)) to useSharedValue(1)
  const centerButtonOpacity = useSharedValue(1);

  // Define the animated style using Reanimated
  const animatedStyle = useAnimatedStyle(() => {
    return {
      opacity: centerButtonOpacity.value
    };
  });

  // State for route info display
  const [showRouteInfo, setShowRouteInfo] = useState(false);

  // Add keyboard listeners to adjust map height
  useEffect(() => {
    const keyboardWillShowListener = Platform.OS === 'ios' 
      ? Keyboard.addListener('keyboardWillShow', () => setMapHeight('50%'))
      : Keyboard.addListener('keyboardDidShow', () => setMapHeight('50%'));
      
    const keyboardWillHideListener = Platform.OS === 'ios'
      ? Keyboard.addListener('keyboardWillHide', () => setMapHeight('100%'))
      : Keyboard.addListener('keyboardDidHide', () => setMapHeight('100%'));

    // Cleanup
    return () => {
      keyboardWillShowListener.remove();
      keyboardWillHideListener.remove();
    };
  }, []);

  // Control center button visibility based on bottom sheet position
  useEffect(() => {
    // Show button only when bottom sheet is at the first (smallest) position
    if (bottomSheetIndex === 0) {
      centerButtonOpacity.value = withTiming(1, { duration: 100 });
    } else {
      centerButtonOpacity.value = withTiming(0, { duration: 100 });
    }
  }, [bottomSheetIndex, centerButtonOpacity]);

  // Watch for changes to both locations and center the map accordingly
  useEffect(() => {
    if (departureLocation && arrivalLocation) {
      // If we have both locations, fit to show both
      centerMapOnLocations();
    }
  }, [departureLocation, arrivalLocation]);

  // Handle touch on map to dismiss autocomplete panels
  const handleMapPress = useCallback(() => {
    // Close any open autocomplete panels by setting the active one to null
    if (activeAutocomplete) {
      setActiveAutocomplete(null);
      // Close keyboard
      Keyboard.dismiss();
    }
  }, [activeAutocomplete]);

  // Handle bottom sheet index change
  const handleSheetChanges = useCallback((index) => {
    setBottomSheetIndex(index);
  }, []);

  // Function to center the map on both locations
  const centerMapOnLocations = () => {
    if (!mapRef.current) return;
    
    if (selectedRoute && selectedRoute.pontos && selectedRoute.pontos.length > 0) {
      // If we have a route, fit to the entire route
      fitMapToCoordinates(selectedRoute.pontos);
    } else if (departureLocation && arrivalLocation) {
      // If we have both locations but no route yet
      mapRef.current.fitToCoordinates(
        [departureLocation, arrivalLocation],
        {
          edgePadding: { top: 50, right: 50, bottom: 250, left: 50 },
          animated: true
        }
      );
    } else if (departureLocation) {
      // If we only have departure location
      mapRef.current.animateToRegion({
        latitude: departureLocation.latitude,
        longitude: departureLocation.longitude,
        latitudeDelta: 0.01,
        longitudeDelta: 0.01,
      }, 500);
    } else if (arrivalLocation) {
      // If we only have arrival location
      mapRef.current.animateToRegion({
        latitude: arrivalLocation.latitude,
        longitude: arrivalLocation.longitude,
        latitudeDelta: 0.01,
        longitudeDelta: 0.01,
      }, 500);
    }
  };

  // Handle selecting departure address from autocomplete
  const handleSelectDepartureAddress = (address) => {
    setDeparture(address.endereco);
    setDepartureLocation({
      latitude: address.latitude,
      longitude: address.longitude
    });
    
    // Dismiss keyboard to hide suggestions and reset active autocomplete
    Keyboard.dismiss();
    setActiveAutocomplete(null);
    
    // Show the selected location on map immediately
    if (mapRef.current && !arrivalLocation) {
      mapRef.current.animateToRegion({
        latitude: address.latitude,
        longitude: address.longitude,
        latitudeDelta: 0.01,
        longitudeDelta: 0.01,
      }, 500);
    }

    console.debug('Departure address selected:', address);
    
    // If we already have arrival location, update routes
    if (arrivalLocation) {
      updateRoutes(
        { latitude: address.latitude, longitude: address.longitude },
        arrivalLocation
      );
    }
  };

  // Handle selecting arrival address from autocomplete
  const handleSelectArrivalAddress = (address) => {
    setArrival(address.endereco);
    setArrivalLocation({
      latitude: address.latitude,
      longitude: address.longitude
    });
    
    // Dismiss keyboard to hide suggestions and reset active autocomplete
    Keyboard.dismiss();
    setActiveAutocomplete(null);
    
    // Show the selected location on map immediately
    if (mapRef.current && !departureLocation) {
      mapRef.current.animateToRegion({
        latitude: address.latitude,
        longitude: address.longitude,
        latitudeDelta: 0.01,
        longitudeDelta: 0.01,
      }, 500);
    }

    console.debug('Arrival address selected:', address);
    
    // If we already have departure location, update routes
    if (departureLocation) {
      updateRoutes(
        departureLocation,
        { latitude: address.latitude, longitude: address.longitude }
      );
    }
  };

  // Update routes when both locations are set
  const updateRoutes = async (start, end) => {
    if (!start || !end) return;
    
    try {
      setLoading(true);
      const options = {
        headers: {
          Authorization: `Bearer ${authToken}`,
          'Content-Type': 'application/json'
        }
      };

      const response = await apiClient.get(
        `/maps/trajectories?startLat=${start.latitude}&startLon=${start.longitude}&endLat=${end.latitude}&endLon=${end.longitude}`,
        options
      );

      if (response.data && response.data.length > 0) {
        // Transform backend data format to frontend expected format
        const processedRoutes = response.data.map((route, index) => {
          // Convert coordinates from [[lat, lon], [lat, lon], ...] to [{latitude, longitude}, ...]
          const pontos = route.coordenadas.map(coord => ({
            latitude: coord[0],
            longitude: coord[1]
          }));

          // Set descriptions based on index
          let description = index === 0 ? 'Principal' : `Alternativa ${index}`;
          
          return {
            ...route,
            pontos,
            // Ensure distance and duration fields are correctly mapped
            distanciaMetros: route.distanciaKm ? route.distanciaKm * 1000 : 0,
            duracaoSegundos: route.tempoSegundos || 0,
            descricao: description
          };
        });
        
        // Limit to max 2 routes (primary and one alternative)
        const limitedRoutes = processedRoutes.slice(0, 2);
        
        setRoutes(limitedRoutes);
        setSelectedRoute(limitedRoutes[0]);
        setDuration(limitedRoutes[0].duracaoSegundos || 0);
        setShowRouteInfo(true);
        
        // Fit map to show all routes
        const allCoordinates = limitedRoutes.flatMap(route => route.pontos);
        fitMapToCoordinates(allCoordinates);
      }
    } catch (error) {
      console.error('Error fetching routes:', error);
      Alert.alert('Erro', 'Não foi possível calcular a rota. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  // Fit map to show the entire route
  const fitMapToCoordinates = (coordinates) => {
    if (!coordinates || coordinates.length === 0 || !mapRef.current) return;
    
    mapRef.current.fitToCoordinates(coordinates, {
      edgePadding: { top: 50, right: 50, bottom: 250, left: 50 },
      animated: true
    });
  };

  // Format duration from seconds to human-readable format
  const formatDuration = (seconds) => {
    if (!seconds) return '0 min';
    
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    
    if (hours > 0) {
      return `${hours}h ${minutes}min`;
    } else {
      return `${minutes} min`;
    }
  };
  
  // Format distance in km
  const formatDistance = (meters) => {
    if (!meters) return '0 km';
    const km = meters / 1000;
    return `${km.toFixed(1)} km`;
  };

  // Handle selecting a different route
  const handleSelectRoute = (route) => {
    setSelectedRoute(route);
    setDuration(route.duracaoSegundos || 0);
    fitMapToCoordinates(route.pontos);
  };

  // Handle date changes
  const handleDateChange = (field, date) => {
    if (field === 'departure') {
      setDepartureDate(date);
    }
  };

  // Handle input focus to track active autocomplete
  const handleInputFocus = (inputId) => {
    setActiveAutocomplete(inputId);
  };

  // Submit the ride creation
  const handleSubmitRide = async () => {
    if (!selectedRoute || !departureLocation || !arrivalLocation) {
      Alert.alert('Erro', 'Selecione os pontos de partida e chegada para continuar.');
      return;
    }

    try {
      setLoading(true);
      
      const arrivalDate = new Date(departureDate.getTime() + (duration * 1000));
      
      const rideData = {
        motorista: {
          id: user.id
        },
        partida: {
          latitude: departureLocation.latitude,
          longitude: departureLocation.longitude,
          endereco: departure
        },
        destino: {
          latitude: arrivalLocation.latitude,
          longitude: arrivalLocation.longitude,
          endereco: arrival
        },
        horaPartida: departureDate.toISOString(),
        horaChegada: arrivalDate.toISOString(),
        vagas: parseInt(seats, 10),
        observacoes: observations,
        rota: {
          pontos: selectedRoute.pontos,
          distanciaMetros: selectedRoute.distanciaMetros,
          duracaoSegundos: selectedRoute.duracaoSegundos
        }
      };
      
      const response = await apiClient.post(rideData, '/caronas');
      
      Alert.alert(
        'Sucesso',
        'Sua carona foi registrada com sucesso!',
        [{ text: 'OK', onPress: () => navigation.navigate('Home') }]
      );
      
    } catch (error) {
      console.error('Error creating ride:', error);
      Alert.alert('Erro', 'Não foi possível registrar a carona. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />
      
      <MapView
        ref={mapRef}
        style={[styles.map, { height: mapHeight }]}
        provider={PROVIDER_GOOGLE}
        initialRegion={{
          latitude: -19.9322352, // Default to Belo Horizonte
          longitude: -43.9376369,
          latitudeDelta: 0.0922,
          longitudeDelta: 0.0421,
        }}
        onPress={handleMapPress}
      >
        {departureLocation && (
          <Marker
            coordinate={departureLocation}
            title="Partida"
            pinColor="#4285F4"
          />
        )}
        
        {arrivalLocation && (
          <Marker
            coordinate={arrivalLocation}
            title="Chegada"
            pinColor="#34A853"
          />
        )}
        
        {/* Render all routes (up to 2) with the selected one having a thicker line */}
        {routes.map((route, index) => (
          <Polyline
            key={index}
            coordinates={route.pontos}
            strokeWidth={route === selectedRoute ? 5 : 3}
            strokeColor={route === selectedRoute ? '#4285F4' : '#7FB3F5'} 
            onPress={() => handleSelectRoute(route)}
          />
        ))}
      </MapView>
      
      {/* Route info panel */}
      {showRouteInfo && selectedRoute && (
        <View style={styles.routeInfoContainer}>
          <View style={styles.routeInfoHeader}>
            <Text style={styles.routeInfoTitle}>{selectedRoute.descricao || 'Rota Principal'}</Text>
            <TouchableOpacity 
              style={styles.routeInfoSwitch}
              onPress={() => {
                const nextRouteIndex = routes.findIndex(r => r === selectedRoute) === 0 ? 1 : 0;
                if (routes[nextRouteIndex]) {
                  handleSelectRoute(routes[nextRouteIndex]);
                }
              }}
              disabled={routes.length <= 1}
            >
              <Ionicons name="swap-horizontal" size={20} color={routes.length > 1 ? "#4285F4" : "#B0BEC5"} />
              <Text style={[styles.routeInfoSwitchText, {color: routes.length > 1 ? "#4285F4" : "#B0BEC5"}]}>
                {routes.length > 1 ? "Alternar rota" : "Rota única"}
              </Text>
            </TouchableOpacity>
          </View>
          <View style={styles.routeInfoDetails}>
            <View style={styles.routeInfoDetail}>
              <Ionicons name="time-outline" size={16} color="#555" />
              <Text style={styles.routeInfoText}>
                {formatDuration(selectedRoute.duracaoSegundos)}
              </Text>
            </View>
            <View style={styles.routeInfoDetail}>
              <Ionicons name="navigate-outline" size={16} color="#555" />
              <Text style={styles.routeInfoText}>
                {formatDistance(selectedRoute.distanciaMetros)}
              </Text>
            </View>
          </View>
        </View>
      )}
      
      <TouchableOpacity
        style={styles.backButton}
        onPress={() => navigation.goBack()}
      >
        <Ionicons name="arrow-back" size={24} color="#333" />
      </TouchableOpacity>
      
      <RideFormBottomSheet
        ref={bottomSheetRef}
        departure={departure}
        arrival={arrival}
        onDepartureChange={setDeparture}
        onArrivalChange={setArrival}
        departureDate={departureDate}
        onDateChange={handleDateChange}
        showDatePicker={showDatePicker}
        setShowDatePicker={setShowDatePicker}
        seats={seats}
        onSeatsChange={setSeats}
        observations={observations}
        onObservationsChange={setObservations}
        onSubmit={handleSubmitRide}
        loading={loading}
        duration={duration}
        hasValidRoute={!!selectedRoute}
        onSelectDepartureAddress={handleSelectDepartureAddress}
        onSelectArrivalAddress={handleSelectArrivalAddress}
        activeInput={activeAutocomplete}
        onInputFocus={handleInputFocus}
        onSheetChange={handleSheetChanges}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  map: {
    ...StyleSheet.absoluteFillObject,
    height: '100%',
  },
  backButton: {
    position: 'absolute',
    top: 10,
    left: 10,
    backgroundColor: 'white',
    padding: 8,
    borderRadius: 20,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 3,
    zIndex: 5,
  },
  centerButtonContainer: {
    position: 'absolute',
    bottom: '42%',
    right: 16,
    zIndex: 5,
  },
  centerButton: {
    backgroundColor: 'white',
    padding: 10,
    borderRadius: 30,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 3,
  },
  routeInfoContainer: {
    position: 'absolute',
    top: 10,
    right: 10,
    left: 60,
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 12,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 3,
    zIndex: 5,
  },
  routeInfoHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  routeInfoTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  routeInfoSwitch: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  routeInfoSwitchText: {
    fontSize: 12,
    marginLeft: 4,
    fontWeight: '500',
  },
  routeInfoDetails: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  routeInfoDetail: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 16,
  },
  routeInfoText: {
    fontSize: 14,
    color: '#555',
    marginLeft: 4,
  },
});

export default RegisterRidePage;
