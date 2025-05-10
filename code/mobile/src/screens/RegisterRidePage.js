import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  Alert,
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
import Reanimated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming
} from 'react-native-reanimated';
import RideFormBottomSheet from '../components/ride/RideFormBottomSheet';
import { LocationSelector } from '../components/ride';
import { COLORS, RADIUS } from '../constants';
import { useAuthContext } from '../contexts/AuthContext';
import { apiClient } from '../services/api/apiClient';
import { commonStyles } from '../theme/styles/commonStyles';
import { formatDateForApi } from '../utils/dateUtils';

// Bottom sheet heights for different positions (approximate)
const BOTTOM_SHEET_HEIGHTS = {
  COLLAPSED: 120,
  HALF: 300,
  EXPANDED: 500
};

const RegisterRidePage = ({ route }) => {
  const navigation = useNavigation();
  const { authToken, user } = useAuthContext();
  const mapRef = useRef(null);
  const bottomSheetRef = useRef(null);

  // Get location data from route params
  const {
    departureLocation: initialDepartureLocation,
    departure: initialDeparture,
    arrivalLocation: initialArrivalLocation,
    arrival: initialArrival,
    carAvailableSeats: initialCarAvailableSeats,
  } = route.params || {};

  console.debug('Initial params:', {
    initialDepartureLocation,
    initialDeparture,
    initialArrivalLocation,
    initialArrival,
    initialCarAvailableSeats
  });

  // Form state - initialize with data from LocationSelectionPage
  const [departure, setDeparture] = useState(initialDeparture || '');
  const [arrival, setArrival] = useState(initialArrival || '');
  const [departureLocation, setDepartureLocation] = useState(initialDepartureLocation || null);
  const [arrivalLocation, setArrivalLocation] = useState(initialArrivalLocation || null);
  const [departureDate, setDepartureDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [seats, setSeats] = useState(initialCarAvailableSeats?.toString() || '4');
  const [observations, setObservations] = useState('');
  const [loading, setLoading] = useState(false);
  const [routes, setRoutes] = useState([]);
  const [selectedRoute, setSelectedRoute] = useState(null);
  const [duration, setDuration] = useState(0);
  const [mapHeight, setMapHeight] = useState('100%');
  const [activeAutocomplete, setActiveAutocomplete] = useState(null);
  const [mapRegion, setMapRegion] = useState(null);

  // Track the bottom sheet position/index
  const [bottomSheetIndex, setBottomSheetIndex] = useState(0);

  // Calculated bottom sheet height based on index
  const bottomSheetHeight = useMemo(() => {
    switch (bottomSheetIndex) {
      case 0: return BOTTOM_SHEET_HEIGHTS.COLLAPSED;
      case 1: return BOTTOM_SHEET_HEIGHTS.HALF;
      case 2: return BOTTOM_SHEET_HEIGHTS.EXPANDED;
      default: return BOTTOM_SHEET_HEIGHTS.COLLAPSED;
    }
  }, [bottomSheetIndex]);

  // Animated value for button opacity
  const centerButtonOpacity = useSharedValue(1);

  // Add animated value for location button
  const locationButtonHeight = useSharedValue(80);
  const locationButtonOpacity = useSharedValue(1);

  // Define animated style for location button
  const locationButtonStyle = useAnimatedStyle(() => {
    return {
      height: locationButtonHeight.value,
      opacity: locationButtonOpacity.value,
    };
  });

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

  // Control button visibility based on bottom sheet position
  useEffect(() => {
    if (bottomSheetIndex === 0) {
      // When bottom sheet is collapsed, show both buttons normally
      centerButtonOpacity.value = withTiming(1, { duration: 150 });
      locationButtonHeight.value = withTiming(80, { duration: 200 });
      locationButtonOpacity.value = withTiming(1, { duration: 150 });
    } else if (bottomSheetIndex === 1) {
      // When bottom sheet is at half position, hide center button and make location button compact
      centerButtonOpacity.value = withTiming(0, { duration: 100 });
      locationButtonHeight.value = withTiming(60, { duration: 200 });
      locationButtonOpacity.value = withTiming(0.9, { duration: 150 });
    } else {
      // When bottom sheet is fully expanded, hide center button and minimize location button
      centerButtonOpacity.value = withTiming(0, { duration: 100 });
      locationButtonHeight.value = withTiming(40, { duration: 200 });
      locationButtonOpacity.value = withTiming(0.7, { duration: 150 });
    }
  }, [bottomSheetIndex, centerButtonOpacity, locationButtonHeight, locationButtonOpacity]);

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
      comingFromRegisterRide: true,  // Flag to indicate we're coming from RegisterRidePage
      comingFromFindRidesPage:false,
      carAvailableSeats: initialCarAvailableSeats // Pass car available seats to LocationSelectionPage
    });
  };

  // Handle map region change
  const handleRegionChange = (region) => {
    setMapRegion(region);
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
          edgePadding: {
            top: 70,
            right: 50,
            bottom: bottomSheetHeight + 50,
            left: 50
          },
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

  const handleSeatsChange = (value) => {
    const newValue = parseInt(value, 10);
    // Convert initialCarAvailableSeats to number and provide a fallback value of 4
    const maxSeats = initialCarAvailableSeats ? parseInt(initialCarAvailableSeats, 10) : 4;

    if (newValue > maxSeats) {
      Alert.alert(
        'Limite de Assentos',
        `Você não pode oferecer mais do que ${maxSeats} vagas, pois este é o limite de passageiros configurado para o seu veículo.`,
      );
      return;
    }
    setSeats(value);
  }

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
        // Transform backend data format to mobile expected format
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
      edgePadding: {
        top: 70,
        right: 50,
        bottom: bottomSheetHeight + 50,
        left: 50
      },
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
     
   

      // Get arrival date by adding the duration to the departure date
      let departureDateTime = departureDate instanceof Date ? departureDate : new Date(departureDate);
      let arrivalDateTime = new Date(departureDateTime.getTime() + (duration * 1000));
      
      const now = new Date();
      //previne erro 400 de post de data de saida no passado
      if (departureDateTime < now) {
        departureDateTime = now;
        arrivalDateTime = new Date(departureDateTime.getTime() + (duration * 1000));
      }
      // Ensure both dates are valid
      if (isNaN(departureDateTime.getTime()) || isNaN(arrivalDateTime.getTime())) {
        Alert.alert('Erro', 'Datas de partida ou chegada inválidas.');
        setLoading(false);
        return;
      }

      const rideData = {
        pontoPartida: departure,
        latitudePartida: departureLocation.latitude,
        longitudePartida: departureLocation.longitude,
        pontoDestino: arrival,
        latitudeDestino: arrivalLocation.latitude,
        longitudeDestino: arrivalLocation.longitude,
        dataHoraPartida: formatDateForApi(departureDateTime),
        dataHoraChegada: formatDateForApi(arrivalDateTime),
        vagas: parseInt(seats, 10),
        observacoes: observations
      };

      const options = {
        headers: {
          Authorization: `Bearer ${authToken}`
        }
      };
      
      console.debug('Submitting ride data:', rideData);
      const response = await apiClient.post('/carona', rideData, options);
      if (response.success) {
        Alert.alert(
          'Sucesso',
          'Sua carona foi registrada com sucesso!',
          [{
            text: 'OK',
            onPress: () => navigation.navigate('TabNavigator', {
              screen: 'Rides',
              params: {
                refresh: Date.now(),
                updated: true
              }
            })
          }]
        );
      } else {
        console.error('Erro ao registrar carona:', response.error.message);
        Alert.alert('Erro', 'Não foi possível registrar a carona. Tente novamente.');
      }

    } catch (error) {
      console.error('Error creating ride:', error);
      Alert.alert('Erro', 'Não foi possível registrar a carona. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  // Center the map button handler
  const handleCenterMap = () => {
    centerMapOnLocations();
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
          onRegionChangeComplete={handleRegionChange}
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

          <TouchableOpacity
            style={styles.centerMapButton}
            onPress={handleCenterMap}
          >
            <Ionicons name="locate" size={22} color={COLORS.text.primary} />
          </TouchableOpacity>
        </View>

        {/* Location edit button */}
        <Reanimated.View style={[styles.locationEditButton, locationButtonStyle]}>
          <LocationSelector
            departure={departure}
            arrival={arrival}
            onPress={handleChangeLocations}
          />
        </Reanimated.View>
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
        onSeatsChange={handleSeatsChange}
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
        routes={routes}
        selectedRoute={selectedRoute}
        onSelectRoute={handleSelectRoute}
        formatDuration={formatDuration}
        formatDistance={formatDistance}
        initialCarAvailableSeats={initialCarAvailableSeats}
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
    justifyContent: 'space-between',
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
  centerMapButton: {
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
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    marginHorizontal: 10,
  },
  locationEditButton: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 100 : 90,
    left: 16,
    right: 16,
    backgroundColor: COLORS.card,
    borderRadius: RADIUS.md,
    paddingVertical: 6,
    paddingHorizontal: 10,
    zIndex: 9,
    overflow: 'hidden',
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
    width: 24,
    alignItems: 'center',
    marginRight: 6,
  },
  locationIcon: {
    width: 20,
    height: 20,
    borderRadius: 10,
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
    height: 10,
    backgroundColor: COLORS.border,
    marginVertical: 1,
  },
  locationTexts: {
    flex: 1,
    height: '90%',
    justifyContent: 'space-between',
  },
  locationEditText: {
    fontSize: 13,
    color: COLORS.text.primary,
    marginVertical: 1,
    textAlign: 'left',
    paddingVertical: 2,
    flexShrink: 1,
  },
  locationEditIcon: {
    padding: 4,
  },
});

export default RegisterRidePage;
