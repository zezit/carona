import { useFocusEffect } from '@react-navigation/native';
import React, { useCallback, useEffect, useState, useRef, useMemo } from 'react';
import { Alert, StyleSheet, View, Keyboard, Platform, StatusBar } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { COLORS, SPACING, RADIUS, FONT_SIZE, FONT_WEIGHT } from '../constants';
import { useAuthContext } from '../contexts/AuthContext';
import { apiClient } from '../services/api/apiClient';
import { commonStyles } from '../theme/styles/commonStyles';

// Import components from RegisterRide
import { MapHeader, MapOverlay, RideMap, RouteLoadingOverlay } from '../components/ui/RegisterRide';
import { useMapAnimations } from '../hooks/registerRide';
import RideRequestFormBottomSheet from '../components/ride/RideRequestFormBottomSheet';


// Import reusable components
import { LoadingIndicator, OptionButton } from '../components/ui';

const FindRides = ({navigation,  route}) => {
   const {
      departureLocation: initialDepartureLocation,
      departure: initialDeparture,
      arrivalLocation: initialArrivalLocation,
      arrival: initialArrival,
      carAvailableSeats: initialCarAvailableSeats,
    } = route.params || {};
    
    // Setting up initial state to prevent direct references to .value in render
    const [mountedOnce, setMountedOnce] = useState(false);
  
    console.debug('Initial params:', {
      initialDepartureLocation,
      initialDeparture,
      initialArrivalLocation,
      initialArrival,
      initialCarAvailableSeats
    });
  
    // Define constants and refs
    const BOTTOM_SHEET_HEIGHTS = {
      COLLAPSED: 120,
      HALF: 300,
      EXPANDED: 500
    };
    
    const { authToken, user } = useAuthContext();
    const mapRef = useRef(null);
    const bottomSheetRef = useRef(null);
  
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
    const [activeAutocomplete, setActiveAutocomplete] = useState(null);
    const [mapRegion, setMapRegion] = useState(null);
    const [bottomSheetIndex, setBottomSheetIndex] = useState(0);
    const [mapHeight, setMapHeight] = useState('100%');
    
    // Use map animations from the shared hook
    const { updateAnimations, locationButtonStyle, pulseAnimation } = useMapAnimations();
  
    // Calculated bottom sheet height based on index
    const bottomSheetHeight = useMemo(() => {
      switch (bottomSheetIndex) {
        case 0: return BOTTOM_SHEET_HEIGHTS.COLLAPSED;
        case 1: return BOTTOM_SHEET_HEIGHTS.HALF;
        case 2: return BOTTOM_SHEET_HEIGHTS.EXPANDED;
        default: return BOTTOM_SHEET_HEIGHTS.COLLAPSED;
      }
    }, [bottomSheetIndex]);

    // Handle location selection
    const handleChangeLocations = () => {
      navigation.navigate('LocationSelection', {
        departure,
        departureLocation,
        arrival,
        arrivalLocation,
        comingFromRegisterRide: false,
        comingFromFindRidesPage: true,
      });
    };

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

    // Initialize and update routes when component mounts
    useEffect(() => {
      // Initialize
      setTimeout(() => {
        setMountedOnce(true);
      }, 0);
      
      // Update routes if we have locations
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
      if (departureLocation && arrivalLocation && mapRef.current) {
        fitMapToCoordinates([departureLocation, arrivalLocation]);
      }
    }, [departureLocation, arrivalLocation]);

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
      
      // Use similar edge padding as in MapController
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
const handleSubmitRide = async () => {
  if (!departureLocation || !arrivalLocation || !selectedRoute) {
    Alert.alert('Erro', 'Por favor, selecione os pontos de partida, chegada e uma rota válida.');
    return;
  }

  try {
    setLoading(true);
    
    // Construindo o payload conforme a estrutura da API backend exata
    const payload = {
      origem: {
        name: departure, // Deve ser 'name' conforme o LocationDTO.java
        latitude: departureLocation.latitude,
        longitude: departureLocation.longitude
      },
      destino: {
        name: arrival, // Deve ser 'name' conforme o LocationDTO.java
        latitude: arrivalLocation.latitude,
        longitude: arrivalLocation.longitude
      },
      horarioChegadaPrevisto: departureDate.toISOString(),
      estudanteId: user.id,
      observacoes: observations || "" // Adicione as observações ao payload
    };
    
    console.debug('Submitting ride request with payload:', payload);
    
    // Fazendo a requisição para a API
    const response = await apiClient.post(
      `/solicitacao_carona/${user.id}`,
      payload,
      {
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'application/json'
        }
      }
    );
    
    // Verificando se a requisição foi bem-sucedida
    if (response.status === 200 || response.status === 201) {
      Alert.alert(
        'Sucesso', 
        'Sua solicitação de carona foi registrada com sucesso!',
        [{ 
          text: 'OK', 
          onPress: () => {
            // Clear form data and navigate back to the main navigator
            setDeparture('');
            setArrival('');
            setDepartureLocation(null);
            setArrivalLocation(null);
            setObservations('');
            setRoutes([]);
            setSelectedRoute(null);
            
            // Navigate to the root TabNavigator
            navigation.navigate('TabNavigator');
          }
        }]
      );
    } else {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
  } catch (error) {
    console.error('Erro ao submeter solicitação de carona:', error);
    
    // Provide more specific error messages based on the error type
    let errorMessage = 'Não foi possível enviar sua solicitação. Tente novamente.';
    
    if (error.response) {
      // Server responded with error status
      if (error.response.status === 400) {
        errorMessage = 'Dados inválidos. Verifique as informações inseridas.';
      } else if (error.response.status === 401) {
        errorMessage = 'Sessão expirada. Faça login novamente.';
      } else if (error.response.status >= 500) {
        errorMessage = 'Erro no servidor. Tente novamente em alguns minutos.';
      }
    } else if (error.request) {
      // Network error
      errorMessage = 'Problema de conexão. Verifique sua internet e tente novamente.';
    }
    
        Alert.alert('Erro', errorMessage);
  } finally {
    setLoading(false);
  }
};

  // Handle route selection
  const handleSelectRoute = (route) => {
    setSelectedRoute(route);
    setDuration(route.duracaoSegundos || 0);
    if (route.pontos && route.pontos.length > 0) {
      fitMapToCoordinates(route.pontos);
    }
  };

  // Handle bottom sheet changes
  const handleSheetChanges = useCallback((index) => {
    setBottomSheetIndex(index);
  }, []);

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

  // Center map on both locations
  const centerMapOnLocations = useCallback(() => {
    if (selectedRoute && selectedRoute.pontos && selectedRoute.pontos.length > 0) {
      // If we have a route, fit to the entire route
      fitMapToCoordinates(selectedRoute.pontos);
    } else if (departureLocation && arrivalLocation) {
      // If we have both locations but no route yet
      fitMapToCoordinates([departureLocation, arrivalLocation]);
    } else if (departureLocation) {
      // If we only have departure location
      mapRef.current?.animateToRegion({
        latitude: departureLocation.latitude,
        longitude: departureLocation.longitude,
        latitudeDelta: 0.01,
        longitudeDelta: 0.01,
      }, 500);
    } else if (arrivalLocation) {
      // If we only have arrival location
      mapRef.current?.animateToRegion({
        latitude: arrivalLocation.latitude,
        longitude: arrivalLocation.longitude,
        latitudeDelta: 0.01,
        longitudeDelta: 0.01,
      }, 500);
    }
    
    // Add visual feedback if using the hook's pulseAnimation
    if (pulseAnimation) {
      pulseAnimation();
    }
  }, [departureLocation, arrivalLocation, selectedRoute, bottomSheetHeight, pulseAnimation]);

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
  return (
    <SafeAreaView style={commonStyles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="transparent" translucent />

      <View style={styles.mapContainer}>
        {mountedOnce && (
          <RideMap
            ref={mapRef}
            mapHeight={mapHeight}
            departureLocation={departureLocation}
            arrivalLocation={arrivalLocation}
            routes={routes}
            selectedRoute={selectedRoute}
            onSelectRoute={handleSelectRoute}
          />
        )}

        <RouteLoadingOverlay visible={loading && routes.length === 0} />

        <MapHeader
          title="Solicitar Carona"
          onBackPress={() => navigation.goBack()}
          onCenterMap={centerMapOnLocations}
        />

        {mountedOnce && (
          <MapOverlay
            departure={departure}
            arrival={arrival}
            onPress={handleChangeLocations}
            animatedStyle={locationButtonStyle}
          />
        )}
      </View>
      
      <RideRequestFormBottomSheet
        ref={bottomSheetRef}
        departure={departure}
        arrival={arrival}
        departureDate={departureDate}
        onDateChange={handleDateChange}
        observations={observations}
        onObservationsChange={setObservations}
        onSubmit={handleSubmitRide}
        loading={loading}
        duration={duration}
        hasValidRoute={!!selectedRoute}
        onSheetChange={handleSheetChanges}
        selectedRoute={selectedRoute}
      />
    </SafeAreaView>
  )
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
  container:{
  alignItems:"center"
   },
   titleCard:{
   width:"90%",
   

   },
   map: {
    ...StyleSheet.absoluteFillObject,
  },
   titulo:{
    fontSize: FONT_SIZE.xl,
    fontWeight: FONT_WEIGHT.bold,
    color: COLORS.text.primary,
    marginBottom: SPACING.xs,
    textAlign:"center"
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
    backgroundColor: COLORS.background.card,
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
    backgroundColor: COLORS.background.card,
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
      backgroundColor: COLORS.background.card,
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
  });

export default FindRides;