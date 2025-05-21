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

  // Fetch ride requests made by the user
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

  // Cancel a ride request
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
              const response = await apiClient.delete(`/solicitacao_carona/${requestId}`, {
                headers: {
                  'Authorization': `Bearer ${authToken}`,
                  'Content-Type': 'application/json'
                }
              });

              if (response.success) {
                Alert.alert('Sucesso', 'Solicitação de carona cancelada com sucesso!');
                // Refresh the list
                fetchRideRequests();
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
  }, [authToken, fetchRideRequests]);

  // Handle refresh when user pulls down
  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchRideRequests();
  }, [fetchRideRequests]);

  // Fetch ride requests on mount
  useEffect(() => {
    fetchRideRequests();
  }, [fetchRideRequests]);

  // Refresh when screen comes into focus
  useFocusEffect(
    useCallback(() => {
      fetchRideRequests();
      return () => {
        // No cleanup needed
      };
    }, [fetchRideRequests])
  );

  // Helper function to get status badge color and text
  const getStatusInfo = (status) => {
    switch (status?.toLowerCase()) {
      case 'pendente':
        return { color: COLORS.warning, text: 'Pendente' };
      case 'aceito':
        return { color: COLORS.success, text: 'Aceito' };
      case 'recusado':
        return { color: COLORS.danger, text: 'Recusado' };
      case 'cancelado':
        return { color: COLORS.danger, text: 'Cancelado' };
      default:
        return { color: COLORS.secondary, text: status || 'Desconhecido' };
    }
  };

  // Format date to display
  const formatDate = (dateString) => {
    try {
      if (!dateString) return 'Data não disponível';
      const date = new Date(dateString);
      return format(date, "dd 'de' MMMM 'às' HH:mm", { locale: ptBR });
    } catch (error) {
      console.error('Error formatting date:', error);
      return dateString || 'Data não disponível';
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
        colors={[COLORS.primary, COLORS.primaryDark]}
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
            colors={[COLORS.primary]}
            tintColor={COLORS.primary}
          />
        }
      >
        <View style={[commonStyles.profileCard, {
          marginHorizontal: SPACING.lg,
          paddingVertical: SPACING.lg,
          marginBottom: SPACING.lg,
          alignItems: 'center'
        }]}>
          <Text style={styles.title}>Suas Solicitações de Carona</Text>
          <Text style={styles.subtitle}>
            {rideRequests.length > 0 
              ? `Você tem ${rideRequests.length} solicitação(ões)` 
              : 'Você não tem solicitações de carona'}
          </Text>
        </View>

        <View style={{ paddingHorizontal: SPACING.lg }}>
          {rideRequests.length === 0 ? (
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
            rideRequests.map((request) => {
              const statusInfo = getStatusInfo(request.status);
              const canCancel = request.status?.toLowerCase() === 'pendente';
              
              return (
                <View key={request.id} style={styles.requestCard}>
                  <View style={styles.cardHeader}>
                    <View style={[styles.statusBadge, { backgroundColor: statusInfo.color }]}>
                      <Text style={styles.statusText}>{statusInfo.text}</Text>
                    </View>
                    <Text style={styles.dateText}>
                      {formatDate(request.carona?.dataHora)}
                    </Text>
                  </View>
                  
                  <View style={styles.routeContainer}>
                    <View style={styles.locationRow}>
                      <Ionicons name="location" size={20} color={COLORS.primary} />
                      <Text style={styles.locationText}>
                        {request.carona?.origem || 'Origem não especificada'}
                      </Text>
                    </View>
                    <View style={styles.verticalLine} />
                    <View style={styles.locationRow}>
                      <Ionicons name="location" size={20} color={COLORS.secondary} />
                      <Text style={styles.locationText}>
                        {request.carona?.destino || 'Destino não especificado'}
                      </Text>
                    </View>
                  </View>
                  
                  <View style={styles.driverInfo}>
                    <Ionicons name="person-circle-outline" size={24} color={COLORS.text.secondary} />
                    <Text style={styles.driverName}>
                      {request.carona?.motorista?.nome || 'Motorista não especificado'}
                    </Text>
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
  requestCard: {
    backgroundColor: COLORS.background.white,
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
    backgroundColor: COLORS.border,
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
    borderTopColor: COLORS.border,
  },
  driverName: {
    marginLeft: SPACING.sm,
    fontSize: FONT_SIZE.md,
    fontWeight: FONT_WEIGHT.medium,
    color: COLORS.text.primary,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: SPACING.xl,
    backgroundColor: COLORS.background.light,
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
    backgroundColor: COLORS.primary,
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