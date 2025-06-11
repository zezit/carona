import React, { useState, useEffect, useRef, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  Linking,
  Dimensions,
  ActivityIndicator,
  Platform,
  SafeAreaView,
  StatusBar,
  ScrollView,
} from 'react-native';
import MapView, { Marker, Polyline, PROVIDER_GOOGLE } from 'react-native-maps';
import * as Location from 'expo-location';
import { Ionicons } from '@expo/vector-icons';
import BottomSheet, { BottomSheetScrollView } from '@gorhom/bottom-sheet';
import { COLORS, RADIUS } from '../../constants';
import { commonStyles } from '../../theme/styles/commonStyles';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAuthContext } from '../../contexts/AuthContext';
import { apiClient } from '../../services/api/apiClient';
import UserAvatar from '../../components/common/UserAvatar';
import StarRating from '../../components/common/StarRating';

const { width, height } = Dimensions.get('window');

const CaronaDetailsScreen = ({ route, navigation }) => {
  const { carona } = route.params;
  const { authToken, user } = useAuthContext();
  const insets = useSafeAreaInsets();
  const [currentLocation, setCurrentLocation] = useState(null);
  const [isLoadingLocation, setIsLoadingLocation] = useState(true);
  const [isPassengersExpanded, setIsPassengersExpanded] = useState(false);
  const [completeRoute, setCompleteRoute] = useState(null);
  const [passengerWaypoints, setPassengerWaypoints] = useState([]);
  const [loadingRoute, setLoadingRoute] = useState(false);
  const [driverProfile, setDriverProfile] = useState(null);
  const [loadingDriverProfile, setLoadingDriverProfile] = useState(false);
  const [driverStudent, setDriverStudent] = useState(null);
  const [loadingDriverStudent, setLoadingDriverStudent] = useState(false);
  const mapRef = useRef(null);
  const bottomSheetRef = useRef(null);
  
  // Bottom sheet snap points
  const snapPoints = useMemo(() => ['30%', '60%', '90%'], []);

  useEffect(() => {
    getCurrentLocation();
    fetchCompleteRoute();
    fetchDriverProfile();
    fetchDriverStudent();
  }, []);

  // Auto-fit map when route coordinates change
  useEffect(() => {
    if (routeCoordinates && routeCoordinates.length > 0 && mapRef.current) {
      const timeout = setTimeout(() => {
        const allCoordinates = [...routeCoordinates];
        
        // Add passenger waypoints to the coordinates for better map fitting
        if (passengerWaypoints && passengerWaypoints.length > 0) {
          passengerWaypoints.forEach(waypoint => {
            allCoordinates.push({
              latitude: waypoint.latitude,
              longitude: waypoint.longitude
            });
          });
        }
        
        fitMapToCoordinates(allCoordinates);
      }, 1500); // Delay to ensure map is fully loaded
      
      return () => clearTimeout(timeout);
    }
  }, [routeCoordinates, passengerWaypoints]);

  // Fetch the complete route with passenger waypoints
  const fetchCompleteRoute = async () => {
    if (!carona?.id || !authToken) {
      console.log('Missing carona ID or auth token for route fetching');
      return;
    }

    try {
      setLoadingRoute(true);
      console.log('Fetching complete route for ride:', carona.id);
      
      const completeRouteResponse = await apiClient.get(
        `/carona/${carona.id}/complete-route`,
        {
          headers: {
            Authorization: `Bearer ${authToken}`,
            'Content-Type': 'application/json'
          }
        }
      );

      if (completeRouteResponse.success && completeRouteResponse.data?.rotaCompleta) {
        const completeRouteData = completeRouteResponse.data;
        
        // Convert complete route coordinates to mobile format
        const pontos = completeRouteData.rotaCompleta.coordenadas.map(coord => ({
          latitude: coord[0],
          longitude: coord[1]
        }));

        // Update passenger waypoints from the response
        if (completeRouteData.pontosPassageiros && completeRouteData.pontosPassageiros.length > 0) {
          const waypoints = completeRouteData.pontosPassageiros.map(ponto => ({
            latitude: ponto.latitude,
            longitude: ponto.longitude,
            type: ponto.tipo === 'EMBARQUE' ? 'pickup' : 'dropoff',
            passenger: ponto.nomePassageiro,
            address: ponto.endereco,
            id: `${ponto.tipo.toLowerCase()}-${ponto.passageiroId}`,
            pedidoId: ponto.pedidoId,
            ordem: ponto.ordem,
            matricula: ponto.matricula,
            curso: ponto.curso,
            email: ponto.email
          }));
          setPassengerWaypoints(waypoints);
          console.log('Updated passenger waypoints from complete route:', waypoints);
        } else {
          setPassengerWaypoints([]);
          console.log('No passenger waypoints found for this ride');
        }

        // Create the complete route object
        const processedRoute = {
          coordenadas: completeRouteData.rotaCompleta.coordenadas,
          pontos,
          distanciaMetros: completeRouteData.distanciaTotalMetros || 0,
          duracaoSegundos: completeRouteData.tempoTotalSegundos || 0,
          descricao: 'Rota Completa com Passageiros',
          isCompleteRoute: true
        };

        setCompleteRoute(processedRoute);

        // Fit map to show the complete route including passenger waypoints
        const allCoordinates = [...pontos];
        if (completeRouteData.pontosPassageiros) {
          completeRouteData.pontosPassageiros.forEach(ponto => {
            allCoordinates.push({
              latitude: ponto.latitude,
              longitude: ponto.longitude
            });
          });
        }
        
        // Delay map fitting to ensure map is ready
        setTimeout(() => {
          fitMapToCoordinates(allCoordinates);
        }, 1000);
        
        console.log('Complete route loaded successfully:', {
          totalDistance: completeRouteData.distanciaTotalMetros,
          totalTime: completeRouteData.tempoTotalSegundos,
          passengerStops: completeRouteData.pontosPassageiros?.length || 0
        });
        
      } else {
        console.log('No complete route available, fetching basic trajectory');
        // Fallback to basic trajectory calculation
        await fetchBasicRoute();
      }
    } catch (error) {
      console.warn('Complete route not available, falling back to basic route:', error);
      await fetchBasicRoute();
    } finally {
      setLoadingRoute(false);
    }
  };

  // Fallback function to fetch basic route
  const fetchBasicRoute = async () => {
    try {
      console.log('Fetching basic route trajectory');
      
      const latStart = carona.latitudePartida;
      const lngStart = carona.longitudePartida;
      const latEnd = carona.latitudeDestino;
      const lngEnd = carona.longitudeDestino;

      if (!latStart || !lngStart || !latEnd || !lngEnd) {
        console.error('Missing coordinates for basic route calculation');
        return;
      }

      const response = await apiClient.get(
        `/maps/trajectories?startLat=${latStart}&startLon=${lngStart}&endLat=${latEnd}&endLon=${lngEnd}`,
        {
          headers: {
            Authorization: `Bearer ${authToken}`,
            'Content-Type': 'application/json'
          }
        }
      );

      if (response.success && response.data && response.data.length > 0) {
        // Use the first route from the response
        const route = response.data[0];
        
        // Convert coordinates to mobile format
        const pontos = route.coordenadas.map(coord => ({
          latitude: coord[0],
          longitude: coord[1]
        }));

        const processedRoute = {
          coordenadas: route.coordenadas,
          pontos,
          distanciaMetros: route.distanciaMetros || 0,
          duracaoSegundos: route.tempoSegundos || 0,
          descricao: 'Rota Básica',
          isCompleteRoute: false
        };

        setCompleteRoute(processedRoute);
        setPassengerWaypoints([]); // No passenger waypoints for basic route

        // Fit map to show the basic route
        setTimeout(() => {
          fitMapToCoordinates(pontos);
        }, 500);

        console.log('Basic route loaded successfully:', {
          totalDistance: route.distanciaMetros,
          totalTime: route.tempoSegundos,
        });
      } else {
        console.error('No trajectory data available');
        setCompleteRoute(null);
        setPassengerWaypoints([]);
      }
    } catch (error) {
      console.error('Error fetching basic route:', error);
      setCompleteRoute(null);
      setPassengerWaypoints([]);
    }
  };

  // Fetch driver profile information
  const fetchDriverProfile = async () => {
    // Try different ways to get the driver ID from carona
    const driverId = carona?.motoristaId || carona?.motorista?.id || carona?.motoristId;
    
    if (!driverId || !authToken) {
      console.log('Missing driver ID or auth token for driver profile fetching');
      console.log('Available carona fields:', Object.keys(carona || {}));
      return;
    }

    try {
      setLoadingDriverProfile(true);
      console.log('Fetching driver profile for ID:', driverId);
      
      const response = await apiClient.get(
        `/estudante/${driverId}/motorista`,
        {
          headers: {
            Authorization: `Bearer ${authToken}`,
            'Content-Type': 'application/json'
          }
        }
      );

      if (response.success && response.data) {
        setDriverProfile(response.data);
        console.log('Driver profile loaded successfully:', response.data);
      } else {
        console.warn('No driver profile data available');
        setDriverProfile(null);
      }
    } catch (error) {
      console.error('Error fetching driver profile:', error);
      setDriverProfile(null);
    } finally {
      setLoadingDriverProfile(false);
    }
  };

  // Fetch driver student information
  const fetchDriverStudent = async () => {
    // Try different ways to get the driver ID from carona
    const driverId = carona?.motoristaId || carona?.motorista?.id || carona?.motoristId;
    
    if (!driverId || !authToken) {
      console.log('Missing driver ID or auth token for driver student fetching');
      return;
    }

    try {
      setLoadingDriverStudent(true);
      console.log('Fetching driver student info for ID:', driverId);
      
      const response = await apiClient.get(
        `/estudante/${driverId}`,
        {
          headers: {
            Authorization: `Bearer ${authToken}`,
            'Content-Type': 'application/json'
          }
        }
      );

      if (response.success && response.data) {
        setDriverStudent(response.data);
        console.log('Driver student info loaded successfully:', response.data);
      } else {
        console.warn('No driver student data available');
        setDriverStudent(null);
      }
    } catch (error) {
      console.error('Error fetching driver student info:', error);
      setDriverStudent(null);
    } finally {
      setLoadingDriverStudent(false);
    }
  };

  // Fit map to show coordinates with proper padding
  const fitMapToCoordinates = (coordinates) => {
    if (!coordinates || coordinates.length === 0 || !mapRef.current) return;

    try {
      mapRef.current.fitToCoordinates(coordinates, {
        edgePadding: {
          top: 120,
          right: 60,
          bottom: 250, // Extra padding for bottom sheet
          left: 60
        },
        animated: true
      });
    } catch (error) {
      console.error('Error fitting map to coordinates:', error);
    }
  };

  const getCurrentLocation = async () => {
    try {
      setIsLoadingLocation(true);
      
      // Solicitar permissões de localização
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Erro', 'Permissão de localização negada');
        setIsLoadingLocation(false);
        return;
      }

      // Obter localização atual
      const position = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High,
      });

      setCurrentLocation({
        latitude: position.coords.latitude,
        longitude: position.coords.longitude,
        latitudeDelta: 0.01,
        longitudeDelta: 0.01,
      });
    } catch (error) {
      console.error('Erro ao obter localização:', error);
    } finally {
      setIsLoadingLocation(false);
    }
  };

  const centerMapOnCurrentLocation = () => {
    if (currentLocation && mapRef.current) {
      mapRef.current.animateToRegion(currentLocation, 1000);
    } else {
      getCurrentLocation();
    }
  };

  // Center map to show the complete route
  const centerMapOnRoute = () => {
    if (!mapRef.current) return;

    if (routeCoordinates && routeCoordinates.length > 0) {
      // Create array with route coordinates and passenger waypoints
      const allCoordinates = [...routeCoordinates];
      
      if (passengerWaypoints && passengerWaypoints.length > 0) {
        passengerWaypoints.forEach(waypoint => {
          allCoordinates.push({
            latitude: waypoint.latitude,
            longitude: waypoint.longitude
          });
        });
      }
      
      fitMapToCoordinates(allCoordinates);
    } else if (origem && destino) {
      // Fallback to showing origin and destination
      fitMapToCoordinates([origem, destino]);
    }
  };

  const getFormattedDateTime = (isoDateTime) => {
    try {
      const date = new Date(isoDateTime);
      return `${date.getDate().toString().padStart(2, '0')}/${(date.getMonth() + 1)
        .toString()
        .padStart(2, '0')}/${date.getFullYear()} às ${date
        .getHours()
        .toString()
        .padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`;
    } catch (error) {
      return isoDateTime;
    }
  };

  const getFormattedTime = (seconds) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    
    if (hours > 0) {
      return `${hours}h ${minutes}min`;
    } else {
      return `${minutes}min`;
    }
  };

  // Calculate arrival time based on departure time and duration
  const getCalculatedArrivalTime = () => {
    try {
      const departureDate = new Date(carona.dataHoraPartida);
      const durationSeconds = completeRoute ? completeRoute.duracaoSegundos : carona.tempoEstimadoSegundos;
      
      if (isNaN(departureDate.getTime()) || !durationSeconds) {
        return null;
      }
      
      const arrivalDate = new Date(departureDate.getTime() + (durationSeconds * 1000));
      return arrivalDate.toISOString();
    } catch (error) {
      console.error('Error calculating arrival time:', error);
      return null;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'EM_ANDAMENTO':
        return '#2196F3';
      case 'FINALIZADA':
        return '#4CAF50';
      case 'CANCELADA':
        return '#F44336';
      default:
        return '#9E9E9E';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'EM_ANDAMENTO':
        return 'Em Andamento';
      case 'FINALIZADA':
        return 'Finalizada';
      case 'CANCELADA':
        return 'Cancelada';
      default:
        return status;
    }
  };

  const launchWhatsApp = async (phoneNumber) => {
    const url = `whatsapp://send?phone=55${phoneNumber}`;
    const webUrl = `https://wa.me/55${phoneNumber}`;
    
    try {
      const supported = await Linking.canOpenURL(url);
      if (supported) {
        await Linking.openURL(url);
      } else {
        await Linking.openURL(webUrl);
      }
    } catch (error) {
      Alert.alert('Erro', 'Não foi possível abrir o WhatsApp');
    }
  };

  const finalizarCarona = () => {
    Alert.alert(
      'Finalizar Carona',
      'Deseja realmente finalizar esta carona?',
      [
        {
          text: 'Cancelar',
          style: 'cancel',
        },
        {
          text: 'Finalizar',
          onPress: () => {
            // Aqui você implementaria a chamada para a API
            navigation.goBack();
            Alert.alert('Sucesso', 'Carona finalizada com sucesso!');
          },
        },
      ]
    );
  };

  const iniciarCarona = () => {
    Alert.alert(
      'Iniciar Carona',
      'Deseja realmente iniciar esta carona? Os passageiros serão notificados.',
      [
        {
          text: 'Cancelar',
          style: 'cancel',
        },
        {
          text: 'Iniciar',
          onPress: async () => {
            try {
              const response = await apiClient.patch(`/carona/${carona.id}/iniciar`, null, {
                headers: {
                  Authorization: `Bearer ${authToken}`,
                  'Content-Type': 'application/json'
                }
              });

              if (response.success) {
                Alert.alert('Sucesso', 'Carona iniciada com sucesso! Os passageiros foram notificados.');
                // Update carona status locally or refresh the screen
                if (route.params.onUpdate) {
                  route.params.onUpdate();
                }
                navigation.goBack();
              } else {
                Alert.alert('Erro', response.error?.message || 'Não foi possível iniciar a carona.');
              }
            } catch (error) {
              console.error('Error starting ride:', error);
              Alert.alert('Erro', 'Ocorreu um erro ao iniciar a carona. Tente novamente.');
            }
          },
        },
      ]
    );
  };

  const handleSheetChanges = (index) => {
    // Handle bottom sheet changes if needed
  };

  const renderInfoRow = (icon, label, value, iconColor, isValueField = false) => (
    <View style={styles.infoRow}>
      <View style={[styles.iconContainer, { backgroundColor: `${iconColor}20` }]}>
        <Ionicons name={icon} size={22} color={iconColor} />
      </View>
      <View style={styles.infoContent}>
        <Text style={styles.infoLabel}>{label}</Text>
        <Text style={[
          styles.infoValue,
          isValueField && { color: '#4CAF50', fontWeight: 'bold' }
        ]}>
          {value}
        </Text>
      </View>
    </View>
  );

  const renderPassengerCard = (passenger) => (
    <View key={passenger.id} style={styles.passengerCard}>
      <View style={styles.passengerInfo}>
        <View style={styles.passengerHeader}>
          <View style={styles.passengerMainInfo}>
            <UserAvatar
              uri={passenger.imgUrl}
              size={40}
              placeholder="person"
              placeholderColor={COLORS.primary.main}
              style={styles.passengerAvatar}
            />
            <View style={styles.passengerDetails}>
              <Text style={styles.passengerName}>{passenger.nome}</Text>
              <Text style={styles.passengerCourse}>{passenger.curso}</Text>
              <Text style={styles.passengerMatricula}>Mat: {passenger.matricula}</Text>
            </View>
          </View>
          {/* {passenger.avaliacaoMedia && ( */}
            <StarRating
              rating={passenger.avaliacaoMedia}
              size={14}
              showValue={true}
            />
          {/* )} */}
        </View>
      </View>
    </View>
  );

  // Preparar dados do mapa
  const origem = {
    latitude: carona.latitudePartida,
    longitude: carona.longitudePartida,
  };

  const destino = {
    latitude: carona.latitudeDestino,
    longitude: carona.longitudeDestino,
  };

  // Use complete route if available, otherwise fall back to basic trajectory
  const routeCoordinates = useMemo(() => {
    // Priority 1: Complete route with optimized path including passenger waypoints
    if (completeRoute && completeRoute.pontos && completeRoute.pontos.length > 0) {
      console.log('Using complete optimized route with', completeRoute.pontos.length, 'coordinates');
      return completeRoute.pontos;
    }
    
    // Priority 2: Basic route from carona trajetorias
    if (carona.trajetorias && carona.trajetorias.length > 0) {
      console.log('Using basic route from carona trajetorias');
      return carona.trajetorias[0].coordenadas.map(coord => ({
        latitude: coord[0],
        longitude: coord[1],
      }));
    }
    
    // Priority 3: Simple direct line (fallback)
    console.log('No route data available, using direct line');
    return [origem, destino];
  }, [completeRoute, carona.trajetorias, origem, destino]);

  // Helper function to render passenger waypoint markers
  const renderPassengerWaypoints = () => {
    if (!passengerWaypoints || passengerWaypoints.length === 0) return null;

    return passengerWaypoints.map((waypoint, index) => (
      <Marker
        key={waypoint.id}
        coordinate={{ latitude: waypoint.latitude, longitude: waypoint.longitude }}
        title={`${waypoint.type === 'pickup' ? 'Embarque' : 'Desembarque'}: ${waypoint.passenger}`}
        description={waypoint.address}
      >
        <View style={styles.customMarker}>
          <View style={[
            styles.markerInner, 
            { backgroundColor: waypoint.type === 'pickup' ? '#FF9800' : '#9C27B0' }
          ]}>
            <Ionicons 
              name={waypoint.type === 'pickup' ? 'person-add' : 'person-remove'} 
              size={16} 
              color="white" 
            />
          </View>
          <View style={styles.markerNumber}>
            <Text style={styles.markerNumberText}>{waypoint.ordem || index + 1}</Text>
          </View>
        </View>
      </Marker>
    ));
  };

  const status = carona.status;
  const statusText = getStatusText(status);
  const statusColor = getStatusColor(status);
  const isInProgress = status === 'EM_ANDAMENTO';
  const isScheduled = status === 'AGENDADA';
  const passageiros = carona.passageiros || [];
  
  // Determine if current user is the driver
  const driverId = carona?.motoristaId || carona?.motorista?.id || carona?.motoristId;
  const isCurrentUserDriver = user?.id && driverId && user.id.toString() === driverId.toString();
  
  // Determine if current user is a passenger
  const isCurrentUserPassenger = user?.id && passageiros.some(p => 
    p.id?.toString() === user.id.toString() || 
    p.estudanteId?.toString() === user.id.toString()
  );
  
  // Use fetched driver profile data or fallback to carona data
  const motorista = {
    // Merge driver profile data with student data
    ...(driverProfile || {}),
    ...(driverStudent || {}),
    ...(carona.motorista || {})
  };
  const carro = driverProfile?.carro || motorista?.carro || {};

  // Debug logging to understand the data structure
  console.log('Driver data structure:', {
    hasFetchedProfile: !!driverProfile,
    hasFetchedStudent: !!driverStudent,
    hasCaronaMotorista: !!carona.motorista,
    motoristaKeys: motorista ? Object.keys(motorista) : [],
    hasCarro: !!carro,
    carroKeys: carro ? Object.keys(carro) : [],
    loadingDriverProfile,
    loadingDriverStudent
  });

  return (
    <SafeAreaView style={[styles.container, { paddingTop: insets.top }]}>
      <StatusBar barStyle="dark-content" backgroundColor="transparent" translucent />
      
      {/* Map Container */}
      <View style={styles.mapContainer}>
        <MapView
          ref={mapRef}
          style={styles.map}
          provider={PROVIDER_GOOGLE}
          initialRegion={{
            latitude: origem.latitude,
            longitude: origem.longitude,
            latitudeDelta: 0.05,
            longitudeDelta: 0.05,
          }}
          showsUserLocation={true}
          showsMyLocationButton={false}
        >
          {/* Marcador de origem */}
          <Marker coordinate={origem} title="Partida">
            <View style={styles.customMarker}>
              <View style={[styles.markerInner, { backgroundColor: COLORS.primary.main }]}>
                <Ionicons name="location" size={20} color="white" />
              </View>
            </View>
          </Marker>

          {/* Marcador de destino */}
          <Marker coordinate={destino} title="Destino">
            <View style={styles.customMarker}>
              <View style={[styles.markerInner, { backgroundColor: COLORS.secondary.main }]}>
                <Ionicons name="flag" size={20} color="white" />
              </View>
            </View>
          </Marker>

          {/* Passenger waypoint markers */}
          {renderPassengerWaypoints()}

          {/* Rota completa ou básica */}
          {routeCoordinates.length > 0 && (
            <Polyline
              coordinates={routeCoordinates}
              strokeColor={COLORS.primary.main}
              strokeWidth={5}
              strokePattern={completeRoute?.isCompleteRoute ? undefined : [10, 5]} // Dashed line for basic route
              lineCap="round"
              lineJoin="round"
            />
          )}
          
          {/* Route optimization visual indicator */}
          {completeRoute?.isCompleteRoute && routeCoordinates.length > 0 && (
            <Polyline
              coordinates={routeCoordinates}
              strokeColor={`${COLORS.primary.main}40`} // Semi-transparent overlay
              strokeWidth={8}
              lineCap="round"
              lineJoin="round"
            />
          )}
        </MapView>

        {/* Loading overlays */}
        {(isLoadingLocation || loadingRoute || loadingDriverProfile || loadingDriverStudent) && (
          <View style={styles.loadingOverlay}>
            <ActivityIndicator size="large" color={COLORS.primary.main} />
            <Text style={styles.loadingText}>
              {isLoadingLocation ? 'Obtendo localização...' : 
               loadingRoute ? 'Carregando rota otimizada...' : 
               loadingDriverProfile ? 'Carregando perfil do motorista...' :
               'Carregando informações do estudante...'}
            </Text>
          </View>
        )}

        {/* Top Bar */}
        <View style={styles.topBar}>
          <TouchableOpacity 
            style={styles.topBarButton} 
            onPress={() => navigation.goBack()}
          >
            <Ionicons name="arrow-back" size={24} color={COLORS.text.primary} />
          </TouchableOpacity>
          
          <Text style={styles.titleText}>Detalhes da Carona</Text>
          
          {isCurrentUserPassenger && motorista?.mostrarWhatsapp && motorista?.whatsapp && (
            <TouchableOpacity 
              style={styles.topBarButton} 
              onPress={() => launchWhatsApp(motorista.whatsapp)}
            >
              <Ionicons name="logo-whatsapp" size={24} color="#25D366" />
            </TouchableOpacity>
          )}
        </View>

        {/* Status and Info Bar */}
        <View style={styles.statusInfoBar}>
          <View style={[
            styles.statusBadge, 
            { 
              borderColor: statusColor, 
              backgroundColor: isInProgress ? statusColor : `${statusColor}20`,
              ...(isInProgress && {
                shadowColor: statusColor,
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.3,
                shadowRadius: 4,
                elevation: 4,
              })
            }
          ]}>
            <Ionicons 
              name={isInProgress ? "car" : status === 'FINALIZADA' ? "checkmark-circle" : status === 'CANCELADA' ? "close-circle" : "calendar"} 
              size={18} 
              color={isInProgress ? '#fff' : statusColor} 
            />
            <Text style={[
              styles.statusText, 
              { color: isInProgress ? '#fff' : statusColor }
            ]}>
              {statusText}
            </Text>
          </View>
          
          <View style={styles.mapButtons}>
            <TouchableOpacity
              style={styles.mapButton}
              onPress={centerMapOnRoute}
            >
              <Ionicons name="map" size={22} color="white" />
            </TouchableOpacity>
            
            <TouchableOpacity
              style={styles.mapButton}
              onPress={centerMapOnCurrentLocation}
            >
              <Ionicons name="locate" size={22} color="white" />
            </TouchableOpacity>
          </View>
        </View>
      </View>

      {/* Bottom Sheet */}
      <BottomSheet
        ref={bottomSheetRef}
        index={0}
        snapPoints={snapPoints}
        onChange={handleSheetChanges}
        enablePanDownToClose={false}
        handleIndicatorStyle={styles.handleIndicator}
        backgroundStyle={styles.bottomSheetBackground}
      >
        <BottomSheetScrollView 
          style={styles.bottomSheetContent}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.bottomSheetContentContainer}
        >
          {/* Route Info Header */}
          <View style={styles.routeInfoHeader}>
            <View style={styles.routeMetrics}>
              <View style={styles.routeMetric}>
                <Ionicons name="resize" size={16} color={COLORS.primary.main} />
                <Text style={styles.routeMetricValue}>
                  {completeRoute ? 
                    `${(completeRoute.distanciaMetros / 1000).toFixed(1)} km` : 
                    `${carona.distanciaEstimadaKm} km`
                  }
                </Text>
              </View>
              <View style={styles.routeMetric}>
                <Ionicons name="time" size={16} color={COLORS.primary.main} />
                <Text style={styles.routeMetricValue}>
                  {completeRoute ? 
                    getFormattedTime(completeRoute.duracaoSegundos) : 
                    getFormattedTime(carona.tempoEstimadoSegundos)
                  }
                </Text>
              </View>
              <View style={styles.routeMetric}>
                <Ionicons name="people" size={16} color={COLORS.primary.main} />
                <Text style={styles.routeMetricValue}>
                  {carona.vagasDisponiveis}/{carona.vagas}
                </Text>
              </View>
            </View>
            
            {/* Route Type Indicator */}
            <View style={styles.routeTypeIndicator}>
              <View style={[
                styles.routeTypeBadge, 
                { backgroundColor: completeRoute?.isCompleteRoute ? `${COLORS.primary.main}15` : `#FF980015` }
              ]}>
                <Ionicons 
                  name={completeRoute?.isCompleteRoute ? "checkmark-circle" : "information-circle"} 
                  size={14} 
                  color={completeRoute?.isCompleteRoute ? COLORS.primary.main : '#FF9800'} 
                />
                <Text style={[
                  styles.routeTypeText,
                  { color: completeRoute?.isCompleteRoute ? COLORS.primary.main : '#FF9800' }
                ]}>
                  {completeRoute?.isCompleteRoute ? 'Rota Otimizada' : 'Rota Básica'}
                </Text>
              </View>
              {passengerWaypoints.length > 0 && (
                <Text style={styles.waypointsCount}>
                  {passengerWaypoints.length} parada{passengerWaypoints.length !== 1 ? 's' : ''} de passageiros
                </Text>
              )}
            </View>
          </View>

          {/* Trip Details */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Informações da Viagem</Text>
            <View style={styles.card}>
              {renderInfoRow('location', 'Partida', carona.pontoPartida, COLORS.primary.main)}
              {renderInfoRow('flag', 'Destino', carona.pontoDestino, COLORS.secondary.main)}
              
              <View style={styles.divider} />
              
              {renderInfoRow('time', 'Partida', getFormattedDateTime(carona.dataHoraPartida), COLORS.primary.main)}
              {(() => {
                const calculatedArrival = getCalculatedArrivalTime();
                return calculatedArrival ? 
                  renderInfoRow('time-outline', 'Chegada (estimada)', getFormattedDateTime(calculatedArrival), '#FF9800') :
                  renderInfoRow('time-outline', 'Duração', getFormattedTime(carona.tempoEstimadoSegundos), '#FF9800');
              })()}
              
              {carona.observacoes && (
                <>
                  <View style={styles.divider} />
                  {renderInfoRow('chatbubble-ellipses', 'Observações', carona.observacoes, '#9E9E9E')}
                </>
              )}
            </View>
          </View>

          {/* Vehicle Information */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Veículo</Text>
            <View style={styles.card}>
              {carro && Object.keys(carro).length > 0 ? (
                <View style={styles.vehicleHeader}>
                  <View style={styles.vehicleIcon}>
                    <Ionicons name="car-sport" size={24} color={COLORS.primary.main} />
                  </View>
                  <View style={styles.vehicleInfo}>
                    <Text style={styles.vehicleModel}>
                      {carro.modelo || 'Modelo não informado'}
                    </Text>
                    <Text style={styles.vehicleDetails}>
                      {[carro.cor, carro.placa].filter(Boolean).join(' • ') || 'Informações não disponíveis'}
                    </Text>
                  </View>
                  <View style={styles.vehicleCapacity}>
                    <Text style={styles.capacityNumber}>
                      {carro.capacidadePassageiros || '?'}
                    </Text>
                    <Text style={styles.capacityLabel}>passageiros</Text>
                  </View>
                </View>
              ) : (
                <View style={styles.noDataContainer}>
                  <Ionicons name="car-outline" size={48} color={COLORS.text.secondary} />
                  <Text style={styles.noDataText}>Informações do veículo não disponíveis</Text>
                </View>
              )}
            </View>
          </View>

          {/* Driver Information */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Motorista</Text>
            <View style={styles.card}>
              {motorista && Object.keys(motorista).length > 0 ? (
                <View style={styles.driverHeader}>
                  <UserAvatar
                    uri={motorista.imgUrl}
                    size={48}
                    placeholder="person"
                    placeholderColor={COLORS.primary.main}
                    style={styles.driverAvatar}
                  />
                  <View style={styles.driverInfo}>
                    <Text style={styles.driverName}>
                      {motorista.nome || 'Nome não informado'}
                    </Text>
                    <Text style={styles.driverDetails}>
                      {motorista.curso || 'Curso não informado'}
                    </Text>
                    <Text style={styles.driverMatricula}>
                      Mat: {motorista.matricula || 'Não informada'}
                    </Text>
                  </View>
                  {/* {motorista.avaliacaoMedia && ( */}
                    <StarRating
                      rating={motorista.avaliacaoMedia}
                      size={16}
                      showValue={true}
                    />
                  {/* )} */}
                </View>
              ) : (
                <View style={styles.noDataContainer}>
                  <Ionicons name="person-outline" size={48} color={COLORS.text.secondary} />
                  <Text style={styles.noDataText}>Informações do motorista não disponíveis</Text>
                </View>
              )}
            </View>
          </View>

          {/* Current Status Section for Passengers in Ongoing Rides */}
          {isCurrentUserPassenger && isInProgress && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Status da Carona</Text>
              <View style={styles.card}>
                <View style={styles.statusInfoCard}>
                  <View style={styles.statusIconContainer}>
                    <Ionicons name="car" size={32} color={COLORS.primary.main} />
                  </View>
                  <View style={styles.statusInfoContent}>
                    <Text style={styles.statusMainText}>Carona em Andamento</Text>
                    <Text style={styles.statusSubText}>
                      Você está participando desta carona. O motorista já iniciou a viagem.
                    </Text>
                  </View>
                </View>
                
                {motorista?.mostrarWhatsapp && motorista?.whatsapp && (
                  <TouchableOpacity 
                    style={styles.whatsappButton}
                    onPress={() => launchWhatsApp(motorista.whatsapp)}
                  >
                    <Ionicons name="logo-whatsapp" size={20} color="#25D366" />
                    <Text style={styles.whatsappButtonText}>Conversar no WhatsApp</Text>
                  </TouchableOpacity>
                )}
              </View>
            </View>
          )}

          {/* Passengers Section */}
          <View style={styles.section}>
            <TouchableOpacity
              style={styles.expandableHeader}
              onPress={() => setIsPassengersExpanded(!isPassengersExpanded)}
            >
              <View style={styles.expandableHeaderContent}>
                <View style={[styles.iconContainer, { backgroundColor: `${COLORS.secondary.main}20` }]}>
                  <Ionicons name="people" size={22} color={COLORS.secondary.main} />
                </View>
                <Text style={styles.expandableTitle}>
                  Passageiros ({passageiros.length})
                </Text>
              </View>
              <Ionicons 
                name={isPassengersExpanded ? "chevron-up" : "chevron-down"} 
                size={20} 
                color="#9E9E9E" 
              />
            </TouchableOpacity>

            {isPassengersExpanded && (
              <View style={styles.passengersContainer}>
                {passageiros.length > 0 ? (
                  passageiros.map(renderPassengerCard)
                ) : (
                  <View style={styles.emptyPassengers}>
                    <Ionicons name="person-outline" size={48} color="#9E9E9E" />
                    <Text style={styles.emptyPassengersText}>Nenhum passageiro ainda</Text>
                  </View>
                )}
              </View>
            )}
          </View>

          {/* Action Button */}
          {isCurrentUserDriver && isScheduled && (
            <View style={styles.section}>
              <TouchableOpacity style={[styles.actionButton, { backgroundColor: COLORS.primary.main }]} onPress={iniciarCarona}>
                <Ionicons name="play-circle-outline" size={24} color="#FFF" />
                <Text style={styles.actionButtonText}>Iniciar Carona</Text>
              </TouchableOpacity>
            </View>
          )}
          
          {isCurrentUserDriver && isInProgress && (
            <View style={styles.section}>
              <TouchableOpacity style={styles.actionButton} onPress={finalizarCarona}>
                <Ionicons name="checkmark-circle-outline" size={24} color="#FFF" />
                <Text style={styles.actionButtonText}>Finalizar Carona</Text>
              </TouchableOpacity>
            </View>
          )}

          <View style={styles.bottomSpacing} />
        </BottomSheetScrollView>
      </BottomSheet>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background.default,
  },
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
  topBarButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
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
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 22,
    marginHorizontal: 12,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  statusInfoBar: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 100 : 90,
    left: 16,
    right: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    zIndex: 5, // Reduced from 9 to ensure it stays below bottom sheet
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 24,
    borderWidth: 0,
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    backdropFilter: 'blur(10px)',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.15,
        shadowRadius: 8,
      },
      android: {
        elevation: 6,
      },
    }),
  },
  statusText: {
    marginLeft: 8,
    fontWeight: '700',
    fontSize: 15,
    letterSpacing: 0.3,
  },
  mapButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  mapButton: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: COLORS.primary.main,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.3)',
    ...Platform.select({
      ios: {
        shadowColor: COLORS.primary.main,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
      },
      android: {
        elevation: 8,
      },
    }),
  },
  locationButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: COLORS.background.card,
    justifyContent: 'center',
    alignItems: 'center',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  loadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  customMarker: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  markerInner: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: 'white',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
    elevation: 5,
  },
  handleIndicator: {
    backgroundColor: COLORS.border.light,
    width: 40,
    height: 4,
  },
  bottomSheetBackground: {
    backgroundColor: COLORS.background.card,
    borderTopLeftRadius: RADIUS.lg,
    borderTopRightRadius: RADIUS.lg,
  },
  bottomSheetContent: {
    flex: 1,
  },
  bottomSheetContentContainer: {
    paddingHorizontal: 16,
    paddingBottom: 32,
  },
  routeInfoHeader: {
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border.light,
    marginBottom: 16,
  },
  routeMetrics: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
  },
  routeMetric: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: `${COLORS.primary.main}10`,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 16,
  },
  routeMetricValue: {
    marginLeft: 6,
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.text.primary,
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.text.primary,
    marginBottom: 12,
  },
  card: {
    backgroundColor: COLORS.background.card,
    borderRadius: RADIUS.md,
    padding: 16,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 3,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 14,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  infoContent: {
    flex: 1,
  },
  infoLabel: {
    fontSize: 13,
    color: COLORS.text.secondary,
    marginBottom: 2,
    fontWeight: '500',
  },
  infoValue: {
    fontSize: 15,
    color: COLORS.text.primary,
    fontWeight: '400',
  },
  divider: {
    height: 1,
    backgroundColor: COLORS.border.light,
    marginVertical: 16,
  },
  vehicleHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  vehicleIcon: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: `${COLORS.primary.main}15`,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  vehicleInfo: {
    flex: 1,
  },
  vehicleModel: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.text.primary,
    marginBottom: 4,
  },
  vehicleDetails: {
    fontSize: 14,
    color: COLORS.text.secondary,
  },
  vehicleCapacity: {
    alignItems: 'center',
    backgroundColor: `${COLORS.primary.main}10`,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
  },
  capacityNumber: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.primary.main,
  },
  capacityLabel: {
    fontSize: 12,
    color: COLORS.text.secondary,
  },
  driverHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  driverAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    marginRight: 12,
  },
  driverInfo: {
    flex: 1,
  },
  driverName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.text.primary,
    marginBottom: 2,
  },
  driverDetails: {
    fontSize: 14,
    color: COLORS.text.secondary,
    marginBottom: 2,
  },
  driverMatricula: {
    fontSize: 12,
    color: COLORS.text.tertiary,
  },
  driverRating: {
    marginTop: 4,
  },
  passengerRating: {
    marginTop: 2,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF8E1',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  rating: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#F57C00',
    marginLeft: 4,
  },
  expandableHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: COLORS.background.card,
    borderRadius: RADIUS.md,
    padding: 16,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  expandableHeaderContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  expandableTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.text.primary,
  },
  passengersContainer: {
    marginTop: 8,
  },
  passengerCard: {
    backgroundColor: COLORS.background.card,
    borderRadius: RADIUS.sm,
    padding: 12,
    marginBottom: 8,
    borderLeftWidth: 3,
    borderLeftColor: COLORS.primary.main,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 1,
      },
      android: {
        elevation: 1,
      },
    }),
  },
  passengerInfo: {
    flex: 1,
  },
  passengerHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  passengerMainInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  passengerDetails: {
    flex: 1,
    marginLeft: 12,
  },
  passengerAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },
  passengerName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.text.primary,
  },
  passengerCourse: {
    fontSize: 14,
    color: COLORS.text.secondary,
    marginBottom: 2,
  },
  passengerMatricula: {
    fontSize: 12,
    color: COLORS.text.tertiary,
  },
  emptyPassengers: {
    alignItems: 'center',
    padding: 32,
    backgroundColor: COLORS.background.card,
    borderRadius: RADIUS.sm,
    marginTop: 8,
  },
  emptyPassengersText: {
    fontSize: 16,
    color: COLORS.text.secondary,
    marginTop: 8,
  },
  noDataContainer: {
    alignItems: 'center',
    padding: 32,
  },
  noDataText: {
    fontSize: 16,
    color: COLORS.text.secondary,
    marginTop: 12,
    textAlign: 'center',
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.primary.main,
    borderRadius: RADIUS.md,
    paddingVertical: 16,
    paddingHorizontal: 24,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 3,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  actionButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 8,
  },
  bottomSpacing: {
    height: 20,
  },
  loadingText: {
    marginTop: 8,
    fontSize: 14,
    color: COLORS.text.secondary,
    textAlign: 'center',
  },
  routeTypeIndicator: {
    marginTop: 12,
    alignItems: 'center',
  },
  routeTypeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12,
  },
  routeTypeText: {
    marginLeft: 4,
    fontSize: 12,
    fontWeight: '600',
  },
  waypointsCount: {
    marginTop: 4,
    fontSize: 11,
    color: COLORS.text.tertiary,
  },
  markerNumber: {
    position: 'absolute',
    top: -8,
    right: -8,
    backgroundColor: COLORS.primary.main,
    borderRadius: 10,
    width: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'white',
  },
  markerNumberText: {
    color: 'white',
    fontSize: 10,
    fontWeight: 'bold',
  },
  statusInfoCard: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  statusIconContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: `${COLORS.primary.main}15`,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  statusInfoContent: {
    flex: 1,
  },
  statusMainText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.text.primary,
    marginBottom: 4,
  },
  statusSubText: {
    fontSize: 14,
    color: COLORS.text.secondary,
    lineHeight: 20,
  },
  whatsappButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#25D366',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    marginTop: 8,
  },
  whatsappButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
});

export default CaronaDetailsScreen;