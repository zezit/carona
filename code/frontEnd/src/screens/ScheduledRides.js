import React, { useState } from 'react';
import { Alert, FlatList, StyleSheet, Text, TouchableOpacity, View, Platform } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import dayjs from 'dayjs';

import { COLORS, FONT_SIZE, FONT_WEIGHT, SPACING, RADIUS } from '../constants';
import { commonStyles } from '../theme/styles/commonStyles';
import { LoadingIndicator } from '../components/ui';
import { apiClient } from '../services/api/apiClient';
import { useAuthContext } from '../contexts/AuthContext';

const ScheduledRides = ({ navigation, route }) => {
  const { rides = [], driverDetails } = route.params;
  const { authToken } = useAuthContext();
  const [loading, setLoading] = useState(false);
  const [scheduledRides, setScheduledRides] = useState(rides || []);

  // Format date for display
  const formatDate = (dateArray) => {
    if (!dateArray) return 'Data não definida';
    if (Array.isArray(dateArray)) {
      const [year, month, day, hour, minute] = dateArray;
      const dateString = `${year}-${month}-${day}T${hour}:${minute}:00`;
      return dayjs(dateString).format('DD/MM/YYYY HH:mm');
    }
    return dayjs(dateArray).format('DD/MM/YYYY HH:mm');
  };

  // Cancel a scheduled ride
  const handleCancelRide = async (ride) => {
    Alert.alert(
      'Cancelar carona',
      `Tem certeza que deseja cancelar a carona do dia ${formatDate(ride.dataHoraPartida)}?`,
      [
        { text: 'Não', style: 'cancel' },
        {
          text: 'Sim',
          style: 'destructive',
          onPress: async () => {
            setLoading(true);
            try {
              const response = await apiClient.delete(`/carona/${ride.id}`, {
                headers: {
                  'Authorization': `Bearer ${authToken}`,
                  'Content-Type': 'application/json'
                }
              });

              if (response.success) {
                // Remove the cancelled ride from local state
                setScheduledRides(
                  scheduledRides.filter((item) => item.id !== ride.id)
                );
                Alert.alert('Sucesso', 'Carona cancelada com sucesso');
              } else {
                Alert.alert('Erro', response.error?.message || 'Não foi possível cancelar a carona');
              }
            } catch (error) {
              console.error('Error cancelling ride:', error);
              Alert.alert('Erro', 'Ocorreu um erro ao cancelar a carona');
            } finally {
              setLoading(false);
            }
          }
        }
      ]
    );
  };

  // Edit a scheduled ride
  const handleEditRide = (ride) => {
    navigation.navigate('EditRide', { 
      rideId: ride.id,
      ride: ride,
      driverDetails: driverDetails,
      onUpdate: (updatedRide) => {
        // Update the local state with the edited ride
        const updatedRides = scheduledRides.map(r => 
          r.id === updatedRide.id ? updatedRide : r
        );
        setScheduledRides(updatedRides);
      }
    });
  };

  // Render a ride item
  const renderRideItem = ({ item }) => {
    const passengersCount = item.passageiros ? item.passageiros.length : 0;
    
    return (
      <View style={styles.rideCard}>
        <View style={styles.rideDateContainer}>
          <Ionicons name="calendar" size={20} color={COLORS.primary} />
          <Text style={styles.rideDate}>
            {formatDate(item.dataHoraPartida)}
          </Text>
        </View>

        <View style={styles.rideInfoRow}>
          <Ionicons name="location" size={18} color={COLORS.secondary} style={styles.infoIcon} />
          <View style={styles.infoTextContainer}>
            <Text style={styles.infoLabel}>Partida:</Text>
            <Text style={styles.infoValue} numberOfLines={2}>
              {item.pontoPartida || 'Não definido'}
            </Text>
          </View>
        </View>

        <View style={styles.rideInfoRow}>
          <Ionicons name="flag" size={18} color={COLORS.secondary} style={styles.infoIcon} />
          <View style={styles.infoTextContainer}>
            <Text style={styles.infoLabel}>Destino:</Text>
            <Text style={styles.infoValue} numberOfLines={2}>
              {item.pontoDestino || 'Não definido'}
            </Text>
          </View>
        </View>

        <View style={styles.rideInfoRow}>
          <Ionicons name="people" size={18} color={COLORS.secondary} style={styles.infoIcon} />
          <View style={styles.infoTextContainer}>
            <Text style={styles.infoLabel}>Passageiros:</Text>
            <Text style={styles.infoValue}>
              {`${passengersCount} / ${item.vagas}`}
            </Text>
          </View>
        </View>

        {item.observacoes && (
          <View style={styles.rideInfoRow}>
            <Ionicons name="information-circle" size={18} color={COLORS.secondary} style={styles.infoIcon} />
            <View style={styles.infoTextContainer}>
              <Text style={styles.infoLabel}>Observações:</Text>
              <Text style={styles.infoValue} numberOfLines={2}>
                {item.observacoes}
              </Text>
            </View>
          </View>
        )}

        <View style={styles.actionsContainer}>
          <TouchableOpacity 
            style={[styles.actionButton, styles.editButton]} 
            onPress={() => handleEditRide(item)}
          >
            <Ionicons name="create-outline" size={20} color={COLORS.text.light} />
            <Text style={styles.actionButtonText}>Editar</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={[styles.actionButton, styles.cancelButton]} 
            onPress={() => handleCancelRide(item)}
          >
            <Ionicons name="close-outline" size={20} color={COLORS.text.light} />
            <Text style={styles.actionButtonText}>Cancelar</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  if (loading) {
    return (
      <View style={[commonStyles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <LoadingIndicator text="Processando..." />
      </View>
    );
  }

  return (
    <SafeAreaView style={commonStyles.container}>
      <LinearGradient
        colors={[COLORS.primary, COLORS.primaryDark]}
        start={{ x: 0, y: 0 }}
        end={{ x: 0, y: 0.5 }}
        style={styles.headerGradient}
      >
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color={COLORS.text.light} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Caronas Agendadas</Text>
          <View style={{width: 24}} />
        </View>
      </LinearGradient>

      <View style={styles.contentContainer}>
        {scheduledRides.length > 0 ? (
          <FlatList
            data={scheduledRides}
            renderItem={renderRideItem}
            keyExtractor={(item) => item.id.toString()}
            contentContainerStyle={styles.listContainer}
            showsVerticalScrollIndicator={false}
          />
        ) : (
          <View style={styles.emptyContainer}>
            <Ionicons name="calendar-outline" size={64} color={COLORS.gray} />
            <Text style={styles.emptyText}>Nenhuma carona agendada</Text>
            <TouchableOpacity 
              style={styles.offerRideButton}
              onPress={() => navigation.navigate('RegisterRide', {
                carAvailableSeats: driverDetails?.carro?.capacidadePassageiros,
              })}
            >
              <Text style={styles.offerRideButtonText}>Oferecer Nova Carona</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  headerGradient: {
    height: 150,
    width: '100%',
    paddingTop: SPACING.lg,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.lg,
    paddingTop: SPACING.md,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: FONT_SIZE.xl,
    fontWeight: FONT_WEIGHT.bold,
    color: COLORS.text.light,
  },
  contentContainer: {
    flex: 1,
    marginTop: -20,
    backgroundColor: COLORS.background,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingTop: SPACING.md,
  },
  listContainer: {
    padding: SPACING.md,
  },
  rideCard: {
    backgroundColor: COLORS.card,
    borderRadius: RADIUS.md,
    padding: SPACING.md,
    marginBottom: SPACING.md,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
      },
      android: {
        elevation: 3,
      },
    }),
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  rideDateContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.sm,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
    paddingBottom: SPACING.sm,
  },
  rideDate: {
    marginLeft: SPACING.sm,
    fontSize: FONT_SIZE.md,
    fontWeight: FONT_WEIGHT.bold,
    color: COLORS.primary,
  },
  rideInfoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: SPACING.xs,
  },
  infoIcon: {
    marginRight: SPACING.sm,
    width: 24,
    alignItems: 'center',
  },
  infoTextContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
  },
  infoLabel: {
    fontSize: FONT_SIZE.sm,
    fontWeight: FONT_WEIGHT.bold,
    color: COLORS.text.secondary,
    marginRight: SPACING.xs,
  },
  infoValue: {
    flex: 1,
    fontSize: FONT_SIZE.sm,
    color: COLORS.text.primary,
  },
  actionsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: SPACING.md,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    paddingTop: SPACING.sm,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: RADIUS.md,
    padding: SPACING.sm,
    flex: 0.48,
  },
  editButton: {
    backgroundColor: COLORS.secondary,
  },
  cancelButton: {
    backgroundColor: COLORS.danger,
  },
  actionButtonText: {
    color: COLORS.text.light,
    fontWeight: FONT_WEIGHT.bold,
    marginLeft: SPACING.xs,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: SPACING.xl,
  },
  emptyText: {
    fontSize: FONT_SIZE.lg,
    color: COLORS.text.secondary,
    marginTop: SPACING.md,
    marginBottom: SPACING.lg,
  },
  offerRideButton: {
    backgroundColor: COLORS.primary,
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.lg,
    borderRadius: RADIUS.md,
  },
  offerRideButtonText: {
    color: COLORS.text.light,
    fontWeight: FONT_WEIGHT.bold,
  },
});

export default ScheduledRides;