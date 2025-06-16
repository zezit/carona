import React, { useCallback, useEffect, useState } from 'react';
import { Alert, StyleSheet, Text, View, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { COLORS, FONT_SIZE, FONT_WEIGHT, SPACING } from '../constants';
import { useAuthContext } from '../contexts/AuthContext';
import { useFocusEffect } from '@react-navigation/native';
import { apiClient } from '../services/api/apiClient';
import { commonStyles } from '../theme/styles/commonStyles';
import { LoadingIndicator } from '../components/ui';
import { TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { ScrollView } from 'react-native-gesture-handler';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

const MyRideRequestsPage = ({ navigation }) => {
  const { user, authToken } = useAuthContext();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [rideRequests, setRideRequests] = useState([]);
  const [driverRequests, setDriverRequests] = useState([]);
  const [viewMode, setViewMode] = useState('passenger'); // 'passenger' or 'driver'
  const [isDriver, setIsDriver] = useState(false);
  const [driverDetails, setDriverDetails] = useState(null);

  // Check if user is a driver
  const checkDriverStatus = useCallback(async () => {
    if (!user?.id || !authToken) return;
    
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
        console.log('User is a driver:', response.data);
      } else {
        setIsDriver(false);
        setDriverDetails(null);
        console.log('User is not a driver');
      }
    } catch (error) {
      // 404 error means user is not a driver, which is expected
      if (error.status === 404 || error.body?.codigo === 'comum.cliente.entidade_nao_encontrada') {
        console.log('User is not a driver (404 response)');
        setIsDriver(false);
        setDriverDetails(null);
      } else {
        console.error('Error checking driver status:', error);
        setIsDriver(false);
        setDriverDetails(null);
      }
    }
  }, [user?.id, authToken]);

  // Fetch ride requests made by the user as a passenger
  const fetchRideRequests = useCallback(async () => {
    if (!user?.id || !authToken) {
      console.error('User ID or auth token is missing');
      return;
    }

    try {
      setLoading(true);
      const response = await apiClient.get(`/solicitacao_carona/estudante/${user.id}`, {
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Accept': '*/*',
          'Content-Type': 'application/json'
        }
      });

      if (response.success && response.data) {
        console.debug('Ride requests response:', JSON.stringify(response.data, null, 2));
        setRideRequests(response.data);
      } else {
        console.warn('Failed to fetch ride requests:', response.error);
        setRideRequests([]);
      }
    } catch (error) {
      console.error('Error fetching ride requests:', error);
      Alert.alert(
        'Erro',
        'Não foi possível carregar suas solicitações de carona. Tente novamente mais tarde.'
      );
      setRideRequests([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [user?.id, authToken]);

  // Fetch ride requests received by the user as a driver
  const fetchDriverRequests = useCallback(async () => {
    if (!user?.id || !authToken || !driverDetails?.id) {
      console.log('Cannot fetch driver requests: missing user ID, auth token, or driver details');
      setDriverRequests([]);
      setLoading(false);
      setRefreshing(false);
      return;
    }

    try {
      setLoading(true);
      const response = await apiClient.get(`/pedidos/motorista/${driverDetails.id}`, {
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Accept': '*/*',
          'Content-Type': 'application/json'
        }
      });

      if (response.success && response.data) {
        console.debug('Driver requests response:', JSON.stringify(response.data, null, 2));
        setDriverRequests(response.data);
      } else {
        console.warn('Failed to fetch driver requests:', response.error);
        setDriverRequests([]);
      }
    } catch (error) {
      console.error('Error fetching driver requests:', error);
      // Don't show alert for driver-related errors if user is not confirmed as driver
      if (isDriver) {
        Alert.alert(
          'Erro',
          'Não foi possível carregar as solicitações recebidas. Tente novamente mais tarde.'
        );
      }
      setDriverRequests([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [user?.id, authToken, driverDetails?.id, isDriver]);

  // Fetch requests based on current view mode
  const fetchRequests = useCallback(async () => {
    if (viewMode === 'passenger') {
      await fetchRideRequests();
    } else if (viewMode === 'driver' && isDriver) {
      await fetchDriverRequests();
    }
  }, [viewMode, isDriver, fetchRideRequests, fetchDriverRequests]);

  // Cancel a ride request (for passenger requests only)
  const handleCancelRequest = useCallback(async (requestId) => {
    Alert.alert(
      'Cancelar Solicitação',
      'Tem certeza que deseja cancelar esta solicitação de carona?',
      [
        { text: 'Não', style: 'cancel' },
        {
          text: 'Sim',
          onPress: async () => {
            try {
              setLoading(true);
              const response = await apiClient.put(`/solicitacao_carona/${requestId}/cancelar`, {
                headers: {
                  'Authorization': `Bearer ${authToken}`,
                  'Content-Type': 'application/json'
                }
              });

              if (response.success) {
                Alert.alert('Sucesso', 'Solicitação de carona cancelada com sucesso!');
                // Refresh the list
                fetchRequests();
              } else {
                console.warn('Failed to cancel ride request:', response.error);
                Alert.alert(
                  'Erro',
                  'Não foi possível cancelar sua solicitação. Tente novamente mais tarde.'
                );
              }
            } catch (error) {
              console.error('Error canceling ride request:', error);
              Alert.alert(
                'Erro',
                'Ocorreu um erro ao cancelar sua solicitação. Tente novamente mais tarde.'
              );
            } finally {
              setLoading(false);
            }
          }
        }
      ]
    );
  }, [authToken, fetchRequests]);

  // Handle driver request actions (approve/reject)
  const handleDriverRequestAction = useCallback(async (requestId, action) => {
    try {
      setLoading(true);
      const response = await apiClient.put(`/pedidos/${requestId}/status/${action}`, null, {
        headers: {
          'Authorization': `Bearer ${authToken}`,
        }
      });

      if (response.success) {
        const actionText = action === 'APROVADO' ? 'aprovada' : 'recusada';
        Alert.alert('Sucesso', `Solicitação ${actionText} com sucesso!`);
        // Refresh the list
        fetchRequests();
      } else {
        const errorMessage = response.error?.message || 
          `Não foi possível ${action === 'APROVADO' ? 'aprovar' : 'recusar'} a solicitação.`;
        Alert.alert('Erro', errorMessage);
      }
    } catch (error) {
      console.error(`Error ${action} request:`, error);
      const errorMessage = `Não foi possível ${action === 'APROVADO' ? 'aprovar' : 'recusar'} a solicitação.`;
      Alert.alert('Erro', errorMessage);
    } finally {
      setLoading(false);
    }
  }, [authToken, fetchRequests]);

  // Handle refresh when user pulls down
  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchRequests();
  }, [fetchRequests]);

  // Check driver status on mount
  useEffect(() => {
    checkDriverStatus();
  }, [checkDriverStatus]);

  // Fetch requests on mount and when view mode changes
  useEffect(() => {
    if (viewMode === 'driver' && !isDriver) {
      // If switching to driver mode but user is not a driver, switch back to passenger
      console.log('Switching back to passenger mode - user is not a driver');
      setViewMode('passenger');
      return;
    }
    
    // Only fetch requests after driver status has been checked
    if (viewMode === 'passenger' || (viewMode === 'driver' && isDriver && driverDetails)) {
      fetchRequests();
    }
  }, [viewMode, isDriver, driverDetails, fetchRequests]);

  // Refresh when screen comes into focus
  useFocusEffect(
    useCallback(() => {
      const loadData = async () => {
        await checkDriverStatus();
        // Wait a bit for state to update, then fetch requests
        setTimeout(() => {
          fetchRequests();
        }, 100);
      };
      
      loadData();
      
      return () => {
        // No cleanup needed
      };
    }, [checkDriverStatus, fetchRequests])
  );

  // Switch view mode
  const switchViewMode = useCallback((mode) => {
    if (mode === 'driver' && !isDriver) {
      Alert.alert(
        'Acesso Negado',
        'Você precisa ser um motorista para ver as solicitações recebidas.'
      );
      return;
    }
    setViewMode(mode);
  }, [isDriver]);

  // Helper function to get status badge color and text
  const getStatusInfo = (status) => {
    switch (status?.toLowerCase()) {
      case 'pendente':
        return { color: COLORS.warning.main, text: 'Pendente' };
      case 'aceito':
        return { color: COLORS.success.main, text: 'Aceito' };
      case 'recusado':
        return { color: COLORS.danger, text: 'Recusado' };
      case 'cancelado':
        return { color: COLORS.danger, text: 'Cancelado' };
      default:
        return { color: COLORS.secondary.main, text: status || 'Desconhecido' };
    }
  };

  // Format date to display
  const formatDate = (dateArray) => {
  try {
    if (!dateArray || !Array.isArray(dateArray)) return 'Data não disponível';

    const [ano, mes, dia, hora, minuto, segundo] = dateArray;

    const date = new Date(ano, mes - 1, dia , hora, minuto, segundo);

    const diaFormatado = String(date.getDate()).padStart(2, '0');
    const mesFormatado = String(date.getMonth() + 1).padStart(2, '0');
    const anoFormatado = String(date.getFullYear()).slice(-2);

    const horaFormatada = String(date.getHours()).padStart(2, '0');
    const minutoFormatado = String(date.getMinutes()).padStart(2, '0');

    return `${diaFormatado}/${mesFormatado}/${anoFormatado} às ${horaFormatada}:${minutoFormatado}`;
  } catch (error) {
    console.error('Error formatting date:', error);
    return 'Data não disponível';
  }
};

  if (loading && !refreshing) {
    return (
      <SafeAreaView style={commonStyles.container}>
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <LoadingIndicator text="Carregando suas solicitações..." />
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
            Minhas Solicitações
          </Text>
        </View>
      </LinearGradient>

      <ScrollView
        style={{ flex: 1, marginTop: -50 }}
        contentContainerStyle={{ paddingBottom: 40 }}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[COLORS.primary.main]}
            tintColor={COLORS.primary.main}
          />
        }
      >
        <View style={[commonStyles.profileCard, {
          marginHorizontal: SPACING.lg,
          paddingVertical: SPACING.lg,
          marginBottom: SPACING.lg,
          alignItems: 'center'
        }]}>
          <Text style={styles.title}>
            {viewMode === 'passenger' ? 'Suas Solicitações de Carona' : 'Solicitações Recebidas'}
          </Text>
          <Text style={styles.subtitle}>
            {viewMode === 'passenger' 
              ? (rideRequests.length > 0 
                  ? `Você tem ${rideRequests.length} solicitação(ões)` 
                  : 'Você não tem solicitações de carona')
              : (driverRequests.length > 0 
                  ? `Você recebeu ${driverRequests.length} solicitação(ões)` 
                  : 'Você não recebeu solicitações de carona')
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
                onPress={() => switchViewMode('passenger')}
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
                onPress={() => switchViewMode('driver')}
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
            rideRequests.length === 0 ? (
              <View style={styles.emptyContainer}>
                <Ionicons name="car-outline" size={48} color={COLORS.text.secondary} />
                <Text style={styles.emptyText}>
                  Você ainda não solicitou nenhuma carona.
                </Text>
                <TouchableOpacity
                  style={[styles.button, { marginTop: SPACING.md }]}
                  onPress={() => navigation.navigate('FindRides')}
                >
                  <Text style={styles.buttonText}>Buscar Caronas</Text>
                </TouchableOpacity>
              </View>
            ) : (
              rideRequests.slice().reverse().map((request) => {
              const statusInfo = getStatusInfo(request.status);
              const canCancel = request.status?.toLowerCase() === 'pendente';
              console.log("REQUEST::",request)
              return (
                <View key={request.id} style={styles.requestCard}>
                  <View style={styles.cardHeader}>
                    <View style={[styles.statusBadge, { backgroundColor: statusInfo.color }]}>
                      <Text style={styles.statusText}>{statusInfo.text}</Text>
                    </View>
                    <Text style={styles.dateText}>
                      {formatDate(request.horarioChegada)}
                    </Text>
                  </View>
                  
                  <View style={styles.routeContainer}>
                    <View style={styles.locationRow}>
                      <Ionicons name="location" size={20} color={COLORS.primary.main} />
                      <Text style={styles.locationText}>
                        {request.origem || 'Origem não especificada'}
                      </Text>
                    </View>
                    <View style={styles.verticalLine} />
                    <View style={styles.locationRow}>
                      <Ionicons name="location" size={20} color={COLORS.secondary.main} />
                      <Text style={styles.locationText}>
                        {request.destino || 'Destino não especificado'}
                      </Text>
                    </View>
                  </View>
                  
                 
                  
                  {canCancel && (
                    <TouchableOpacity
                      style={[styles.outlineButton, { marginTop: SPACING.sm }]}
                      onPress={() => handleCancelRequest(request.id)}
                    >
                      <Ionicons name="close-circle-outline" size={18} color={COLORS.danger} style={{ marginRight: 5 }} />
                      <Text style={styles.outlineButtonText}>Cancelar Solicitação</Text>
                    </TouchableOpacity>
                  )}
                </View>
              );
            })
          )
          ) : (
            /* Driver view mode */
            driverRequests.length === 0 ? (
              <View style={styles.emptyContainer}>
                <Ionicons name="car-sport-outline" size={48} color={COLORS.text.secondary} />
                <Text style={styles.emptyText}>
                  Você não recebeu nenhuma solicitação de carona ainda.
                </Text>
              </View>
            ) : (
              driverRequests.slice().reverse().map((request) => {
                const statusInfo = getStatusInfo(request.status);
                const canApprove = request.status?.toLowerCase() === 'pendente';
                
                return (
                  <View key={request.id} style={styles.requestCard}>
                    <View style={styles.cardHeader}>
                      <View style={[styles.statusBadge, { backgroundColor: statusInfo.color }]}>
                        <Text style={styles.statusText}>{statusInfo.text}</Text>
                      </View>
                      <Text style={styles.dateText}>
                        {formatDate(request.horarioChegada || request.dataHora)}
                      </Text>
                    </View>
                    
                    {/* Passenger info */}
                    <View style={styles.passengerInfo}>
                      <Ionicons name="person-outline" size={20} color={COLORS.primary.main} />
                      <Text style={styles.passengerName}>
                        {request.estudante?.nome || request.nomePassageiro || 'Nome não disponível'}
                      </Text>
                    </View>
                    
                    <View style={styles.routeContainer}>
                      <View style={styles.locationRow}>
                        <Ionicons name="location" size={20} color={COLORS.primary.main} />
                        <Text style={styles.locationText}>
                          {request.origem || 'Origem não especificada'}
                        </Text>
                      </View>
                      <View style={styles.verticalLine} />
                      <View style={styles.locationRow}>
                        <Ionicons name="location" size={20} color={COLORS.secondary.main} />
                        <Text style={styles.locationText}>
                          {request.destino || 'Destino não especificado'}
                        </Text>
                      </View>
                    </View>
                    
                    {canApprove && (
                      <View style={styles.actionButtonsContainer}>
                        <TouchableOpacity
                          style={[styles.actionButton, styles.approveButton]}
                          onPress={() => handleDriverRequestAction(request.id, 'APROVADO')}
                        >
                          <Ionicons name="checkmark-circle-outline" size={18} color={COLORS.text.light} />
                          <Text style={styles.actionButtonText}>Aprovar</Text>
                        </TouchableOpacity>
                        
                        <TouchableOpacity
                          style={[styles.actionButton, styles.rejectButton]}
                          onPress={() => handleDriverRequestAction(request.id, 'RECUSADO')}
                        >
                          <Ionicons name="close-circle-outline" size={18} color={COLORS.text.light} />
                          <Text style={styles.actionButtonText}>Recusar</Text>
                        </TouchableOpacity>
                      </View>
                    )}
                  </View>
                );
              })
            )
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

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
  requestCard: {
    backgroundColor: COLORS.background.main.white,
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
  driverInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: SPACING.sm,
    marginBottom: SPACING.xs,
    paddingTop: SPACING.sm,
    borderTopWidth: 1,
    borderTopColor: COLORS.border.main,
  },
  driverName: {
    marginLeft: SPACING.sm,
    fontSize: FONT_SIZE.md,
    fontWeight: FONT_WEIGHT.medium,
    color: COLORS.text.primary,
  },
  passengerInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.sm,
    paddingBottom: SPACING.sm,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border.main,
  },
  passengerName: {
    marginLeft: SPACING.sm,
    fontSize: FONT_SIZE.md,
    fontWeight: FONT_WEIGHT.medium,
    color: COLORS.text.primary,
  },
  actionButtonsContainer: {
    flexDirection: 'row',
    marginTop: SPACING.md,
    gap: SPACING.sm,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.md,
    borderRadius: 8,
  },
  approveButton: {
    backgroundColor: COLORS.success.main,
  },
  rejectButton: {
    backgroundColor: COLORS.danger,
  },
  actionButtonText: {
    color: COLORS.text.light,
    fontSize: FONT_SIZE.sm,
    fontWeight: FONT_WEIGHT.medium,
    marginLeft: SPACING.xs,
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
  outlineButton: {
    borderWidth: 1,
    borderColor: COLORS.danger,
    borderRadius: 8,
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.md,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
  },
  outlineButtonText: {
    color: COLORS.danger,
    fontSize: FONT_SIZE.md,
    fontWeight: FONT_WEIGHT.medium,
    textAlign: 'center',
  },
});

export default MyRideRequestsPage;