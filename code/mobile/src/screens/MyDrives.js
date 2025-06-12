import React, { useCallback, useEffect, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  RefreshControl,
  Alert,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation } from '@react-navigation/native';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Ionicons } from '@expo/vector-icons';
import { apiClient, getDriverRides } from '../services/api/apiClient';
import { useAuthContext } from '../contexts/AuthContext';
import { COLORS, FONT_SIZE, FONT_WEIGHT, SPACING } from '../constants';
import { commonStyles } from '../theme/styles/commonStyles';
import { LoadingIndicator } from '../components/ui';


export default function MyDrivesScreen() {
  const navigation = useNavigation();
  const { user, authToken } = useAuthContext();
  const [drives, setDrives] = useState([]);
  const [passengerRides, setPassengerRides] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [isDriver, setIsDriver] = useState(false);
  const [driverDetails, setDriverDetails] = useState(null);
  const [viewMode, setViewMode] = useState('passenger'); // 'passenger' or 'driver'

  useEffect(() => {
    checkDriverStatus();
  }, [checkDriverStatus]);

  useEffect(() => {
    // Always fetch passenger rides
    fetchPassengerRides();
    
    // If user is driver and viewing driver mode, fetch driver rides
    if (isDriver && driverDetails && viewMode === 'driver') {
      fetchDrives();
    } else if (!loading) {
      setLoading(false);
    }
  }, [isDriver, driverDetails, viewMode]);

  // Check if user is a driver
  const checkDriverStatus = useCallback(async () => {
    if (!user?.id || !authToken) {
      console.log('Cannot check driver status: missing user ID or auth token', { userId: user?.id, hasToken: !!authToken });
      setIsDriver(false);
      setDriverDetails(null);
      setLoading(false);
      return;
    }
    
    try {
      console.log('Checking driver status for user:', user.id);
      const response = await apiClient.get(`/estudante/${user.id}/motorista`, {
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.success && response.data) {
        setIsDriver(true);
        setDriverDetails(response.data);
        console.log('User is a driver:', response.data);
      } else {
        setIsDriver(false);
        setDriverDetails(null);
      }
    } catch (error) {
      // 404 error means user is not a driver, which is expected
      if (error.status === 404 || error.body?.codigo === 'comum.cliente.entidade_nao_encontrada') {
        console.log('User is not a driver (404 response)');
        setIsDriver(false);
        setDriverDetails(null);
      } else {
        console.error('Error checking driver status:', error);
        Alert.alert('Erro', 'Não foi possível verificar se você é motorista.');
        setIsDriver(false);
        setDriverDetails(null);
      }
    } finally {
      setLoading(false);
    }
  }, [user?.id, authToken]);

  const fetchDrives = async () => {
    if (!driverDetails?.id || !authToken) {
      console.error('Driver details or auth token missing');
      setLoading(false);
      setRefreshing(false);
      return;
    }

    try {
      const response = await getDriverRides(driverDetails.id, authToken, {
        page: 0,
        size: 10,
        sort: []
      });
      
      if (response.success && response.data) {
        setDrives(response.data.content || []);
      } else {
        console.warn('Failed to fetch drives:', response.error);
        setDrives([]);
      }
    } catch (error) {
      console.error('Erro ao buscar caronas:', error);
      Alert.alert('Erro', 'Não foi possível carregar suas caronas.');
      setDrives([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const fetchPassengerRides = useCallback(async () => {
    if (!user?.id || !authToken) {
      console.log('Cannot fetch passenger rides: missing user ID or auth token', { userId: user?.id, hasToken: !!authToken });
      setPassengerRides([]);
      setLoading(false);
      setRefreshing(false);
      return;
    }

    try {
      setLoading(true);
      const response = await apiClient.get(`/carona/estudante/${user.id}/historico`, {
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Accept': '*/*',
          'Content-Type': 'application/json'
        }
      });

      if (response.success && response.data) {
        console.debug('Passenger rides response:', JSON.stringify(response.data, null, 2));
        setPassengerRides(response.data);
      } else {
        console.warn('Failed to fetch passenger rides:', response.error);
        setPassengerRides([]);
      }
    } catch (error) {
      console.error('Error fetching passenger rides:', error);
      setPassengerRides([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [user?.id, authToken]);

  if (loading && !refreshing) {
    return (
      <SafeAreaView style={commonStyles.container}>
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <LoadingIndicator text="Carregando suas caronas..." />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={commonStyles.container}>
      <LinearGradient
        colors={[COLORS.primary.main, COLORS.primary.dark]}
        start={{ x: 0, y: 0 }}
        end={{ x: 0, y: 0.5 }}
        style={{ height: 150, paddingTop: SPACING.lg }}
      >
        <View style={{ paddingHorizontal: SPACING.lg, flexDirection: 'row', alignItems: 'center' }}>
          <Ionicons 
            name="arrow-back" 
            size={24} 
            color={COLORS.text.light} 
            style={{ marginRight: SPACING.md }} 
            onPress={() => navigation.goBack()}
          />
          <Text style={{ fontSize: 28, fontWeight: 'bold', color: COLORS.text.light }}>
            Minhas Caronas
          </Text>
        </View>
      </LinearGradient>

      <ScrollView
        style={{ flex: 1, marginTop: -50 }}
        contentContainerStyle={{ paddingBottom: 40 }}
        showsVerticalScrollIndicator={false}          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={() => {
                setRefreshing(true);
                if (viewMode === 'driver' && isDriver && driverDetails) {
                  fetchDrives();
                } else {
                  fetchPassengerRides();
                }
              }}
              colors={[COLORS.primary.main]}
              tintColor={COLORS.primary.main}
            />
          }
      >
        {/* Header Card */}
        <View style={[commonStyles.profileCard, {
          marginHorizontal: SPACING.lg,
          paddingVertical: SPACING.lg,
          marginBottom: SPACING.lg,
          alignItems: 'center'
        }]}>
          <Text style={styles.title}>
            {viewMode === 'passenger' ? 'Suas Caronas como Passageiro' : 'Suas Caronas como Motorista'}
          </Text>
          <Text style={styles.subtitle}>
            {viewMode === 'passenger' 
              ? (passengerRides.length > 0 
                  ? `Você participou de ${passengerRides.length} carona(s)` 
                  : 'Você ainda não participou de nenhuma carona')
              : (drives.length > 0 
                  ? `Você criou ${drives.filter(d => d.status === 'AGENDADA').length} carona(s) agendada(s)` 
                  : 'Você ainda não criou nenhuma carona')
            }
          </Text>
          
          {/* Toggle buttons for switching between passenger and driver views */}
          {isDriver && (
            <View style={styles.toggleContainer}>
              <TouchableOpacity
                style={[
                  styles.toggleButton,
                  viewMode === 'passenger' && styles.toggleButtonActive
                ]}
                onPress={() => setViewMode('passenger')}
              >
                <Ionicons 
                  name="person-outline" 
                  size={16} 
                  color={viewMode === 'passenger' ? COLORS.text.light : COLORS.text.secondary} 
                />
                <Text style={[
                  styles.toggleButtonText,
                  viewMode === 'passenger' && styles.toggleButtonTextActive
                ]}>
                  Como Passageiro
                </Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={[
                  styles.toggleButton,
                  viewMode === 'driver' && styles.toggleButtonActive
                ]}
                onPress={() => setViewMode('driver')}
              >
                <Ionicons 
                  name="car-outline" 
                  size={16} 
                  color={viewMode === 'driver' ? COLORS.text.light : COLORS.text.secondary} 
                />
                <Text style={[
                  styles.toggleButtonText,
                  viewMode === 'driver' && styles.toggleButtonTextActive
                ]}>
                  Como Motorista
                </Text>
              </TouchableOpacity>
            </View>
          )}
        </View>

        <View style={{ paddingHorizontal: SPACING.lg }}>
          {/* Render content based on view mode */}
          {viewMode === 'passenger' ? (
            passengerRides.length === 0 ? (
              <View style={styles.emptyContainer}>
                <Ionicons name="car-outline" size={48} color={COLORS.text.secondary} />
                <Text style={styles.emptyText}>
                  Você ainda não participou de nenhuma carona.
                </Text>
                <TouchableOpacity
                  style={[styles.button, { marginTop: SPACING.md }]}
                  onPress={() => navigation.navigate('FindRides')}
                >
                  <Text style={styles.buttonText}>Buscar Caronas</Text>
                </TouchableOpacity>
              </View>
            ) : (
              passengerRides.map((ride) => (
                <TouchableOpacity
                  key={ride.id}
                  style={styles.driveCard}
                  onPress={() => navigation.navigate('RideDetails', { ride })}
                >
                  <View style={styles.cardHeader}>
                    <View style={[styles.statusBadge, { 
                      backgroundColor: ride.status === 'AGENDADA' ? COLORS.success.main : 
                                     ride.status === 'FINALIZADA' ? COLORS.primary.main :
                                     COLORS.text.secondary 
                    }]}>
                      <Text style={styles.statusText}>
                        {ride.status === 'AGENDADA' ? 'Agendada' : 
                         ride.status === 'FINALIZADA' ? 'Finalizada' : 
                         ride.status}
                      </Text>
                    </View>
                    <Text style={styles.dateText}>
                      {format(new Date(ride.dataHoraPartida), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}
                    </Text>
                  </View>
                  
                  <View style={styles.routeContainer}>
                    <View style={styles.locationRow}>
                      <Ionicons name="location" size={20} color={COLORS.primary.main} />
                      <Text style={styles.locationText}>
                        {ride.pontoOrigem || ride.pontoPartida || 'Origem não especificada'}
                      </Text>
                    </View>
                    <View style={styles.verticalLine} />
                    <View style={styles.locationRow}>
                      <Ionicons name="location" size={20} color={COLORS.secondary.main} />
                      <Text style={styles.locationText}>
                        {ride.pontoDestino || 'Destino não especificado'}
                      </Text>
                    </View>
                  </View>
                  
                  <View style={styles.driveInfo}>
                    <View style={styles.infoRow}>
                      <Ionicons name="person-outline" size={16} color={COLORS.text.secondary} />
                      <Text style={styles.infoText}>
                        Motorista: {ride.motorista?.nome || 'Nome não disponível'}
                      </Text>
                    </View>
                    <View style={styles.infoRow}>
                      <Ionicons name="car-outline" size={16} color={COLORS.text.secondary} />
                      <Text style={styles.infoText}>
                        {ride.veiculo?.modelo || 'Veículo não especificado'}
                      </Text>
                    </View>
                  </View>
                </TouchableOpacity>
              ))
            )
          ) : (
            /* Driver view mode */
            drives.length === 0 ? (
              <View style={styles.emptyContainer}>
                <Ionicons name="car-outline" size={48} color={COLORS.text.secondary} />
                <Text style={styles.emptyText}>
                  Você ainda não criou nenhuma carona.
                </Text>
                <TouchableOpacity
                  style={[styles.button, { marginTop: SPACING.md }]}
                  onPress={() => navigation.navigate('CreateRide')}
                >
                  <Text style={styles.buttonText}>Criar Carona</Text>
                </TouchableOpacity>
              </View>
            ) : (
              drives.map((drive) => (
                <TouchableOpacity
                  key={drive.id}
                  style={styles.driveCard}
                  onPress={() => navigation.navigate('DriveDetails', { drive })}
                >
                  <View style={styles.cardHeader}>
                    <View style={[styles.statusBadge, { 
                      backgroundColor: drive.status === 'AGENDADA' ? COLORS.success.main : 
                                     drive.status === 'FINALIZADA' ? COLORS.primary.main :
                                     COLORS.text.secondary 
                    }]}>
                      <Text style={styles.statusText}>
                        {drive.status === 'AGENDADA' ? 'Agendada' : 
                         drive.status === 'FINALIZADA' ? 'Finalizada' : 
                         drive.status}
                      </Text>
                    </View>
                    <Text style={styles.dateText}>
                      {format(new Date(drive.dataHoraPartida), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}
                    </Text>
                  </View>
                  
                  <View style={styles.routeContainer}>
                    <View style={styles.locationRow}>
                      <Ionicons name="location" size={20} color={COLORS.primary.main} />
                      <Text style={styles.locationText}>
                        {drive.pontoOrigem || drive.pontoPartida || 'Origem não especificada'}
                      </Text>
                    </View>
                    <View style={styles.verticalLine} />
                    <View style={styles.locationRow}>
                      <Ionicons name="location" size={20} color={COLORS.secondary.main} />
                      <Text style={styles.locationText}>
                        {drive.pontoDestino || 'Destino não especificado'}
                      </Text>
                    </View>
                  </View>
                  
                  <View style={styles.driveInfo}>
                    <View style={styles.infoRow}>
                      <Ionicons name="people-outline" size={16} color={COLORS.text.secondary} />
                      <Text style={styles.infoText}>
                        {drive.vagasDisponiveis}/{drive.vagas} vagas disponíveis
                      </Text>
                    </View>
                    <View style={styles.infoRow}>
                      <Ionicons name="car-outline" size={16} color={COLORS.text.secondary} />
                      <Text style={styles.infoText}>
                        {drive.veiculo?.modelo || 'Veículo não especificado'}
                      </Text>
                    </View>
                  </View>
                </TouchableOpacity>
              ))
            )
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  title: {
    fontSize: FONT_SIZE.xl,
    fontWeight: FONT_WEIGHT.bold,
    color: COLORS.text.primary,
    marginBottom: SPACING.xs,
  },
  subtitle: {
    fontSize: FONT_SIZE.md,
    color: COLORS.text.secondary,
    textAlign: 'center',
  },
  toggleContainer: {
    flexDirection: 'row',
    marginTop: SPACING.md,
    backgroundColor: COLORS.background.main.light,
    borderRadius: 8,
    padding: SPACING.xs,
  },
  toggleButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.md,
    borderRadius: 6,
  },
  toggleButtonActive: {
    backgroundColor: COLORS.primary.main,
  },
  toggleButtonText: {
    fontSize: FONT_SIZE.sm,
    color: COLORS.text.secondary,
    marginLeft: SPACING.xs,
    fontWeight: FONT_WEIGHT.medium,
  },
  toggleButtonTextActive: {
    color: COLORS.text.light,
  },
  driveCard: {
    backgroundColor: COLORS.background.main,
    borderRadius: 12,
    padding: SPACING.md,
    marginBottom: SPACING.md,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  statusBadge: {
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs / 2,
    borderRadius: 12,
  },
  statusText: {
    color: COLORS.text.light,
    fontSize: FONT_SIZE.xs,
    fontWeight: FONT_WEIGHT.medium,
  },
  dateText: {
    fontSize: FONT_SIZE.sm,
    color: COLORS.text.secondary,
  },
  routeContainer: {
    marginVertical: SPACING.sm,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: SPACING.xs / 2,
  },
  locationText: {
    marginLeft: SPACING.sm,
    fontSize: FONT_SIZE.md,
    color: COLORS.text.primary,
    flex: 1,
  },
  verticalLine: {
    width: 1,
    height: 20,
    backgroundColor: COLORS.border.main,
    marginLeft: 10,
    marginVertical: 2,
  },
  driveInfo: {
    marginTop: SPACING.sm,
    paddingTop: SPACING.sm,
    borderTopWidth: 1,
    borderTopColor: COLORS.border.main,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.xs,
  },
  infoText: {
    marginLeft: SPACING.sm,
    fontSize: FONT_SIZE.sm,
    color: COLORS.text.secondary,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: SPACING.xl,
    backgroundColor: COLORS.background.main.light,
    borderRadius: 12,
  },
  emptyText: {
    fontSize: FONT_SIZE.md,
    color: COLORS.text.secondary,
    textAlign: 'center',
    marginTop: SPACING.md,
    marginBottom: SPACING.md,
  },
  button: {
    backgroundColor: COLORS.primary.main,
    borderRadius: 8,
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.md,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
  },
  buttonText: {
    color: COLORS.text.light,
    fontSize: FONT_SIZE.md,
    fontWeight: FONT_WEIGHT.medium,
    textAlign: 'center',
  },
  notDriverText: {
    fontSize: FONT_SIZE.lg,
    fontWeight: FONT_WEIGHT.bold,
    color: COLORS.text.primary,
    textAlign: 'center',
    marginTop: SPACING.md,
  },
  notDriverSubtext: {
    fontSize: FONT_SIZE.md,
    color: COLORS.text.secondary,
    textAlign: 'center',
    marginTop: SPACING.sm,
    lineHeight: 20,
  },
});
