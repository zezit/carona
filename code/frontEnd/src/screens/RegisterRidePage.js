import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute } from '@react-navigation/native';
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
import Reanimated, { useSharedValue, useAnimatedStyle, withTiming, interpolate } from 'react-native-reanimated';
import { apiClient } from '../services/api/apiClient';
import RideFormBottomSheet from '../components/ride/RideFormBottomSheet';
import { useAuthContext } from '../contexts/AuthContext';
import { COLORS, SPACING, RADIUS } from '../constants';
import { commonStyles } from '../theme/styles/commonStyles';

const RegisterRidePage = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { authToken, user } = useAuthContext();
  const mapRef = useRef(null);
  const bottomSheetRef = useRef(null);

  // Get location data from route params
  const { 
    departureLocation: initialDepartureLocation, 
    departure: initialDeparture,
    arrivalLocation: initialArrivalLocation,
    arrival: initialArrival 
  } = route.params || {};

  // Form state - initialize with data from LocationSelectionPage
  const [departure, setDeparture] = useState(initialDeparture || '');
  const [arrival, setArrival] = useState(initialArrival || '');
  const [departureLocation, setDepartureLocation] = useState(initialDepartureLocation || null);
  const [arrivalLocation, setArrivalLocation] = useState(initialArrivalLocation || null);
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
  
  // Animated value for button opacity
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

  // When component mounts, fetch route if both locations are provided
  useEffect(() => {
    if (initialDepartureLocation && initialArrivalLocation) {
      updateRoutes(initialDepartureLocation, initialArrivalLocation);
    }
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

  // Handle change locations button press
  const handleChangeLocations = () => {
    navigation.navigate('LocationSelection', {
      departure,
      departureLocation,
      arrival,
      arrivalLocation,
    });
  };

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

  // Handle date changes based on the active time mode
  const handleDateChange = (mode, date) => {
    if (mode === 'departure') {
      setDepartureDate(date);
      // If we have a route with duration, calculate arrival time automatically
      if (duration > 0) {
        // No need to set arrival date explicitly as it's calculated when needed
      }
    } else if (mode === 'arrival') {
      // If we have a route with duration, calculate departure time from arrival
      if (duration > 0) {
        const calculatedDepartureDate = new Date(date.getTime() - (duration * 1000));
        setDepartureDate(calculatedDepartureDate);
      } else {
        // No route yet, just set departure date same as arrival for now
        setDepartureDate(date);
      }
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
    <SafeAreaView style={commonStyles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="transparent" translucent />
      
      <View style={styles.mapContainer}>
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
              strokeColor={route === selectedRoute ? COLORS.primary : '#7FB3F5'} 
              onPress={() => handleSelectRoute(route)}
            />
          ))}
        </MapView>
        
        {/* Top bar with back button and title */}
        <View style={styles.topBar}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Ionicons name="arrow-back" size={24} color={COLORS.text.primary} />
          </TouchableOpacity>
          
          <Text style={styles.titleText}>Criar Carona</Text>
        </View>

        {/* Location edit button */}
        <TouchableOpacity
          style={styles.locationEditButton}
          onPress={handleChangeLocations}
        >
          <View style={styles.locationEditContent}>
            <View style={styles.locationIcons}>
              <View style={[styles.locationIcon, styles.departureIcon]}>
                <Ionicons name="location" size={14} color="#FFFFFF" />
              </View>
              <View style={styles.locationConnector} />
              <View style={[styles.locationIcon, styles.arrivalIcon]}>
                <Ionicons name="navigate" size={14} color="#FFFFFF" />
              </View>
            </View>
            <View style={styles.locationTexts}>
              <Text numberOfLines={1} style={styles.locationEditText}>
                {departure || 'Selecionar partida'}
              </Text>
              <Text numberOfLines={1} style={styles.locationEditText}>
                {arrival || 'Selecionar destino'}
              </Text>
            </View>
            <View style={styles.locationEditIcon}>
              <Ionicons name="pencil" size={18} color={COLORS.primary} />
            </View>
          </View>
        </TouchableOpacity>
        
        {/* Route info panel */}
        {showRouteInfo && selectedRoute && (
          <Animated.View style={[styles.routeInfoContainer, {
            transform: [
              {
                translateY: interpolate(bottomSheetIndex, [0, 1, 2], [0, -50, -100]),
              },
            ],
          }]}>
            <View style={styles.routeInfoContent}>
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
                  <Ionicons name="swap-horizontal" size={20} color={routes.length > 1 ? COLORS.primary : "#B0BEC5"} />
                  <Text style={[styles.routeInfoSwitchText, {color: routes.length > 1 ? COLORS.primary : "#B0BEC5"}]}>
                    {routes.length > 1 ? "Alternar rota" : "Rota única"}
                  </Text>
                </TouchableOpacity>
              </View>
              <View style={styles.routeInfoDetails}>
                <View style={styles.routeInfoDetail}>
                  <Ionicons name="time-outline" size={16} color={COLORS.text.secondary} />
                  <Text style={styles.routeInfoText}>
                    {formatDuration(selectedRoute.duracaoSegundos)}
                  </Text>
                </View>
                <View style={styles.routeInfoDetail}>
                  <Ionicons name="navigate-outline" size={16} color={COLORS.text.secondary} />
                  <Text style={styles.routeInfoText}>
                    {formatDistance(selectedRoute.distanciaMetros)}
                  </Text>
                </View>
              </View>
            </View>
          </Animated.View>
        )}
      </View>
      
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
        onChangeLocations={handleChangeLocations}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  mapContainer: {
    flex: 1,
    position: 'relative',
  },
  map: {
    ...StyleSheet.absoluteFillObject,
  },
  topBar: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 50 : 40,
    left: 16,
    right: 16,
    flexDirection: 'row',
    alignItems: 'center',
    zIndex: 10,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.card,
    justifyContent: 'center',
    alignItems: 'center',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.15,
        shadowRadius: 3,
      },
      android: {
        elevation: 3,
      },
    }),
  },
  titleText: {
    flex: 1,
    textAlign: 'center',
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.text.primary,
    marginRight: 40, // To balance with back button
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
  },
  locationEditButton: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 100 : 90,
    left: 16,
    right: 16,
    backgroundColor: COLORS.card,
    borderRadius: RADIUS.md,
    paddingVertical: 8,
    paddingHorizontal: 12,
    zIndex: 9,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.15,
        shadowRadius: 3,
      },
      android: {
        elevation: 3,
      },
    }),
  },
  locationEditContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  locationIcons: {
    width: 30,
    alignItems: 'center',
    marginRight: 8,
  },
  locationIcon: {
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  departureIcon: {
    backgroundColor: COLORS.primary,
  },
  arrivalIcon: {
    backgroundColor: COLORS.secondary,
  },
  locationConnector: {
    width: 2,
    height: 14,
    backgroundColor: COLORS.border,
    marginVertical: 2,
  },
  locationTexts: {
    height: '100%',
    flex: 1,
    justifyContent: 'space-between',
  },
  locationEditText: {
    fontSize: 14,
    color: COLORS.text.primary,
    marginVertical: 2,
    textAlign: 'left',
    paddingVertical: 2,
  },
  locationEditIcon: {
    padding: 5,
  },
  routeInfoContainer: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 230 : 220, // Increased from 170/160 to avoid overlap
    left: 16,
    right: 16,
    zIndex: 5, // Reduced z-index to be below the location edit button
  },
  routeInfoContent: {
    backgroundColor: COLORS.card,
    borderRadius: RADIUS.lg,
    padding: SPACING.md,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.15,
        shadowRadius: 3,
      },
      android: {
        elevation: 3,
      },
    }),
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
    color: COLORS.text.primary,
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
    color: COLORS.text.secondary,
    marginLeft: 4,
  },
  centerButtonContainer: {
    position: 'absolute',
    bottom: '45%',
    right: 16,
    zIndex: 7,
  },
  centerButton: {
    backgroundColor: COLORS.card,
    padding: 12,
    borderRadius: RADIUS.round,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 3,
  },
});

export default RegisterRidePage;
