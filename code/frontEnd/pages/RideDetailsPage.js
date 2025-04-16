import React, { useEffect, useState } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Alert,
  Linking,
  Modal,
} from 'react-native';
import MapView, { Marker, Polyline, PROVIDER_GOOGLE } from 'react-native-maps';
import { useAuthContext } from '../contexts/AuthContext';
import { apiClient } from '../api/apiClient';
import { BlurView } from 'expo-blur';

const RideDetailsPage = ({ route, navigation }) => {
  const { rideId } = route.params;
  const { user, authToken } = useAuthContext();
  const [loading, setLoading] = useState(true);
  const [ride, setRide] = useState(null);
  const [isDriver, setIsDriver] = useState(false);
  const [isPassenger, setIsPassenger] = useState(false);
  const [showNavigationModal, setShowNavigationModal] = useState(false);

  useEffect(() => {
    fetchRideDetails();
  }, [rideId]);

  const fetchRideDetails = async () => {
    try {
      const response = await apiClient.get(`/carona/${rideId}`, {
        headers: {
          Authorization: `Bearer ${authToken}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.success) {
        setRide(response.data);
        setIsDriver(response.data.motorista.id === user.id);
        setIsPassenger(response.data.passageiros.some(p => p.id === user.id));
      }
    } catch (error) {
      Alert.alert('Erro', 'Não foi possível carregar os detalhes da carona');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (newStatus) => {
    try {
      setLoading(true);
      const response = await apiClient.patch(
        `/carona/${rideId}/status/${newStatus}`,
        {},
        {
          headers: {
            Authorization: `Bearer ${authToken}`,
            'Content-Type': 'application/json',
          },
        }
      );

      if (response.success) {
        await fetchRideDetails();
        Alert.alert('Sucesso', 'Status da carona atualizado com sucesso!');
      }
    } catch (error) {
      Alert.alert('Erro', 'Não foi possível atualizar o status da carona');
    } finally {
      setLoading(false);
    }
  };

  const handleCancelRide = async () => {
    Alert.alert(
      'Cancelar Carona',
      'Tem certeza que deseja cancelar esta carona?',
      [
        { text: 'Não', style: 'cancel' },
        {
          text: 'Sim',
          style: 'destructive',
          onPress: async () => {
            try {
              setLoading(true);
              await apiClient.delete(`/carona/${rideId}`, {
                headers: {
                  Authorization: `Bearer ${authToken}`,
                  'Content-Type': 'application/json',
                },
              });
              Alert.alert('Sucesso', 'Carona cancelada com sucesso!', [
                { text: 'OK', onPress: () => navigation.goBack() }
              ]);
            } catch (error) {
              Alert.alert('Erro', 'Não foi possível cancelar a carona');
            } finally {
              setLoading(false);
            }
          },
        },
      ]
    );
  };

  const handleNavigationOptions = () => {
    setShowNavigationModal(true);
  };

  const openInWaze = () => {
    setShowNavigationModal(false);
    
    if (!ride) return;
    
    const { latitudePartida, longitudePartida } = ride;
    const wazeUrl = `waze://?ll=${latitudePartida},${longitudePartida}&navigate=yes`;
    
    Linking.canOpenURL(wazeUrl).then(supported => {
      if (supported) {
        return Linking.openURL(wazeUrl);
      } else {
        const browserWazeUrl = `https://waze.com/ul?ll=${latitudePartida},${longitudePartida}&navigate=yes`;
        Linking.openURL(browserWazeUrl);
      }
    });
  };

  const openInGoogleMaps = () => {
    setShowNavigationModal(false);
    
    if (!ride) return;
    
    const { latitudePartida, longitudePartida } = ride;
    const googleMapsUrl = `https://www.google.com/maps/dir/?api=1&destination=${latitudePartida},${longitudePartida}&travelmode=driving`;
    
    Linking.openURL(googleMapsUrl);
  };

  const handleWhatsAppPress = () => {
    if (ride?.motorista?.whatsapp && ride?.motorista?.mostrarWhatsapp) {
      const whatsappUrl = `whatsapp://send?phone=${ride.motorista.whatsapp}`;
      Linking.canOpenURL(whatsappUrl).then(supported => {
        if (supported) {
          return Linking.openURL(whatsappUrl);
        }
        Alert.alert('Erro', 'WhatsApp não está instalado no dispositivo');
      });
    }
  };

  const handleJoinRide = async () => {
    try {
      setLoading(true);
      Alert.alert('Solicitar Carona', 'Solicitação enviada com sucesso!');
      setIsPassenger(true);
      setLoading(false);
    } catch (error) {
      Alert.alert('Erro', 'Não foi possível solicitar a carona');
      setLoading(false);
    }
  };

  const handleLeaveRide = async () => {
    try {
      setLoading(true);
      Alert.alert('Deixar Carona', 'Você saiu da carona com sucesso!');
      setIsPassenger(false);
      setLoading(false);
    } catch (error) {
      Alert.alert('Erro', 'Não foi possível sair da carona');
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#4285F4" />
      </SafeAreaView>
    );
  }

  if (!ride) {
    return (
      <SafeAreaView style={styles.errorContainer}>
        <Text style={styles.errorText}>Carona não encontrada</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Detalhes da Carona</Text>
        <TouchableOpacity style={styles.navigationButton} onPress={handleNavigationOptions}>
          <Ionicons name="navigate" size={24} color="#fff" />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content}>
        {ride.trajetoriaPrincipal && (
          <View style={styles.mapContainer}>
            <MapView
              style={styles.map}
              provider={PROVIDER_GOOGLE}
              initialRegion={{
                latitude: ride.latitudePartida,
                longitude: ride.longitudePartida,
                latitudeDelta: 0.02,
                longitudeDelta: 0.02,
              }}
            >
              <Marker
                coordinate={{
                  latitude: ride.latitudePartida,
                  longitude: ride.longitudePartida,
                }}
                title="Partida"
                pinColor="#4285F4"
              />
              <Marker
                coordinate={{
                  latitude: ride.latitudeDestino,
                  longitude: ride.longitudeDestino,
                }}
                title="Chegada"
                pinColor="#34A853"
              />
              <Polyline
                coordinates={ride.trajetoriaPrincipal.coordenadas.map(([lat, lon]) => ({
                  latitude: lat,
                  longitude: lon,
                }))}
                strokeWidth={4}
                strokeColor="#4285F4"
              />
            </MapView>
          </View>
        )}

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Status</Text>
          <View style={styles.statusBadge}>
            <Text style={styles.statusText}>{ride.status}</Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Motorista</Text>
          <View style={styles.driverInfo}>
            <View style={styles.driverProfile}>
              <Ionicons name="person-circle" size={40} color="#4285F4" />
              <View style={styles.driverDetails}>
                <Text style={styles.driverName}>{ride.motorista.nome}</Text>
                {ride.motorista.avaliacaoMedia && (
                  <View style={styles.ratingContainer}>
                    <Ionicons name="star" size={16} color="#FBBC04" />
                    <Text style={styles.ratingText}>{ride.motorista.avaliacaoMedia.toFixed(1)}</Text>
                  </View>
                )}
              </View>
            </View>
            {ride.motorista.mostrarWhatsapp && (
              <TouchableOpacity
                style={styles.whatsappButton}
                onPress={handleWhatsAppPress}
              >
                <Ionicons name="logo-whatsapp" size={20} color="#25D366" />
                <Text style={styles.whatsappText}>WhatsApp</Text>
              </TouchableOpacity>
            )}
          </View>
          
          {ride.motorista.carro && (
            <View style={styles.carInfo}>
              <View style={styles.carDetails}>
                <Ionicons name="car" size={18} color="#666" />
                <Text style={styles.carText}>
                  {ride.motorista.carro.modelo} - {ride.motorista.carro.cor}
                </Text>
              </View>
              <Text style={styles.licensePlate}>{ride.motorista.carro.placa}</Text>
            </View>
          )}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Trajeto</Text>
          <View style={styles.routeInfo}>
            <View style={styles.routePoint}>
              <Ionicons name="location" size={20} color="#4285F4" />
              <Text style={styles.routeText}>{ride.pontoPartida}</Text>
            </View>
            <View style={styles.routeDivider} />
            <View style={styles.routePoint}>
              <Ionicons name="location" size={20} color="#34A853" />
              <Text style={styles.routeText}>{ride.pontoDestino}</Text>
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Horários</Text>
          <View style={styles.timeInfo}>
            <Text style={styles.timeText}>
              Partida: {new Date(ride.dataHoraPartida).toLocaleString()}
            </Text>
            <Text style={styles.timeText}>
              Chegada: {new Date(ride.dataHoraChegada).toLocaleString()}
            </Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Informações</Text>
          <View style={styles.infoGrid}>
            <View style={styles.infoItem}>
              <Ionicons name="people" size={20} color="#666" />
              <Text style={styles.infoText}>{ride.vagasDisponiveis} vagas disponíveis</Text>
            </View>
            <View style={styles.infoItem}>
              <Ionicons name="speedometer" size={20} color="#666" />
              <Text style={styles.infoText}>{ride.distanciaEstimadaKm.toFixed(1)} km</Text>
            </View>
            <View style={styles.infoItem}>
              <Ionicons name="time" size={20} color="#666" />
              <Text style={styles.infoText}>
                {Math.round(ride.tempoEstimadoSegundos / 60)} min
              </Text>
            </View>
          </View>
        </View>

        {ride.observacoes && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Observações</Text>
            <Text style={styles.observationsText}>{ride.observacoes}</Text>
          </View>
        )}

        {isDriver && ride.status === 'AGENDADA' && (
          <View style={styles.actionButtons}>
            <TouchableOpacity
              style={[styles.actionButton, styles.startButton]}
              onPress={() => handleStatusChange('EM_ANDAMENTO')}
            >
              <Ionicons name="play" size={20} color="#fff" />
              <Text style={styles.actionButtonText}>Iniciar Carona</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.actionButton, styles.cancelButton]}
              onPress={handleCancelRide}
            >
              <Ionicons name="close" size={20} color="#fff" />
              <Text style={styles.actionButtonText}>Cancelar Carona</Text>
            </TouchableOpacity>
          </View>
        )}

        {isDriver && ride.status === 'EM_ANDAMENTO' && (
          <TouchableOpacity
            style={[styles.actionButton, styles.finishButton]}
            onPress={() => handleStatusChange('FINALIZADA')}
          >
            <Ionicons name="checkmark" size={20} color="#fff" />
            <Text style={styles.actionButtonText}>Finalizar Carona</Text>
          </TouchableOpacity>
        )}

        {!isDriver && !isPassenger && ride.status === 'AGENDADA' && ride.vagasDisponiveis > 0 && (
          <TouchableOpacity
            style={[styles.actionButton, styles.joinButton]}
            onPress={handleJoinRide}
          >
            <Ionicons name="person-add" size={20} color="#fff" />
            <Text style={styles.actionButtonText}>Solicitar Carona</Text>
          </TouchableOpacity>
        )}

        {!isDriver && isPassenger && ride.status !== 'FINALIZADA' && ride.status !== 'CANCELADA' && (
          <TouchableOpacity
            style={[styles.actionButton, styles.leaveButton]}
            onPress={handleLeaveRide}
          >
            <Ionicons name="exit" size={20} color="#fff" />
            <Text style={styles.actionButtonText}>Sair da Carona</Text>
          </TouchableOpacity>
        )}
      </ScrollView>

      <Modal
        visible={showNavigationModal}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowNavigationModal(false)}
      >
        <BlurView style={styles.modalBackground} intensity={90} tint="dark">
          <View style={styles.navigationModal}>
            <Text style={styles.navigationModalTitle}>Navegar até o ponto de partida</Text>
            
            <TouchableOpacity style={styles.navigationOption} onPress={openInWaze}>
              <Ionicons name="navigate-circle" size={30} color="#33CCFF" />
              <Text style={styles.navigationOptionText}>Abrir no Waze</Text>
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.navigationOption} onPress={openInGoogleMaps}>
              <Ionicons name="map" size={30} color="#4285F4" />
              <Text style={styles.navigationOptionText}>Abrir no Google Maps</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.closeModalButton} 
              onPress={() => setShowNavigationModal(false)}
            >
              <Text style={styles.closeModalButtonText}>Cancelar</Text>
            </TouchableOpacity>
          </View>
        </BlurView>
      </Modal>
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
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    fontSize: 16,
    color: '#666',
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
  navigationButton: {
    padding: 5,
  },
  content: {
    flex: 1,
  },
  mapContainer: {
    height: 200,
    margin: 20,
    borderRadius: 12,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  map: {
    flex: 1,
  },
  section: {
    backgroundColor: '#fff',
    marginHorizontal: 20,
    marginBottom: 20,
    padding: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 12,
  },
  statusBadge: {
    backgroundColor: '#E8F0FE',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    alignSelf: 'flex-start',
  },
  statusText: {
    color: '#4285F4',
    fontWeight: '600',
  },
  driverInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  driverProfile: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  driverDetails: {
    marginLeft: 10,
  },
  driverName: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  ratingText: {
    marginLeft: 4,
    color: '#666',
  },
  whatsappButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E6F7EF',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  whatsappText: {
    color: '#25D366',
    marginLeft: 4,
    fontWeight: '600',
  },
  carInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  carDetails: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  carText: {
    marginLeft: 8,
    fontSize: 14,
    color: '#666',
  },
  licensePlate: {
    fontSize: 14,
    fontWeight: '500',
    color: '#666',
    backgroundColor: '#f0f0f0',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  routeInfo: {
    marginBottom: 8,
  },
  routePoint: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  routeDivider: {
    height: 20,
    width: 2,
    backgroundColor: '#eee',
    marginLeft: 9,
    marginVertical: 4,
  },
  routeText: {
    fontSize: 16,
    marginLeft: 8,
    flex: 1,
  },
  timeInfo: {
    marginBottom: 8,
  },
  timeText: {
    fontSize: 16,
    color: '#333',
    marginBottom: 4,
  },
  infoGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -8,
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '50%',
    paddingHorizontal: 8,
    marginBottom: 8,
  },
  infoText: {
    marginLeft: 8,
    fontSize: 16,
    color: '#333',
  },
  observationsText: {
    fontSize: 16,
    color: '#666',
    lineHeight: 24,
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginHorizontal: 20,
    marginBottom: 20,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
    borderRadius: 8,
    flex: 1,
    marginHorizontal: 6,
  },
  startButton: {
    backgroundColor: '#34A853',
  },
  cancelButton: {
    backgroundColor: '#EA4335',
  },
  finishButton: {
    backgroundColor: '#34A853',
    marginHorizontal: 20,
    marginBottom: 20,
  },
  joinButton: {
    backgroundColor: '#4285F4',
    marginHorizontal: 20,
    marginBottom: 20,
  },
  leaveButton: {
    backgroundColor: '#EA4335',
    marginHorizontal: 20,
    marginBottom: 20,
  },
  actionButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  modalBackground: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  navigationModal: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    width: '80%',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 5,
    elevation: 5,
  },
  navigationModalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 20,
    textAlign: 'center',
  },
  navigationOption: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    marginVertical: 5,
    width: '100%',
    borderWidth: 1,
    borderColor: '#eee',
    borderRadius: 8,
  },
  navigationOptionText: {
    marginLeft: 15,
    fontSize: 16,
    color: '#333',
  },
  closeModalButton: {
    marginTop: 20,
    paddingVertical: 12,
    paddingHorizontal: 20,
  },
  closeModalButtonText: {
    color: '#4285F4',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default RideDetailsPage;