import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useCallback, useEffect, useState,useRef, useMemo } from 'react';
import { Alert, Animated, StyleSheet, Text, View,Keyboard,Platform,StatusBar,TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { COLORS, FONT_SIZE, FONT_WEIGHT, SPACING,RADIUS } from '../constants';
import { useAuthContext } from '../contexts/AuthContext';
import { useFadeAnimation } from '../hooks/animations';
import { apiClient, getUpcomingRides } from '../services/api/apiClient';
import { commonStyles } from '../theme/styles/commonStyles';
import { ActionButton, PageHeader } from '../components/common';

import MapView, { Marker, Polyline, PROVIDER_GOOGLE } from 'react-native-maps';
import Reanimated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming
} from 'react-native-reanimated';
import { LocationSelector } from '../components/ride';
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
  
    console.debug('Initial params:', {
      initialDepartureLocation,
      initialDeparture,
      initialArrivalLocation,
      initialArrival,
      initialCarAvailableSeats
    });
  
    const handleChangeLocations = () => {
      navigation.navigate('LocationSelection', {
        departure,
        departureLocation,
        arrival,
        arrivalLocation,
        comingFromRegisterRide: false,  // Flag to indicate we're coming from RegisterRidePage
        comingFromFindRidesPage:true,
      });
    };
    const BOTTOM_SHEET_HEIGHTS = {
      COLLAPSED: 120,
      HALF: 300,
      EXPANDED: 500
    };
    const { authToken, user } = useAuthContext();
  
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
    const bottomSheetRef = useRef(null);
    const [activeAutocomplete, setActiveAutocomplete] = useState(null);
    const [mapRegion, setMapRegion] = useState(null);
  
  const mapRef = useRef(null);
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
   const [mapHeight, setMapHeight] = useState('100%');
  //  const handleCenterMap = () => {
  //   centerMapOnLocations();
  // };

  const locationButtonHeight = useSharedValue(80);
    const locationButtonOpacity = useSharedValue(1);
  
    // Define animated style for location button
    const locationButtonStyle = useAnimatedStyle(() => {
      return {
        height: locationButtonHeight.value,
        opacity: locationButtonOpacity.value,
      };
    });

     useEffect(() => {
        if (initialDepartureLocation && initialArrivalLocation) {
          updateRoutes(initialDepartureLocation, initialArrivalLocation);
        }
      }, []);

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
             // setSelectedRoute(limitedRoutes[0]);
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
    <SafeAreaView style={commonStyles.container} >
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
          // onPress={}
          // onRegionChangeComplete={}

        >
           <View style={styles.topBar}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Ionicons name="arrow-back" size={24} color={COLORS.text.primary} />
          </TouchableOpacity>

          <Text style={styles.titleText}>Solicitar carona</Text>

          <TouchableOpacity
            style={styles.centerMapButton}
            // onPress={handleCenterMap}
          >
            <Ionicons name="locate" size={22} color={COLORS.text.primary} />
          </TouchableOpacity>
        </View>
       </MapView>
        <Reanimated.View style={[styles.locationEditButton, locationButtonStyle]}>
                 <LocationSelector
                   departure={departure}
                   arrival={arrival}
                  onPress={handleChangeLocations}
                 />
               </Reanimated.View>
        </View>
      <RideRequestFormBottomSheet
       ref={bottomSheetRef}
       departure={departure}
       arrival={arrival}
       onDepartureChange={setDeparture}
       onArrivalChange={setArrival}
       departureDate={departureDate}
       onDateChange={handleDateChange}
       showDatePicker={showDatePicker}
       setShowDatePicker={setShowDatePicker}
       observations={observations}
       onObservationsChange={setObservations}
      //  onSubmit={handleSubmitRide}
       loading={loading}
       duration={duration}
       hasValidRoute={!!selectedRoute}
      //  onSelectDepartureAddress={handleSelectDepartureAddress}
      //  onSelectArrivalAddress={handleSelectArrivalAddress}
       activeInput={activeAutocomplete}
      //  onInputFocus={handleInputFocus}
      //  onSheetChange={handleSheetChanges}
      //  onChangeLocations={handleChangeLocations}
       routes={routes}
      // selectedRoute={selectedRoute}
      //  onSelectRoute={handleSelectRoute}
      //  formatDuration={formatDuration}
      //  formatDistance={formatDistance}
      />
          </SafeAreaView>
  )
};
const styles = StyleSheet.create({
   container:{
  alignItems:"center"
   },
   titleCard:{
   width:"90%",
   

   },
   mapContainer: {
    flex: 1,
    position: 'relative',
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
  });

export default FindRides