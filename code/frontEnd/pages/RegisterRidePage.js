import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  TouchableOpacity,
  Text,
  Alert,
  Platform,
  Keyboard,
} from 'react-native';
import MapView, { Marker, Polyline, PROVIDER_GOOGLE } from 'react-native-maps';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { useAuthContext } from '../contexts/AuthContext';
import { apiClient } from '../api/apiClient';
import RideFormBottomSheet from '../components/ride/RideFormBottomSheet';

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

  // Handle selecting departure address from autocomplete
  const handleSelectDepartureAddress = (address) => {
    setDeparture(address.endereco);
    setDepartureLocation({
      latitude: address.latitude,
      longitude: address.longitude
    });
    
    // Dismiss keyboard to hide suggestions
    Keyboard.dismiss();
    
    updateRoutes(
      { latitude: address.latitude, longitude: address.longitude },
      arrivalLocation
    );
  };

  // Handle selecting arrival address from autocomplete
  const handleSelectArrivalAddress = (address) => {
    setArrival(address.endereco);
    setArrivalLocation({
      latitude: address.latitude,
      longitude: address.longitude
    });
    
    // Dismiss keyboard to hide suggestions
    Keyboard.dismiss();
    
    updateRoutes(
      departureLocation,
      { latitude: address.latitude, longitude: address.longitude }
    );
  };

  // Update routes when both locations are set
  const updateRoutes = async (start, end) => {
    if (!start || !end) return;
    
    try {
      setLoading(true);
      const response = await apiClient.get(
        `/maps/trajectories?startLat=${start.latitude}&startLon=${start.longitude}&endLat=${end.latitude}&endLon=${end.longitude}`
      );
      
      if (response.data && response.data.length > 0) {
        setRoutes(response.data);
        setSelectedRoute(response.data[0]);
        setDuration(response.data[0].duracaoSegundos || 0);
        
        // Fit map to route
        fitMapToCoordinates(response.data[0].pontos);
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

  // Handle date changes
  const handleDateChange = (field, date) => {
    if (field === 'departure') {
      setDepartureDate(date);
    }
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
        
        {selectedRoute && (
          <Polyline
            coordinates={selectedRoute.pontos}
            strokeWidth={4}
            strokeColor="#4285F4"
          />
        )}
      </MapView>
      
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
    height: '100%', // This will be dynamically changed
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
  }
});

export default RegisterRidePage;
