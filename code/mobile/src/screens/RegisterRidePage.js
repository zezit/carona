import { useNavigation } from '@react-navigation/native';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  Alert,
  Keyboard,
  Platform,
  SafeAreaView,
  StatusBar,
  StyleSheet,
  View
} from 'react-native';
import RideFormBottomSheet from '../components/ride/RideFormBottomSheet';
import { 
  MapHeader, 
  MapOverlay, 
  RideMap, 
  RouteLoadingOverlay 
} from '../components/ui/RegisterRide';
import { useMapAnimations } from '../hooks/registerRide';
import { MapController, RouteCalculator, RideSubmissionHandler } from '../utils/registerRide';
import { useAuthContext } from '../contexts/AuthContext';
import { commonStyles } from '../theme/styles/commonStyles';

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

  // Use the custom hook for animations
  const { updateAnimations, locationButtonStyle, pulseAnimation } = useMapAnimations();

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
    updateAnimations(bottomSheetIndex);
  }, [bottomSheetIndex, updateAnimations]);

  // Watch for changes to both locations and center the map accordingly
  useEffect(() => {
    if (departureLocation && arrivalLocation) {
      // If we have both locations, fit to show both
      MapController.centerMapOnLocations(
        mapRef, 
        departureLocation, 
        arrivalLocation, 
        selectedRoute, 
        bottomSheetHeight
      );
    }
  }, [departureLocation, arrivalLocation, selectedRoute, bottomSheetHeight]);

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

  // Function to center the map on both locations - now uses MapController
  const centerMapOnLocations = () => {
    pulseAnimation(); // Add visual feedback
    MapController.centerMapOnLocations(
      mapRef, 
      departureLocation, 
      arrivalLocation, 
      selectedRoute, 
      bottomSheetHeight
    );
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
    if (!arrivalLocation) {
      MapController.animateToLocation(mapRef, {
        latitude: address.latitude,
        longitude: address.longitude
      });
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
    if (!departureLocation) {
      MapController.animateToLocation(mapRef, {
        latitude: address.latitude,
        longitude: address.longitude
      });
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
    if (RideSubmissionHandler.validateSeats(value, initialCarAvailableSeats)) {
      setSeats(value);
    }
  };

  // Update routes when both locations are set - now uses RouteCalculator
  const updateRoutes = async (start, end) => {
    if (!start || !end) return;

    setLoading(true);
    const { routes: calculatedRoutes, error } = await RouteCalculator.calculateRoutes(start, end, authToken);
    
    if (error) {
      Alert.alert('Erro', error);
    } else if (calculatedRoutes.length > 0) {
      setRoutes(calculatedRoutes);
      setSelectedRoute(calculatedRoutes[0]);
      setDuration(calculatedRoutes[0].duracaoSegundos || 0);

      // Fit map to show all routes
      const allCoordinates = calculatedRoutes.flatMap(route => route.pontos);
      MapController.fitMapToCoordinates(mapRef, allCoordinates, bottomSheetHeight);
    }
    
    setLoading(false);
  };

  // Handle selecting a different route
  const handleSelectRoute = (route) => {
    setSelectedRoute(route);
    setDuration(route.duracaoSegundos || 0);
    MapController.fitMapToCoordinates(mapRef, route.pontos, bottomSheetHeight);
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

  // Submit the ride creation - now uses RideSubmissionHandler
  const handleSubmitRide = async () => {
    setLoading(true);
    
    const result = await RideSubmissionHandler.submitRide({
      selectedRoute,
      departureLocation,
      arrivalLocation,
      departure,
      arrival,
      departureDate,
      duration,
      seats,
      observations,
      authToken,
      navigation
    });
    
    setLoading(false);
  };

  return (
    <SafeAreaView style={commonStyles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="transparent" translucent />

      <View style={styles.mapContainer}>
        <RideMap
          ref={mapRef}
          mapHeight={mapHeight}
          departureLocation={departureLocation}
          arrivalLocation={arrivalLocation}
          routes={routes}
          selectedRoute={selectedRoute}
          onMapPress={handleMapPress}
          onRegionChange={handleRegionChange}
          onSelectRoute={handleSelectRoute}
        />

        <RouteLoadingOverlay visible={loading && routes.length === 0} />

        <MapHeader
          title="Criar Carona"
          onBackPress={() => navigation.goBack()}
          onCenterMap={centerMapOnLocations}
        />

        <MapOverlay
          departure={departure}
          arrival={arrival}
          onPress={handleChangeLocations}
          animatedStyle={locationButtonStyle}
        />
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
        formatDuration={RouteCalculator.formatDuration}
        formatDistance={RouteCalculator.formatDistance}
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
  routeSelectorContainer: {
    position: 'absolute',
    bottom: 20,
    left: 0,
    right: 0,
    zIndex: 8,
  },
});

export default RegisterRidePage;
