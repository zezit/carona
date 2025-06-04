import { Ionicons } from '@expo/vector-icons';
import React, { useCallback, useEffect, useState } from 'react';
import { Image, ScrollView, StyleSheet, Text, TouchableOpacity, View, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import { useAuthContext } from '../contexts/AuthContext';
import { COLORS, SPACING, FONT_SIZE } from '../constants';
import { LinearGradient } from 'expo-linear-gradient';
import { apiClient, getUpcomingRides } from '../services/api/apiClient';
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
    try {
      const response = await apiClient.get(`/estudante/${user?.id}/motorista`, {
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
        setNextRide(null);
      }
    } catch (error) {
      console.error('Error checking driver status:', error);
      setIsDriver(false);
      setNextRide(null);
    } finally {
      setLoading(false);
    }
  }, [user?.id, authToken]);

  // Fetch upcoming rides and find the next one
  const fetchUpcomingRides = useCallback(async (driverId) => {
    try {
      const response = await getUpcomingRides(driverId, authToken);
      
      if (response.success && response.data && response.data.length > 0) {
        const now = new Date();
        console.log('Current time:', now.toISOString());
        console.log('Current local time:', now.toLocaleString('pt-BR'));
        console.log('Available rides:', response.data.length);
        
        // Find scheduled rides (removed 30-minute restriction)
        const scheduledRides = response.data.filter(ride => {
          // Debug logging
          console.log(`Ride ${ride.id}:`);
          console.log(`  - Original time string: ${ride.dataHoraPartida}`);
          console.log(`  - Status: ${ride.status}`);
          
          const isScheduled = ride.status === 'AGENDADA';
          
          console.log(`  - Is scheduled: ${isScheduled}`);
          console.log(`  - Will include: ${isScheduled}`);
          console.log('---');
          
          return isScheduled;
        });

        console.log('Scheduled rides found:', scheduledRides.length);

        if (scheduledRides.length > 0) {
          // Get the earliest scheduled ride
          const earliestRide = scheduledRides.reduce((earliest, current) => {
            const earliestTime = new Date(earliest.dataHoraPartida);
            const currentTime = new Date(current.dataHoraPartida);
            return currentTime < earliestTime ? current : earliest;
          });
          
          console.log('Selected earliest ride:', earliestRide.id, earliestRide.dataHoraPartida);
          setNextRide(earliestRide);
        } else {
          console.log('No scheduled rides found');
          setNextRide(null);
        }
      } else {
        console.log('No rides in response or response failed');
        setNextRide(null);
      }
    } catch (error) {
      console.error('Error fetching upcoming rides:', error);
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
  const handleStartRide = async (caronaId) => {
    try {
      const response = await apiClient.patch(`/carona/${caronaId}/iniciar`);
      if (response.status === 200) {
        navigation.navigate('CaronaDetailsScreen', {
          carona: response.data, // garanta que a API retorna os campos `origem`, `destino`, `status`, `dataInicio`
        });
      }
    } catch (err) {
      Alert.alert('Erro', 'Não foi possível iniciar a carona.');
    }
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
              <Text style={styles.actionButtonText}>Perfil</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Loading state */}
        {loading && isDriver && (
          <View style={styles.loadingCard}>
            <LoadingIndicator size="small" text="Verificando próximas caronas..." />
          </View>
        )}

        {/* Next ride card - only show if user is driver and has upcoming ride */}
        {!loading && isDriver && nextRide && (
          <View style={styles.rideCard}>
            <View style={styles.rideHeader}>
              <Ionicons name="time" size={20} color={COLORS.primary.main} />
              <Text style={styles.rideTitle}>Carona Agendada</Text>
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
                Próxima carona agendada
              </Text>
            </View>

            <TouchableOpacity
                style={styles.startRideButton}
                onPress={() => handleStartRide(nextRide.id)}
              >
              <Ionicons name="play" size={18} color="#fff" style={{ marginRight: 8 }} />
              <Text style={styles.startRideButtonText}>Iniciar Carona</Text>
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

        {/* Message for non-drivers */}
        {!loading && !isDriver && (
          <View style={styles.noRideCard}>
            <Ionicons name="car-outline" size={32} color={COLORS.text.secondary} />
            <Text style={styles.noRideTitle}>Modo Passageiro</Text>
            <Text style={styles.noRideText}>
              Você pode buscar caronas disponíveis na seção de caronas.
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
});

export default HomePage;