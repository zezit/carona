import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Alert,
  Linking,
  TouchableOpacity,
} from 'react-native';
import { useAuthContext } from '../contexts/AuthContext';
import { apiClient } from '../services/api/apiClient';
import { COLORS, SPACING, FONT_SIZE } from '../constants';
import { commonStyles } from '../theme/styles/commonStyles';
import { Ionicons } from '@expo/vector-icons';
import { formatDate, formatTime } from '../utils/dateUtils';

// Import reusable components
import { PageHeader, ActionButton, UserAvatar } from '../components/common';
import { RideInfoItem } from '../components/ride';
import { LoadingIndicator, StatusBadge, ErrorState } from '../components/ui';

const RideDetailsPage = ({ route, navigation }) => {
  const { rideId } = route.params;
  const { user, authToken } = useAuthContext();
  const [ride, setRide] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isJoining, setIsJoining] = useState(false);
  const [isLeaving, setIsLeaving] = useState(false);
  const [isCanceling, setIsCanceling] = useState(false);

  // Function to fetch ride details
  const fetchRideDetails = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await apiClient.get(`/carona/${rideId}`, {
        headers: {
          Authorization: `Bearer ${authToken}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.success) {
        setRide(response.data);
      } else {
        setError(response.message || 'Erro ao carregar detalhes da carona');
      }
    } catch (err) {
      console.error('Error fetching ride details:', err);
      setError('Não foi possível carregar os detalhes da carona. Tente novamente.');
    } finally {
      setLoading(false);
    }
  }, [rideId, authToken]);

  // Fetch ride details on mount
  useEffect(() => {
    fetchRideDetails();
  }, [fetchRideDetails]);

  // Check if current user is the driver
  const isDriver = ride?.motorista?.id === user?.id;

  // Check if current user is a passenger
  const isPassenger = ride?.passageiros?.some(p => p.id === user?.id);

  // Check if there are available seats
  const hasAvailableSeats = 
    ride?.capacidadePassageiros > (ride?.passageiros?.length || 0);

  // Handle joining a ride
  const handleJoinRide = async () => {
    try {
      setIsJoining(true);

      const response = await apiClient.post(`/carona/${rideId}/passageiros/${user.id}`, {}, {
        headers: {
          Authorization: `Bearer ${authToken}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.success) {
        Alert.alert('Sucesso', 'Você entrou na carona com sucesso!');
        fetchRideDetails();
      } else {
        Alert.alert('Erro', response.message || 'Não foi possível entrar na carona');
      }
    } catch (err) {
      console.error('Error joining ride:', err);
      Alert.alert('Erro', 'Não foi possível entrar na carona. Tente novamente.');
    } finally {
      setIsJoining(false);
    }
  };

  // Handle leaving a ride
  const handleLeaveRide = async () => {
    try {
      setIsLeaving(true);

      const response = await apiClient.delete(`/carona/${rideId}/passageiros/${user.id}`, {
        headers: {
          Authorization: `Bearer ${authToken}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.success) {
        Alert.alert('Sucesso', 'Você saiu da carona com sucesso!');
        fetchRideDetails();
      } else {
        Alert.alert('Erro', response.message || 'Não foi possível sair da carona');
      }
    } catch (err) {
      console.error('Error leaving ride:', err);
      Alert.alert('Erro', 'Não foi possível sair da carona. Tente novamente.');
    } finally {
      setIsLeaving(false);
    }
  };

  // Handle canceling a ride (driver only)
  const handleCancelRide = async () => {
    Alert.alert(
      'Cancelar Carona',
      'Tem certeza que deseja cancelar esta carona? Esta ação não pode ser desfeita.',
      [
        { text: 'Não', style: 'cancel' },
        {
          text: 'Sim, Cancelar',
          style: 'destructive',
          onPress: async () => {
            try {
              setIsCanceling(true);

              const response = await apiClient.put(
                `/carona/${rideId}/status`,
                { status: 'CANCELADA' },
                {
                  headers: {
                    Authorization: `Bearer ${authToken}`,
                    'Content-Type': 'application/json',
                  },
                }
              );

              if (response.success) {
                Alert.alert('Sucesso', 'A carona foi cancelada com sucesso!');
                fetchRideDetails();
              } else {
                Alert.alert('Erro', response.message || 'Não foi possível cancelar a carona');
              }
            } catch (err) {
              console.error('Error canceling ride:', err);
              Alert.alert('Erro', 'Não foi possível cancelar a carona. Tente novamente.');
            } finally {
              setIsCanceling(false);
            }
          },
        },
      ]
    );
  };

  // Handle starting a ride (driver only)
  const handleStartRide = async () => {
    try {
      const response = await apiClient.put(
        `/carona/${rideId}/status`,
        { status: 'EM_ANDAMENTO' },
        {
          headers: {
            Authorization: `Bearer ${authToken}`,
            'Content-Type': 'application/json',
          },
        }
      );

      if (response.success) {
        Alert.alert('Sucesso', 'A carona foi iniciada!');
        fetchRideDetails();
      } else {
        Alert.alert('Erro', response.message || 'Não foi possível iniciar a carona');
      }
    } catch (err) {
      console.error('Error starting ride:', err);
      Alert.alert('Erro', 'Não foi possível iniciar a carona. Tente novamente.');
    }
  };

  // Handle finishing a ride (driver only)
  const handleFinishRide = async () => {
    try {
      const response = await apiClient.put(
        `/carona/${rideId}/status`,
        { status: 'FINALIZADA' },
        {
          headers: {
            Authorization: `Bearer ${authToken}`,
            'Content-Type': 'application/json',
          },
        }
      );

      if (response.success) {
        Alert.alert('Sucesso', 'A carona foi finalizada!');
        fetchRideDetails();
      } else {
        Alert.alert('Erro', response.message || 'Não foi possível finalizar a carona');
      }
    } catch (err) {
      console.error('Error finishing ride:', err);
      Alert.alert('Erro', 'Não foi possível finalizar a carona. Tente novamente.');
    }
  };

  // Open WhatsApp
  const openWhatsApp = (phoneNumber) => {
    if (!phoneNumber) {
      Alert.alert('Erro', 'Número de WhatsApp não disponível');
      return;
    }

    const whatsappUrl = `whatsapp://send?phone=${phoneNumber}`;
    Linking.canOpenURL(whatsappUrl)
      .then((supported) => {
        if (supported) {
          return Linking.openURL(whatsappUrl);
        } else {
          Alert.alert('Erro', 'WhatsApp não está instalado no seu dispositivo');
        }
      })
      .catch((err) => {
        console.error('Error opening WhatsApp:', err);
        Alert.alert('Erro', 'Não foi possível abrir o WhatsApp');
      });
  };

  if (loading) {
    return (
      <View style={[commonStyles.container, commonStyles.centered]}>
        <LoadingIndicator text="Carregando detalhes da carona..." />
      </View>
    );
  }

  if (error) {
    return (
      <View style={commonStyles.container}>
        <PageHeader
          title="Detalhes da Carona"
          onBack={() => navigation.goBack()}
        />
        <ErrorState
          errorMessage={error}
          onRetry={fetchRideDetails}
        />
      </View>
    );
  }

  return (
    <View style={commonStyles.container}>
      <PageHeader
        title="Detalhes da Carona"
        onBack={() => navigation.goBack()}
      />

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
      >
        {/* Status Badge */}
        <View style={styles.statusContainer}>
          <StatusBadge status={ride?.status} size="large" />
        </View>

        {/* Origin and Destination */}
        <View style={styles.card}>
          <RideInfoItem
            icon="location"
            label="Origem"
            value={ride?.enderecoPartida?.nome}
            multiline
          />
          
          <View style={styles.divider} />
          
          <RideInfoItem
            icon="navigate"
            label="Destino"
            value={ride?.enderecoDestino?.nome}
            multiline
          />
        </View>

        {/* Date, Time and Passenger Count */}
        <View style={styles.card}>
          <View style={styles.infoRow}>
            <View style={styles.infoCol}>
              <RideInfoItem
                icon="calendar"
                label="Data"
                value={formatDate(ride?.dataHoraPartida)}
              />
            </View>
            
            <View style={styles.infoCol}>
              <RideInfoItem
                icon="time"
                label="Horário"
                value={formatTime(ride?.dataHoraPartida)}
              />
            </View>
          </View>

          <View style={styles.divider} />

          <RideInfoItem
            icon="people"
            label="Passageiros"
            value={`${ride?.passageiros?.length || 0} de ${ride?.capacidadePassageiros}`}
          />
        </View>

        {/* Tarifa and Observations */}
        {(ride?.tarifa > 0 || ride?.observacoes) && (
          <View style={styles.card}>
            {ride?.tarifa > 0 && (
              <RideInfoItem
                icon="cash"
                label="Tarifa"
                value={`R$ ${ride?.tarifa.toFixed(2)}`}
              />
            )}
            
            {ride?.tarifa > 0 && ride?.observacoes && <View style={styles.divider} />}
            
            {ride?.observacoes && (
              <RideInfoItem
                icon="information-circle"
                label="Observações"
                value={ride?.observacoes}
                multiline
              />
            )}
          </View>
        )}

        {/* Driver Information */}
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Motorista</Text>
          
          <View style={styles.driverContainer}>
            <UserAvatar
              uri={ride?.motorista?.photoUrl}
              size={60}
            />
            
            <View style={styles.driverInfo}>
              <Text style={styles.driverName}>{ride?.motorista?.nome}</Text>
              <Text style={styles.driverCourse}>{ride?.motorista?.curso || 'Curso não informado'}</Text>
              
              {ride?.motorista?.whatsapp && ride?.motorista?.mostrarWhatsapp && (
                <TouchableOpacity
                  style={styles.whatsappButton}
                  onPress={() => openWhatsApp(ride?.motorista?.whatsapp)}
                >
                  <Ionicons name="logo-whatsapp" size={16} color="#fff" />
                  <Text style={styles.whatsappButtonText}>WhatsApp</Text>
                </TouchableOpacity>
              )}
            </View>
          </View>
        </View>

        {/* Vehicle Information */}
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Veículo</Text>
          
          <RideInfoItem
            icon="car"
            label="Modelo"
            value={ride?.motorista?.carro?.modelo}
          />
          
          <View style={styles.infoRow}>
            <View style={styles.infoCol}>
              <RideInfoItem
                icon="color-palette"
                label="Cor"
                value={ride?.motorista?.carro?.cor}
              />
            </View>
            
            <View style={styles.infoCol}>
              <RideInfoItem
                icon="clipboard"
                label="Placa"
                value={ride?.motorista?.carro?.placa}
              />
            </View>
          </View>
        </View>

        {/* Passenger List */}
        {(isDriver || isPassenger) && ride?.passageiros?.length > 0 && (
          <View style={styles.card}>
            <Text style={styles.sectionTitle}>Passageiros</Text>
            
            {ride.passageiros.map((passenger) => (
              <View key={passenger.id} style={styles.passengerItem}>
                <UserAvatar
                  uri={passenger.photoUrl}
                  size={40}
                />
                
                <View style={styles.passengerInfo}>
                  <Text style={styles.passengerName}>{passenger.nome}</Text>
                  <Text style={styles.passengerCourse}>{passenger.curso || 'Curso não informado'}</Text>
                </View>
              </View>
            ))}
          </View>
        )}

        {/* Action Buttons */}
        <View style={styles.actionsContainer}>
          {/* Driver's actions */}
          {isDriver && ride?.status === 'AGENDADA' && (
            <>
              <ActionButton
                title="Iniciar Carona"
                onPress={handleStartRide}
                icon="play"
                style={[styles.actionButton, { backgroundColor: COLORS.success }]}
              />
              
              <ActionButton
                title="Cancelar Carona"
                onPress={handleCancelRide}
                icon="close-circle"
                isLoading={isCanceling}
                style={[styles.actionButton, { backgroundColor: COLORS.error }]}
              />
            </>
          )}

          {isDriver && ride?.status === 'EM_ANDAMENTO' && (
            <ActionButton
              title="Finalizar Carona"
              onPress={handleFinishRide}
              icon="checkmark-circle"
              style={[styles.actionButton, { backgroundColor: COLORS.success }]}
            />
          )}

          {/* Passenger's actions */}
          {!isDriver && ride?.status === 'AGENDADA' && !isPassenger && hasAvailableSeats && (
            <ActionButton
              title="Entrar na Carona"
              onPress={handleJoinRide}
              icon="enter"
              isLoading={isJoining}
              style={styles.actionButton}
            />
          )}

          {!isDriver && isPassenger && ride?.status === 'AGENDADA' && (
            <ActionButton
              title="Sair da Carona"
              onPress={handleLeaveRide}
              icon="exit"
              isLoading={isLeaving}
              style={[styles.actionButton, { backgroundColor: COLORS.error }]}
            />
          )}
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  scrollView: {
    flex: 1,
    marginTop: -30,
  },
  contentContainer: {
    padding: SPACING.lg,
    paddingBottom: SPACING.xl * 2,
  },
  statusContainer: {
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  card: {
    ...commonStyles.profileCard,
    marginBottom: SPACING.md,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.md,
  },
  divider: {
    height: 1,
    backgroundColor: '#eee',
    marginVertical: SPACING.sm,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  infoCol: {
    flex: 1,
  },
  sectionTitle: {
    fontSize: FONT_SIZE.md,
    fontWeight: 'bold',
    color: COLORS.text.primary,
    marginBottom: SPACING.sm,
  },
  driverContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: SPACING.xs,
  },
  driverInfo: {
    marginLeft: SPACING.md,
    flex: 1,
  },
  driverName: {
    fontSize: FONT_SIZE.md,
    fontWeight: 'bold',
    color: COLORS.text.primary,
  },
  driverCourse: {
    fontSize: FONT_SIZE.sm,
    color: COLORS.text.secondary,
    marginTop: 2,
  },
  whatsappButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#25D366',
    paddingHorizontal: SPACING.sm,
    paddingVertical: 4,
    borderRadius: 16,
    alignSelf: 'flex-start',
    marginTop: SPACING.xs,
  },
  whatsappButtonText: {
    color: '#fff',
    fontSize: FONT_SIZE.sm,
    fontWeight: '600',
    marginLeft: 4,
  },
  passengerItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: SPACING.xs,
  },
  passengerInfo: {
    marginLeft: SPACING.md,
    flex: 1,
  },
  passengerName: {
    fontSize: FONT_SIZE.md,
    fontWeight: '500',
    color: COLORS.text.primary,
  },
  passengerCourse: {
    fontSize: FONT_SIZE.sm,
    color: COLORS.text.secondary,
  },
  actionsContainer: {
    marginTop: SPACING.md,
  },
  actionButton: {
    marginBottom: SPACING.md,
  },
});

export default RideDetailsPage;