import React, { useEffect, useState, useRef } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  FlatList,
  ActivityIndicator,
  Alert,
  Dimensions,
  Keyboard,
  Linking,
  Modal,
  Animated,
} from 'react-native';
import MapView, { Marker, Polyline, PROVIDER_GOOGLE } from 'react-native-maps';
import * as Location from 'expo-location';
import { useAuthContext } from '../contexts/AuthContext';
import { apiClient } from '../api/apiClient';
import { BlurView } from 'expo-blur';

const { width, height } = Dimensions.get('window');
const CARD_WIDTH = width * 0.8;
const SPACING_FOR_CARD_INSET = width * 0.1 - 10;

const RequestRidePage = ({ navigation }) => {
  const { user, authToken } = useAuthContext();
  const [loading, setLoading] = useState(false);
  const [region, setRegion] = useState(null);
  const [departure, setDeparture] = useState('');
  const [arrival, setArrival] = useState('');
  const [departureCoords, setDepartureCoords] = useState(null);
  const [arrivalCoords, setArrivalCoords] = useState(null);
  const [searchResults, setSearchResults] = useState([]);
  const [showResults, setShowResults] = useState(false);
  const [activeInput, setActiveInput] = useState(null);
  const [availableRides, setAvailableRides] = useState([]);
  const [selectedRide, setSelectedRide] = useState(null);
  const [showRideModal, setShowRideModal] = useState(false);

  const mapRef = useRef(null);
  const _scrollView = useRef(null);
  let mapIndex = useRef(0);
  const _maps = useRef([]);

  // Animation related
  const scrollX = useRef(new Animated.Value(0)).current;
  const modalAnimation = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    getCurrentLocation();
  }, []);

  useEffect(() => {
    // Listen for card animations to update the map
    scrollX.addListener(({ value }) => {
      const index = Math.floor(value / CARD_WIDTH + 0.3);
      if (index >= 0 && index < availableRides.length) {
        clearTimeout(regionTimeout);
        
        const regionTimeout = setTimeout(() => {
          if (mapIndex.current !== index) {
            mapIndex.current = index;
            const { latitudePartida, longitudePartida } = availableRides[index];
            mapRef.current.animateToRegion(
              {
                latitude: latitudePartida,
                longitude: longitudePartida,
                latitudeDelta: 0.015,
                longitudeDelta: 0.015,
              },
              350
            );
          }
        }, 10);
      }
    });

    return () => scrollX.removeAllListeners();
  }, [availableRides]);

  const getCurrentLocation = async () => {
    try {
      setLoading(true);
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Erro', 'Permissão de localização necessária');
        setLoading(false);
        return;
      }

      const location = await Location.getCurrentPositionAsync({});
      const { latitude, longitude } = location.coords;

      setRegion({
        latitude,
        longitude,
        latitudeDelta: 0.015,
        longitudeDelta: 0.015,
      });

      // Try to get address from coordinates for better UX
      try {
        const addresses = await Location.reverseGeocodeAsync({ latitude, longitude });
        if (addresses && addresses.length > 0) {
          const address = addresses[0];
          const formattedAddress = `${address.street || ''} ${address.name || ''}, ${address.district || ''}, ${address.city || ''}`;
          setDeparture(formattedAddress.trim());
          setDepartureCoords({ latitude, longitude });
        }
      } catch (error) {
        console.error("Error getting address:", error);
      }
      
      setLoading(false);
    } catch (error) {
      console.error("Error getting location:", error);
      Alert.alert('Erro', 'Não foi possível obter sua localização');
      setLoading(false);
    }
  };

  const searchAddress = async (text, isDeparture) => {
    if (text.length < 3) {
      setSearchResults([]);
      setShowResults(false);
      return;
    }

    try {
      const response = await apiClient.get('/maps/geocode', {
        headers: {
          Authorization: `Bearer ${authToken}`,
          'Content-Type': 'application/json',
        },
        params: { address: text },
      });

      if (response.success && response.data) {
        setSearchResults(response.data);
        setShowResults(true);
      } else {
        setSearchResults([]);
        setShowResults(false);
      }
    } catch (error) {
      console.error("Error searching for address:", error);
      setSearchResults([]);
      setShowResults(false);
    }
  };

  const selectLocation = (location, isDeparture) => {
    if (isDeparture) {
      setDeparture(location.address || location.name || '');
      setDepartureCoords({
        latitude: location.latitude,
        longitude: location.longitude
      });
    } else {
      setArrival(location.address || location.name || '');
      setArrivalCoords({
        latitude: location.latitude,
        longitude: location.longitude
      });
    }
    setShowResults(false);
    Keyboard.dismiss();
    
    // Animate map to selected location
    if (mapRef.current) {
      mapRef.current.animateToRegion({
        latitude: location.latitude,
        longitude: location.longitude,
        latitudeDelta: 0.015,
        longitudeDelta: 0.015,
      }, 500);
    }

    // If we have both locations, search for rides
    if ((isDeparture && arrivalCoords) || (!isDeparture && departureCoords)) {
      const depCoords = isDeparture ? location : departureCoords;
      const arrCoords = isDeparture ? arrivalCoords : location;
      searchAvailableRides(depCoords, arrCoords);
    }
  };

  const searchAvailableRides = async (depCoords, arrCoords) => {
    if (!depCoords || !arrCoords) return;

    try {
      setLoading(true);
      // Here we would call the backend to get actual rides based on the coordinates
      // For now, let's use the general carona endpoint
      const response = await apiClient.get('/carona', {
        headers: {
          Authorization: `Bearer ${authToken}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.success && response.data.content) {
        // In a real app, you'd filter rides based on the requested route
        // Here we'll just use all available rides for demonstration
        setAvailableRides(response.data.content);
      } else {
        setAvailableRides([]);
        Alert.alert('Aviso', 'Nenhuma carona encontrada para este trajeto');
      }
    } catch (error) {
      console.error("Error searching for rides:", error);
      Alert.alert('Erro', 'Não foi possível buscar caronas');
    } finally {
      setLoading(false);
    }
  };

  const viewRideDetails = (ride) => {
    setSelectedRide(ride);
    
    // Animated open modal
    setShowRideModal(true);
    Animated.timing(modalAnimation, {
      toValue: 1,
      duration: 300,
      useNativeDriver: true,
    }).start();
  };

  const closeRideModal = () => {
    // Animated close modal
    Animated.timing(modalAnimation, {
      toValue: 0,
      duration: 200,
      useNativeDriver: true,
    }).start(() => {
      setShowRideModal(false);
      setSelectedRide(null);
    });
  };

  const openInWaze = () => {
    if (!selectedRide) return;
    
    const { latitudePartida, longitudePartida } = selectedRide;
    const wazeUrl = `waze://?ll=${latitudePartida},${longitudePartida}&navigate=yes`;
    
    Linking.canOpenURL(wazeUrl).then(supported => {
      if (supported) {
        return Linking.openURL(wazeUrl);
      } else {
        // If Waze is not installed, open in browser to prompt app store download
        const browserWazeUrl = `https://waze.com/ul?ll=${latitudePartida},${longitudePartida}&navigate=yes`;
        Linking.openURL(browserWazeUrl);
      }
    });
  };

  const requestRide = async (ride) => {
    try {
      setLoading(true);
      const response = await apiClient.post(`/carona/${ride.id}/passageiro/${user.id}`, {}, {
        headers: {
          Authorization: `Bearer ${authToken}`,
        },
      });

      if (response.success) {
        Alert.alert('Sucesso', 'Solicitação de carona enviada com sucesso!', [
          { text: 'OK', onPress: () => navigation.goBack() }
        ]);
      } else {
        Alert.alert('Erro', response.error.message || 'Erro ao solicitar carona');
      }
    } catch (error) {
      Alert.alert('Erro', 'Erro ao solicitar carona. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  const renderSearchResults = () => {
    if (!showResults || searchResults.length === 0) return null;
    
    return (
      <View style={styles.searchResultsContainer}>
        <FlatList
          data={searchResults}
          keyExtractor={(item, index) => `search-${index}`}
          renderItem={({ item }) => (
            <TouchableOpacity 
              style={styles.searchResultItem}
              onPress={() => selectLocation(item, activeInput === 'departure')}
            >
              <Ionicons name="location" size={20} color="#4285F4" />
              <Text style={styles.searchResultText}>{item.address || item.name}</Text>
            </TouchableOpacity>
          )}
        />
      </View>
    );
  };

  const renderRideCards = () => {
    return (
      <Animated.FlatList 
        ref={_scrollView}
        data={availableRides}
        keyExtractor={item => `ride-${item.id}`}
        horizontal
        pagingEnabled
        scrollEventThrottle={1}
        showsHorizontalScrollIndicator={false}
        snapToInterval={CARD_WIDTH + 20}
        snapToAlignment="center"
        contentContainerStyle={{
          paddingHorizontal: SPACING_FOR_CARD_INSET
        }}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { x: scrollX } } }],
          { useNativeDriver: true }
        )}
        style={styles.scrollView}
        renderItem={({ item, index }) => (
          <TouchableOpacity 
            style={styles.card}
            onPress={() => viewRideDetails(item)}
            activeOpacity={0.9}
          >
            <View style={styles.cardHeader}>
              <Text style={styles.cardTitle}>
                {new Date(item.dataHoraPartida).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
              </Text>
              <Text style={styles.cardPrice}>
                {item.vagasDisponiveis} vagas
              </Text>
            </View>
            
            <View style={styles.cardRoute}>
              <View style={styles.routePoint}>
                <Ionicons name="radio-button-on" size={16} color="#4285F4" />
                <Text numberOfLines={1} style={styles.routeText}>{item.pontoPartida}</Text>
              </View>
              <View style={styles.routeDivider}>
                <Ionicons name="ellipsis-vertical" size={16} color="#ccc" />
              </View>
              <View style={styles.routePoint}>
                <Ionicons name="location" size={16} color="#34A853" />
                <Text numberOfLines={1} style={styles.routeText}>{item.pontoDestino}</Text>
              </View>
            </View>
            
            <View style={styles.cardDriver}>
              <View style={styles.driverInfo}>
                <Ionicons name="person-circle" size={24} color="#4285F4" />
                <Text style={styles.driverName}>{item.motorista?.nome || "Motorista"}</Text>
              </View>
              <Text style={styles.cardDistance}>{item.distanciaEstimadaKm.toFixed(1)}km</Text>
            </View>
            
            <TouchableOpacity 
              style={styles.requestButton}
              onPress={() => requestRide(item)}
            >
              <Text style={styles.requestButtonText}>Solicitar</Text>
            </TouchableOpacity>
          </TouchableOpacity>
        )}
      />
    );
  };

  const renderRideDetailsModal = () => {
    if (!selectedRide) return null;
    
    const modalTranslateY = modalAnimation.interpolate({
      inputRange: [0, 1],
      outputRange: [height, 0],
    });
    
    return (
      <Modal
        visible={showRideModal}
        transparent={true}
        animationType="none"
      >
        <BlurView style={styles.modalBackground} intensity={90} tint="dark">
          <Animated.View 
            style={[
              styles.modalContainer,
              { transform: [{ translateY: modalTranslateY }] }
            ]}
          >
            <View style={styles.modalHeader}>
              <TouchableOpacity onPress={closeRideModal} style={styles.closeButton}>
                <Ionicons name="close" size={24} color="#333" />
              </TouchableOpacity>
              <Text style={styles.modalTitle}>Detalhes da Carona</Text>
            </View>
            
            <View style={styles.rideDetailsContainer}>
              <View style={styles.rideDetailItem}>
                <Ionicons name="calendar" size={20} color="#4285F4" />
                <Text style={styles.rideDetailText}>
                  {new Date(selectedRide.dataHoraPartida).toLocaleDateString()}
                </Text>
              </View>
              
              <View style={styles.rideDetailItem}>
                <Ionicons name="time" size={20} color="#4285F4" />
                <Text style={styles.rideDetailText}>
                  Partida: {new Date(selectedRide.dataHoraPartida).toLocaleTimeString()}
                </Text>
              </View>
              
              <View style={styles.rideDetailItem}>
                <Ionicons name="time" size={20} color="#34A853" />
                <Text style={styles.rideDetailText}>
                  Chegada: {new Date(selectedRide.dataHoraChegada).toLocaleTimeString()}
                </Text>
              </View>
              
              <View style={styles.rideDetailItem}>
                <Ionicons name="car" size={20} color="#4285F4" />
                <Text style={styles.rideDetailText}>
                  {selectedRide.motorista.carro?.modelo} - {selectedRide.motorista.carro?.cor}
                </Text>
              </View>
              
              <View style={styles.rideDetailItem}>
                <Ionicons name="people" size={20} color="#4285F4" />
                <Text style={styles.rideDetailText}>
                  {selectedRide.vagasDisponiveis} vagas disponíveis
                </Text>
              </View>
              
              {selectedRide.observacoes && (
                <View style={styles.rideDetailItem}>
                  <Ionicons name="information-circle" size={20} color="#4285F4" />
                  <Text style={styles.rideDetailText}>{selectedRide.observacoes}</Text>
                </View>
              )}
            </View>
            
            <View style={styles.modalActions}>
              <TouchableOpacity style={styles.wazeButton} onPress={openInWaze}>
                <Ionicons name="navigate" size={20} color="#4285F4" />
                <Text style={styles.wazeButtonText}>Abrir no Waze</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={styles.confirmRequestButton}
                onPress={() => {
                  closeRideModal();
                  requestRide(selectedRide);
                }}
              >
                <Text style={styles.confirmRequestButtonText}>Solicitar carona</Text>
              </TouchableOpacity>
            </View>
          </Animated.View>
        </BlurView>
      </Modal>
    );
  };

  if (loading && !region) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#4285F4" />
        <Text style={styles.loadingText}>Obtendo sua localização...</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Buscar Carona</Text>
        <View style={styles.placeholderButton} />
      </View>

      <View style={styles.searchContainer}>
        <View style={styles.searchBox}>
          <View style={styles.routeIcon}>
            <View style={styles.originDot} />
            <View style={styles.routeLine} />
            <View style={styles.destinationDot} />
          </View>
          
          <View style={styles.inputs}>
            <View style={styles.inputWrapper}>
              <TextInput
                style={styles.input}
                placeholder="Origem"
                value={departure}
                onChangeText={(text) => {
                  setDeparture(text);
                  searchAddress(text, true);
                }}
                onFocus={() => setActiveInput('departure')}
              />
            </View>
            
            <View style={styles.divider} />
            
            <View style={styles.inputWrapper}>
              <TextInput
                style={styles.input}
                placeholder="Destino"
                value={arrival}
                onChangeText={(text) => {
                  setArrival(text);
                  searchAddress(text, false);
                }}
                onFocus={() => setActiveInput('arrival')}
              />
            </View>
          </View>
        </View>

        {renderSearchResults()}
      </View>

      {region && (
        <View style={styles.mapContainer}>
          <MapView
            ref={mapRef}
            provider={PROVIDER_GOOGLE}
            style={styles.map}
            initialRegion={region}
            showsUserLocation={true}
            showsMyLocationButton={true}
            showsCompass={true}
            loadingEnabled={true}
          >
            {departureCoords && (
              <Marker
                coordinate={departureCoords}
                title="Origem"
                pinColor="#4285F4"
              />
            )}
            
            {arrivalCoords && (
              <Marker
                coordinate={arrivalCoords}
                title="Destino"
                pinColor="#34A853"
              />
            )}
            
            {availableRides.map((ride, index) => (
              <Marker
                key={`marker-${ride.id}`}
                ref={ref => _maps.current[index] = ref}
                coordinate={{
                  latitude: ride.latitudePartida,
                  longitude: ride.longitudePartida
                }}
                title={`Carona #${ride.id}`}
                description={ride.pontoPartida}
              >
                <View style={styles.markerWrap}>
                  <View style={styles.marker}>
                    <Ionicons name="car" size={15} color="#fff" />
                  </View>
                </View>
              </Marker>
            ))}
          </MapView>
        </View>
      )}

      {availableRides.length > 0 && renderRideCards()}

      {renderRideDetailsModal()}

      {loading && (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="large" color="#4285F4" />
        </View>
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#4285F4',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 15,
    paddingHorizontal: 20,
    backgroundColor: '#4285F4',
  },
  backButton: {
    padding: 5,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
  },
  placeholderButton: {
    width: 34,
  },
  searchContainer: {
    position: 'absolute',
    top: 70,
    left: 20,
    right: 20,
    zIndex: 5,
  },
  searchBox: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  routeIcon: {
    width: 20,
    alignItems: 'center',
    marginRight: 10,
    paddingTop: 8,
  },
  originDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#4285F4',
  },
  routeLine: {
    width: 1,
    height: 30,
    backgroundColor: '#ccc',
    marginVertical: 5,
  },
  destinationDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#34A853',
  },
  inputs: {
    flex: 1,
  },
  inputWrapper: {
    height: 40,
    justifyContent: 'center',
  },
  input: {
    fontSize: 16,
    color: '#333',
  },
  divider: {
    height: 1,
    backgroundColor: '#eee',
    marginVertical: 5,
  },
  searchResultsContainer: {
    backgroundColor: '#fff',
    borderBottomLeftRadius: 8,
    borderBottomRightRadius: 8,
    marginTop: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    maxHeight: 200,
  },
  searchResultItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  searchResultText: {
    marginLeft: 10,
    fontSize: 16,
    color: '#333',
  },
  mapContainer: {
    flex: 1,
    backgroundColor: '#eceff1',
  },
  map: {
    ...StyleSheet.absoluteFillObject,
  },
  scrollView: {
    position: 'absolute',
    bottom: 20,
    left: 0,
    right: 0,
    paddingVertical: 10,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    marginHorizontal: 10,
    width: CARD_WIDTH,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    padding: 15,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  cardPrice: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#4285F4',
  },
  cardRoute: {
    marginBottom: 15,
  },
  routePoint: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 3,
  },
  routeDivider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 7,
    height: 16,
  },
  routeText: {
    marginLeft: 8,
    fontSize: 14,
    color: '#555',
    flex: 1,
  },
  cardDriver: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },
  driverInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  driverName: {
    marginLeft: 8,
    fontSize: 14,
    color: '#333',
  },
  cardDistance: {
    fontSize: 14,
    color: '#666',
  },
  requestButton: {
    backgroundColor: '#4285F4',
    borderRadius: 8,
    paddingVertical: 10,
    alignItems: 'center',
  },
  requestButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(255,255,255,0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
  },
  markerWrap: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  marker: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: '#4285F4',
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalBackground: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  modalContainer: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingTop: 20,
    paddingHorizontal: 20,
    paddingBottom: 30,
    maxHeight: height * 0.7,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  closeButton: {
    padding: 5,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginLeft: 15,
  },
  rideDetailsContainer: {
    marginBottom: 20,
  },
  rideDetailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  rideDetailText: {
    marginLeft: 10,
    fontSize: 16,
    color: '#333',
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  wazeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f0f6ff',
    paddingVertical: 12,
    paddingHorizontal: 15,
    borderRadius: 8,
    width: '40%',
  },
  wazeButtonText: {
    marginLeft: 8,
    color: '#4285F4',
    fontSize: 14,
    fontWeight: '600',
  },
  confirmRequestButton: {
    backgroundColor: '#4285F4',
    paddingVertical: 12,
    paddingHorizontal: 15,
    borderRadius: 8,
    width: '55%',
    alignItems: 'center',
  },
  confirmRequestButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default RequestRidePage;