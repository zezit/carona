import { Ionicons } from '@expo/vector-icons';
import React, { useCallback, useEffect, useState } from 'react';
import { Image, ScrollView, StyleSheet, Text, TouchableOpacity, View, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import { useAuthContext } from '../contexts/AuthContext';
import { COLORS, SPACING, FONT_SIZE } from '../constants';
import { LinearGradient } from 'expo-linear-gradient';
import { apiClient, getUpcomingRides, getActiveDriverRides, getActivePassengerRides } from '../services/api/apiClient';
import { LoadingIndicator } from '../components/ui';

const HomePage = ({ navigation }) => {
  const { user, logoutUser, authToken } = useAuthContext();
  const [nextRide, setNextRide] = useState(null);
  const [isDriver, setIsDriver] = useState(false);
  const [driverDetails, setDriverDetails] = useState(null);
  const [loading, setLoading] = useState(true);

  // Função auxiliar para debug de timezone
  const debugTimeZone = () => {
    const now = new Date();
    console.log('=== TIMEZONE DEBUG ===');
    console.log('Device timezone:', Intl.DateTimeFormat().resolvedOptions().timeZone);
    console.log('Device timezone offset (minutes):', now.getTimezoneOffset());
    console.log('Current time ISO:', now.toISOString());
    console.log('Current time local string:', now.toLocaleString('pt-BR'));
    console.log('Current time timestamp:', now.getTime());
    console.log('======================');
  };

  // Check if user is a driver and get driver details
  const checkDriverStatus = useCallback(async () => {
    if (!user?.id || !authToken) {
      console.log('Cannot check driver status: missing user ID or auth token', { userId: user?.id, hasToken: !!authToken });
      setIsDriver(false);
      setDriverDetails(null);
      setNextRide(null);
      setLoading(false);
      return;
    }

    try {
      const response = await apiClient.get(`/estudante/${user.id}/motorista`, {
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.success && response.data) {
        setIsDriver(true);
        setDriverDetails(response.data);
        // If user is a driver, fetch upcoming rides
        await fetchUpcomingRides(response.data.id);
      } else {
        setIsDriver(false);
        setDriverDetails(null);
        // If user is not a driver, check for passenger active rides
        await fetchActivePassengerRides(user.id);
      }
    } catch (error) {
      console.error('Error checking driver status:', error);
      setIsDriver(false);
      setDriverDetails(null);
      // Even if driver check fails, still check for passenger active rides
      await fetchActivePassengerRides(user.id);
    } finally {
      setLoading(false);
    }
  }, [user?.id, authToken, fetchActivePassengerRides, fetchUpcomingRides]);  // Fetch upcoming rides and find the next one (prioritizing ongoing rides)
  const fetchUpcomingRides = useCallback(async (driverId) => {
    try {
      // Fetch both active ongoing rides and scheduled rides
      const [activeRidesResponse, scheduledRidesResponse] = await Promise.all([
        getActiveDriverRides(driverId, authToken),
        getUpcomingRides(driverId, authToken)
      ]);
      
      let allRides = [];
      
      // Add active rides first (highest priority)
      if (activeRidesResponse.success && activeRidesResponse.data && activeRidesResponse.data.length > 0) {
        console.log('Active rides found:', activeRidesResponse.data.length);
        allRides = [...activeRidesResponse.data];
      }
      
      // Add scheduled rides second (lower priority)
      if (scheduledRidesResponse.success && scheduledRidesResponse.data && scheduledRidesResponse.data.length > 0) {
        console.log('Scheduled rides found:', scheduledRidesResponse.data.length);
        
        // Filter scheduled rides to only include AGENDADA status (as before)
        const scheduledRides = scheduledRidesResponse.data.filter(ride => {
          console.log(`Ride ${ride.id}:`);
          console.log(`  - Original time string: ${ride.dataHoraPartida}`);
          console.log(`  - Status: ${ride.status}`);
          
          const isScheduled = ride.status === 'AGENDADA';
          
          console.log(`  - Is scheduled: ${isScheduled}`);
          console.log(`  - Will include: ${isScheduled}`);
          console.log('---');
          
          return isScheduled;
        });
        
        allRides = [...allRides, ...scheduledRides];
      }

      console.log('Total rides found (active + scheduled):', allRides.length);

      if (allRides.length > 0) {
        // Sort by priority: EM_ANDAMENTO first, then AGENDADA by departure time
        const sortedRides = allRides.sort((a, b) => {
          // If one is EM_ANDAMENTO and the other is not, prioritize EM_ANDAMENTO
          if (a.status === 'EM_ANDAMENTO' && b.status !== 'EM_ANDAMENTO') {
            return -1;
          }
          if (b.status === 'EM_ANDAMENTO' && a.status !== 'EM_ANDAMENTO') {
            return 1;
          }
          
          // If both have the same status, sort by departure time
          const timeA = new Date(a.dataHoraPartida);
          const timeB = new Date(b.dataHoraPartida);
          return timeA - timeB;
        });

        const nextRide = sortedRides[0];
        console.log('Selected next ride:', nextRide.id, nextRide.status, nextRide.dataHoraPartida);
        setNextRide(nextRide);
      } else {
        console.log('No active or scheduled rides found');
        setNextRide(null);
      }
    } catch (error) {
      console.error('Error fetching upcoming rides:', error);
      setNextRide(null);
    }
  }, [authToken]);

  // Fetch active rides for passengers
  const fetchActivePassengerRides = useCallback(async (estudanteId) => {
    try {
      console.log('Checking for active passenger rides for student ID:', estudanteId);
      
      const activeRidesResponse = await getActivePassengerRides(estudanteId, authToken);
      
      if (activeRidesResponse.success && activeRidesResponse.data && activeRidesResponse.data.length > 0) {
        console.log('Active passenger rides found:', activeRidesResponse.data.length);
        
        // Sort by departure time and take the first one
        const sortedRides = activeRidesResponse.data.sort((a, b) => {
          const timeA = new Date(a.dataHoraPartida);
          const timeB = new Date(b.dataHoraPartida);
          return timeA - timeB;
        });

        const nextRide = sortedRides[0];
        console.log('Selected next passenger ride:', nextRide.id, nextRide.status, nextRide.dataHoraPartida);
        setNextRide(nextRide);
      } else {
        console.log('No active passenger rides found');
        setNextRide(null);
      }
    } catch (error) {
      console.error('Error fetching active passenger rides:', error);
      setNextRide(null);
    }
  }, [authToken]);

  // Initial load
  useEffect(() => {
    debugTimeZone(); // Chame esta função uma vez para debug
    if (user?.id && authToken) {
      checkDriverStatus();
    }
  }, [checkDriverStatus, user?.id, authToken]);

  // Refresh when screen comes into focus
  useFocusEffect(
    useCallback(() => {
      if (user?.id && authToken) {
        checkDriverStatus();
      }
    }, [checkDriverStatus, user?.id, authToken])
  );

  // Handle logout with confirmation
  const handleLogout = () => {
    Alert.alert(
      'Confirmar Logout',
      'Tem certeza que deseja sair?',
      [
        { text: 'Cancelar', style: 'cancel' },
        { text: 'Sim, Sair', style: 'destructive', onPress: logoutUser }
      ]
    );
  };

  // Handle start ride
  // Inicia a carona fazendo uma requisição PATCH para o backend e navega para a tela de detalhes da carona
  // const handleStartRide = async (caronaId) => {
  //   try {
  //     const response = await apiClient.patch(`/carona/${caronaId}/iniciar`);
  //     if (response.status === 200) {
  //       navigation.navigate('CaronaDetailsScreen', {
  //         carona: response.data, // garanta que a API retorna os campos `origem`, `destino`, `status`, `dataInicio`
  //       });
  //     }
  //   } catch (err) {
  //     Alert.alert('Erro', 'Não foi possível iniciar a carona.');
  //   }
  // };

  // Visualiza os detalhes da carona usando os dados já disponíveis da carona
  const handleViewRideDetails = (carona) => {
    navigation.navigate('CaronaDetailsScreen', {
      carona, // envia os dados já disponíveis da carona para a próxima tela
    });
  };

  // Format ride time
  const formatRideTime = (rideDateTime) => {
    // Garante que a data é parseada corretamente
    let rideTime;
    if (typeof rideDateTime === 'string') {
      rideTime = new Date(rideDateTime);
      // Se parece que há problema de timezone, tenta interpretar como local
      if (isNaN(rideTime.getTime())) {
        const dateStr = rideDateTime.replace(/[+-]\d{2}:?\d{2}$|Z$/, '');
        rideTime = new Date(dateStr);
      }
    } else {
      rideTime = new Date(rideDateTime);
    }
    
    return rideTime.toLocaleTimeString('pt-BR', { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  // Calculate minutes until ride
  const getMinutesUntilRide = (rideDateTime) => {
    const now = new Date();
    
    // Mesmo parsing que usado na função principal
    let rideTime;
    if (typeof rideDateTime === 'string') {
      rideTime = new Date(rideDateTime);
      if (isNaN(rideTime.getTime())) {
        const dateStr = rideDateTime.replace(/[+-]\d{2}:?\d{2}$|Z$/, '');
        rideTime = new Date(dateStr);
      }
    } else {
      rideTime = new Date(rideDateTime);
    }
    
    const diffMinutes = Math.round((rideTime.getTime() - now.getTime()) / (1000 * 60));
    return diffMinutes;
  };

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient
        colors={[COLORS.primary.main, COLORS.primary.dark]}
        start={{ x: 0, y: 0 }}
        end={{ x: 0, y: 1 }}
        style={styles.header}
      >
        <View style={styles.userInfo}>
          <View>
            <Text style={styles.welcomeText}>Bem-vindo(a){user?.name ? ',' : ''}</Text>
            {user?.name && (
              <Text style={styles.userName}>{user?.name}</Text>
            )}
          </View>

          <View style={styles.headerButtons}>
            <TouchableOpacity
              style={styles.logoutButton}
              onPress={handleLogout}
              hitSlop={{ top: 10, right: 10, bottom: 10, left: 10 }}
            >
              <Ionicons name="log-out-outline" size={24} color="#fff" />
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.profileButton}
              onPress={() => navigation.navigate('Profile')}
            >
              {user?.photoUrl ? (
                <Image
                  source={{ uri: user?.photoUrl }}
                  style={styles.userImage}
                />
              ) : (
                <Ionicons name="person-circle-outline" size={32} color="#fff" />
              )}
            </TouchableOpacity>
          </View>
        </View>
      </LinearGradient>

      <ScrollView
        style={styles.content}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.quickActions}>
          <Text style={styles.sectionTitle}>Ações Rápidas</Text>

          <View style={styles.actionButtonsContainer}>
            <TouchableOpacity
              style={styles.actionButton}
              onPress={() => navigation.navigate('Rides')}
            >
              <View style={[styles.actionIconContainer, { backgroundColor: `${COLORS.primary.main}20` }]}>
                <Ionicons name="car" size={28} color={COLORS.primary.main} />
              </View>
              <Text style={styles.actionButtonText}>Caronas</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.actionButton}
              onPress={() => navigation.navigate('Profile')}
            >
              <View style={[styles.actionIconContainer, { backgroundColor: `${COLORS.secondary.main}20` }]}>
                <Ionicons name="person" size={28} color={COLORS.secondary.main} />
              </View>
              <Text testID="start-page" style={styles.actionButtonText}>Perfil
                
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Loading state */}
        {loading && (
          <View style={styles.loadingCard}>
            <LoadingIndicator size="small" text="Verificando próximas caronas..." />
          </View>
        )}

        {/* Next ride card - show for both drivers and passengers when they have active rides */}
        {!loading && nextRide && (
          <View style={styles.rideCard}>
            <View style={styles.rideHeader}>
              <Ionicons name="time" size={20} color={COLORS.primary.main} />
              <Text style={styles.rideTitle}>
                {nextRide.status === 'EM_ANDAMENTO' 
                  ? (isDriver ? 'Carona em Andamento' : 'Carona Ativa')
                  : (isDriver ? 'Próxima Carona' : 'Sua Carona')
                }
              </Text>
            </View>
            
            {/* Status indicator */}
            <View style={[styles.statusBadge, { 
              backgroundColor: nextRide.status === 'EM_ANDAMENTO' ? '#4CAF50' : '#FF9800'
            }]}>
              <Text style={styles.statusText}>
                {nextRide.status === 'EM_ANDAMENTO' ? 'EM ANDAMENTO' : 'AGENDADA'}
              </Text>
            </View>
            
            <Text style={styles.rideInfo}>
              <Text style={styles.rideInfoLabel}>Destino: </Text>
              {nextRide.pontoDestino}
            </Text>
            
            <Text style={styles.rideInfo}>
              <Text style={styles.rideInfoLabel}>Horário: </Text>
              {formatRideTime(nextRide.dataHoraPartida)}
            </Text>
            
            <Text style={styles.rideInfo}>
              <Text style={styles.rideInfoLabel}>Origem: </Text>
              {nextRide.pontoPartida}
            </Text>

            {nextRide.passageiros && nextRide.passageiros.length > 0 && (
              <Text style={styles.rideInfo}>
                <Text style={styles.rideInfoLabel}>Passageiros: </Text>
                {nextRide.passageiros.length} confirmado(s)
              </Text>
            )}

            <Text style={styles.rideInfo}>
              <Text style={styles.rideInfoLabel}>Vagas disponíveis: </Text>
              {nextRide.vagasDisponiveis} de {nextRide.vagas}
            </Text>

            {nextRide.observacoes && (
              <Text style={styles.rideInfo}>
                <Text style={styles.rideInfoLabel}>Observações: </Text>
                {nextRide.observacoes}
              </Text>
            )}

            <View style={styles.rideTimeInfo}>
              <Text style={styles.rideTimeText}>
                {nextRide.status === 'EM_ANDAMENTO' 
                  ? (isDriver ? 'Carona em andamento' : 'Você está em uma carona')
                  : (isDriver ? 'Próxima carona agendada' : 'Próxima carona confirmada')
                }
              </Text>
            </View>

            <TouchableOpacity
                style={styles.startRideButton}
                onPress={() => handleViewRideDetails(nextRide)}
              >
              <Ionicons name="eye" size={18} color="#fff" style={{ marginRight: 8 }} />
              <Text style={styles.startRideButtonText}>Ver Detalhes</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Message when no upcoming rides */}
        {!loading && isDriver && !nextRide && (
          <View style={styles.noRideCard}>
            <Ionicons name="calendar-outline" size={32} color={COLORS.text.secondary} />
            <Text style={styles.noRideTitle}>Nenhuma carona agendada</Text>
            <Text style={styles.noRideText}>
              Você não tem caronas agendadas no momento.
            </Text>
          </View>
        )}

        {/* Message for non-drivers with no active rides */}
        {!loading && !isDriver && !nextRide && (
          <View style={styles.noRideCard}>
            <Ionicons name="car-outline" size={32} color={COLORS.text.secondary} />
            <Text style={styles.noRideTitle}>Modo Passageiro</Text>
            <Text style={styles.noRideText}>
              Você não tem caronas ativas no momento. Busque caronas disponíveis na seção de caronas.
            </Text>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  header: {
    paddingVertical: SPACING.lg,
    paddingHorizontal: SPACING.lg,
    paddingBottom: SPACING.xl,
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  headerButtons: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  logoutButton: {
    marginRight: SPACING.md,
  },
  profileButton: {
    width: 42,
    height: 42,
    borderRadius: 21,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
  },
  userImage: {
    width: 42,
    height: 42,
    borderRadius: 21,
  },
  welcomeText: {
    fontSize: FONT_SIZE.md,
    color: 'rgba(255, 255, 255, 0.8)',
    marginBottom: 4,
  },
  userName: {
    fontSize: FONT_SIZE.lg,
    fontWeight: 'bold',
    color: '#fff',
  },
  content: {
    flex: 1,
    marginTop: -20,
    backgroundColor: '#f8f9fa',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },
  contentContainer: {
    padding: SPACING.lg,
    paddingBottom: 100,
  },
  quickActions: {
    marginBottom: SPACING.xl,
  },
  sectionTitle: {
    fontSize: FONT_SIZE.md,
    fontWeight: 'bold',
    color: COLORS.text.primary,
    marginBottom: SPACING.md,
  },
  actionButtonsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  actionButton: {
    width: '48%',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: SPACING.md,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  actionIconContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  actionButtonText: {
    fontSize: FONT_SIZE.md,
    fontWeight: '500',
    color: COLORS.text.primary,
  },
  loadingCard: {
    backgroundColor: '#fff',
    padding: SPACING.lg,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  rideCard: {
    backgroundColor: '#fff',
    padding: SPACING.lg,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
    borderLeftWidth: 4,
    borderLeftColor: COLORS.primary.main,
  },
  rideHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  rideTitle: {
    fontSize: FONT_SIZE.lg,
    fontWeight: 'bold',
    color: COLORS.text.primary,
    marginLeft: SPACING.sm,
  },
  rideInfo: {
    fontSize: FONT_SIZE.md,
    color: COLORS.text.secondary,
    marginBottom: SPACING.sm,
  },
  rideInfoLabel: {
    fontWeight: '600',
    color: COLORS.text.primary,
  },
  rideTimeInfo: {
    backgroundColor: `${COLORS.primary.main}15`,
    padding: SPACING.sm,
    borderRadius: 8,
    marginTop: SPACING.sm,
    marginBottom: SPACING.md,
  },
  rideTimeText: {
    fontSize: FONT_SIZE.sm,
    color: COLORS.primary.main,
    fontWeight: '600',
    textAlign: 'center',
  },
  startRideButton: {
    marginTop: SPACING.sm,
    backgroundColor: COLORS.primary.main,
    paddingVertical: SPACING.md,
    borderRadius: 8,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
  },
  startRideButtonText: {
    color: '#fff',
    fontSize: FONT_SIZE.md,
    fontWeight: 'bold',
  },
  noRideCard: {
    backgroundColor: '#fff',
    padding: SPACING.xl,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  noRideTitle: {
    fontSize: FONT_SIZE.lg,
    fontWeight: 'bold',
    color: COLORS.text.primary,
    marginTop: SPACING.md,
    marginBottom: SPACING.sm,
  },
  noRideText: {
    fontSize: FONT_SIZE.md,
    color: COLORS.text.secondary,
    textAlign: 'center',
    lineHeight: 22,
  },
  statusBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: SPACING.sm,
    paddingVertical: 4,
    borderRadius: 12,
    marginBottom: SPACING.md,
  },
  statusText: {
    fontSize: FONT_SIZE.xs,
    fontWeight: 'bold',
    color: '#fff',
  },
});

export default HomePage;