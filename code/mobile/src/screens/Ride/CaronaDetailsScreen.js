import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Linking,
  Dimensions,
  ActivityIndicator,
  Platform,
} from 'react-native';
import MapView, { Marker, Polyline, PROVIDER_GOOGLE } from 'react-native-maps';
import * as Location from 'expo-location';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const { width, height } = Dimensions.get('window');

const CaronaDetailsScreen = ({ route, navigation }) => {
  const { carona } = route.params;
  const [currentLocation, setCurrentLocation] = useState(null);
  const [isLoadingLocation, setIsLoadingLocation] = useState(true);
  const [isPassengersExpanded, setIsPassengersExpanded] = useState(false);
  const [mapRef, setMapRef] = useState(null);
  const insets = useSafeAreaInsets();

  useEffect(() => {
    getCurrentLocation();
  }, []);

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
    if (currentLocation && mapRef) {
      mapRef.animateToRegion(currentLocation, 1000);
    } else {
      getCurrentLocation();
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
          <Text style={styles.passengerName}>{passenger.nome}</Text>
          <View style={styles.ratingContainer}>
            <Ionicons name="star" size={16} color="#FFD700" />
            <Text style={styles.rating}>{passenger.avaliacaoMedia.toFixed(1)}</Text>
          </View>
        </View>
        <Text style={styles.passengerCourse}>{passenger.curso}</Text>
        <Text style={styles.passengerMatricula}>Mat: {passenger.matricula}</Text>
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

  // Coordenadas da trajetória
  const routeCoordinates = carona.trajetorias && carona.trajetorias.length > 0
    ? carona.trajetorias[0].coordenadas.map(coord => ({
        latitude: coord[0],
        longitude: coord[1],
      }))
    : [];

  const status = carona.status;
  const statusText = getStatusText(status);
  const statusColor = getStatusColor(status);
  const isInProgress = status === 'EM_ANDAMENTO';
  const passageiros = carona.passageiros || [];
  const motorista = carona.motorista;
  const carro = motorista.carro;

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color="#000" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Carona em Andamento</Text>
        {motorista.mostrarWhatsapp && (
          <TouchableOpacity onPress={() => launchWhatsApp(motorista.whatsapp)}>
            <Ionicons name="logo-whatsapp" size={24} color="#25D366" />
          </TouchableOpacity>
        )}
      </View>

      {/* Status Bar */}
      <View style={styles.statusBar}>
        <View style={[styles.statusBadge, { borderColor: statusColor, backgroundColor: `${statusColor}20` }]}>
          <Ionicons 
            name={isInProgress ? "car" : "checkmark-circle"} 
            size={18} 
            color={statusColor} 
          />
          <Text style={[styles.statusText, { color: statusColor }]}>{statusText}</Text>
        </View>
        <View style={styles.vagasInfo}>
          <Text style={styles.vagasLabel}>Vagas:</Text>
          <Text style={styles.vagasValue}>
            {carona.vagasDisponiveis}/{carona.vagas}
          </Text>
        </View>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Mapa */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Rota da Carona</Text>
          <View style={styles.mapContainer}>
            <MapView
              ref={setMapRef}
              style={styles.map}
              provider={PROVIDER_GOOGLE}
              initialRegion={currentLocation || {
                latitude: origem.latitude,
                longitude: origem.longitude,
                latitudeDelta: 0.01,
                longitudeDelta: 0.01,
              }}
              showsUserLocation={true}
              showsMyLocationButton={false}
            >
              {/* Marcador de origem */}
              <Marker coordinate={origem} title="Partida">
                <Ionicons name="location" size={32} color="#4CAF50" />
              </Marker>

              {/* Marcador de destino */}
              <Marker coordinate={destino} title="Destino">
                <Ionicons name="flag" size={32} color="#F44336" />
              </Marker>

              {/* Rota */}
              {routeCoordinates.length > 0 && (
                <Polyline
                  coordinates={routeCoordinates}
                  strokeColor="#2196F3"
                  strokeWidth={4}
                />
              )}
            </MapView>

            {/* Loading overlay */}
            {isLoadingLocation && (
              <View style={styles.loadingOverlay}>
                <ActivityIndicator size="large" color="#2196F3" />
              </View>
            )}

            {/* Location button */}
            <TouchableOpacity
              style={styles.locationButton}
              onPressed={centerMapOnCurrentLocation}
            >
              <Ionicons name="locate" size={20} color="#2196F3" />
            </TouchableOpacity>
          </View>
        </View>

        {/* Informações da Carona */}
        <View style={styles.section}>
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Informações da Carona</Text>
            
            {renderInfoRow('location', 'Partida', carona.pontoPartida, '#4CAF50')}
            {renderInfoRow('flag', 'Destino', carona.pontoDestino, '#F44336')}
            
            <View style={styles.divider} />
            
            {renderInfoRow('time', 'Partida', getFormattedDateTime(carona.dataHoraPartida), '#2196F3')}
            {renderInfoRow('time-outline', 'Chegada', getFormattedDateTime(carona.dataHoraChegada), '#FF9800')}
            
            <View style={styles.infoRowDouble}>
              <View style={styles.halfWidth}>
                {renderInfoRow('resize', 'Distância', `${carona.distanciaEstimadaKm} km`, '#9C27B0')}
              </View>
              <View style={styles.halfWidth}>
                {renderInfoRow('timer', 'Tempo', getFormattedTime(carona.tempoEstimadoSegundos), '#009688')}
              </View>
            </View>

            {carona.observacoes && (
              <>
                <View style={styles.divider} />
                {renderInfoRow('chatbubble', 'Observações', carona.observacoes, '#9E9E9E')}
              </>
            )}
          </View>
        </View>

        {/* Informações do Veículo */}
        <View style={styles.section}>
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Veículo</Text>
            {renderInfoRow('car', 'Modelo', carro.modelo, '#2196F3')}
            {renderInfoRow('document-text', 'Placa', carro.placa, '#9E9E9E')}
            {renderInfoRow('color-palette', 'Cor', carro.cor, '#9E9E9E')}
            {renderInfoRow('people', 'Capacidade', `${carro.capacidadePassageiros} passageiros`, '#FF9800')}
          </View>
        </View>

        {/* Lista de Passageiros */}
        <View style={styles.section}>
          <TouchableOpacity
            style={styles.expandableHeader}
            onPress={() => setIsPassengersExpanded(!isPassengersExpanded)}
          >
            <View style={styles.expandableHeaderContent}>
              <View style={[styles.iconContainer, { backgroundColor: '#E91E6320' }]}>
                <Ionicons name="people" size={22} color="#E91E63" />
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

        {/* Botão Finalizar Carona */}
        {isInProgress && (
          <View style={styles.section}>
            <TouchableOpacity style={styles.finishButton} onPress={finalizarCarona}>
              <Ionicons name="checkmark-circle-outline" size={24} color="#FFF" />
              <Text style={styles.finishButtonText}>Finalizar Carona</Text>
            </TouchableOpacity>
          </View>
        )}

        <View style={styles.bottomSpacing} />
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FAFAFA',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#FFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#000',
  },
  statusBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#F5F5F5',
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
  },
  statusText: {
    marginLeft: 6,
    fontWeight: 'bold',
    fontSize: 14,
  },
  vagasInfo: {
    alignItems: 'flex-end',
  },
  vagasLabel: {
    fontSize: 12,
    color: '#666',
  },
  vagasValue: {
    fontSize: 14,
    fontWeight: '500',
    color: '#000',
  },
  content: {
    flex: 1,
  },
  section: {
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#000',
    marginBottom: 8,
  },
  mapContainer: {
    height: 220,
    borderRadius: 12,
    overflow: 'hidden',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  map: {
    flex: 1,
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
  locationButton: {
    position: 'absolute',
    right: 16,
    bottom: 16,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#FFF',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.22,
    shadowRadius: 2.22,
  },
  card: {
    backgroundColor: '#FFF',
    borderRadius: 12,
    padding: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.22,
    shadowRadius: 2.22,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#000',
    marginBottom: 16,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  infoRowDouble: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  halfWidth: {
    flex: 1,
    paddingRight: 8,
  },
  iconContainer: {
    width: 38,
    height: 38,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  infoContent: {
    flex: 1,
  },
  infoLabel: {
    fontSize: 12,
    color: '#666',
    marginBottom: 4,
  },
  infoValue: {
    fontSize: 14,
    color: '#000',
  },
  divider: {
    height: 1,
    backgroundColor: '#E0E0E0',
    marginVertical: 16,
  },
  expandableHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#FFF',
    borderRadius: 12,
    padding: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.22,
    shadowRadius: 2.22,
  },
  expandableHeaderContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  expandableTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: '#000',
  },
  passengersContainer: {
    marginTop: 8,
  },
  passengerCard: {
    backgroundColor: '#FFF',
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.18,
    shadowRadius: 1.00,
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
  passengerName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#000',
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  rating: {
    fontSize: 14,
    fontWeight: '500',
    color: '#666',
    marginLeft: 4,
  },
  passengerCourse: {
    fontSize: 14,
    color: '#666',
    marginBottom: 2,
  },
  passengerMatricula: {
    fontSize: 12,
    color: '#999',
  },
  emptyPassengers: {
    alignItems: 'center',
    padding: 32,
    backgroundColor: '#FFF',
    borderRadius: 8,
    marginTop: 8,
  },
  emptyPassengersText: {
    fontSize: 16,
    color: '#9E9E9E',
    marginTop: 8,
  },
  finishButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#4CAF50',
    borderRadius: 12,
    padding: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.22,
    shadowRadius: 2.22,
  },
  finishButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 8,
  },
  bottomSpacing: {
    height: 32,
  },
});

export default CaronaDetailsScreen;