import React, { useState } from 'react';
import { Alert, FlatList, StyleSheet, View, RefreshControl, TouchableOpacity, Text, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

import { COLORS, SPACING, FONT_SIZE, FONT_WEIGHT } from '../constants';
import { LoadingIndicator } from '../components/ui';
import ScheduledRideCard from '../components/ui/ScheduledRide/ScheduledRideCard';
import EmptyRidesState from '../components/ui/ScheduledRide/EmptyRidesState';
import { apiClient } from '../services/api/apiClient';
import { useAuthContext } from '../contexts/AuthContext';
import { commonStyles } from '../theme/styles/commonStyles';

const ScheduledRides = ({ navigation, route }) => {
  const { rides = [], driverDetails } = route.params || {}; // Add fallback for missing route.params
  const { authToken } = useAuthContext();
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [scheduledRides, setScheduledRides] = useState(rides || []);

  // Format date for display - expects backend-formatted date strings
  const formatDisplayDate = (isoDateString) => {
    if (!isoDateString) return 'Data não disponível';
    
    try {
      // Backend should send ISO format like "2025-05-26T14:30:00"
      const date = new Date(isoDateString);
      if (isNaN(date.getTime())) {
        console.warn('Invalid date received from backend:', isoDateString);
        return 'Data inválida';
      }
      
      // Simple formatting using built-in methods
      return date.toLocaleDateString('pt-BR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
      }) + ' às ' + date.toLocaleTimeString('pt-BR', {
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (error) {
      console.error('Error formatting date:', error);
      return 'Data inválida';
    }
  };

  // Refresh rides list
  const onRefresh = async () => {
    if (!driverDetails?.id || !authToken) {
      console.log('Cannot refresh rides: missing driver details or auth token');
      setRefreshing(false);
      return;
    }
    
    setRefreshing(true);
    try {
      const response = await apiClient.get(`/carona/motorista/${driverDetails.id}/proximas`, {
        headers: { 'Authorization': `Bearer ${authToken}` }
      });
      
      if (response.success && response.data) {
        setScheduledRides(response.data);
      } else {
        console.warn('Failed to refresh rides:', response.error);
      }
    } catch (error) {
      console.error('Error refreshing rides:', error);
      // Only show alert if we expect the user to be a driver
      if (driverDetails?.id) {
        Alert.alert('Erro', 'Não foi possível atualizar as caronas agendadas.');
      }
    } finally {
      setRefreshing(false);
    }
  };

  // Cancel a scheduled ride
  const handleCancelRide = async (ride) => {
    Alert.alert(
      'Cancelar carona',
      `Tem certeza que deseja cancelar a carona do dia ${formatDisplayDate(ride.dataHoraPartida)}?`,
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
    // If the ride has any confirmed passengers, open in view-only mode
    const hasPassengers = Array.isArray(ride.pedidosEntrada)
      ? ride.pedidosEntrada.some(p => p.status === 'APROVADO')
      : false;
    navigation.navigate('EditRide', { 
      rideId: ride.id,
      ride: ride,
      driverDetails: driverDetails,
      viewOnly: hasPassengers, // Pass viewOnly flag
      onUpdate: (updatedRide) => {
        // Update the local state with the edited ride
        const updatedRides = scheduledRides.map(r => 
          r.id === updatedRide.id ? updatedRide : r
        );
        setScheduledRides(updatedRides);
      }
    });
  };

  // Navigate to ride management
  const handleManageRide = (ride) => {
    navigation.navigate('ManagePassengersHome', { 
      rideId: ride.id, 
      ride: ride 
    });
  };

  // Navigate to offer ride screen
  const handleOfferRide = () => {
    navigation.navigate('RegisterRide', {
      carAvailableSeats: driverDetails?.carro?.capacidadePassageiros,
    });
  };

  if (loading) {
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
        <View style={{ paddingHorizontal: SPACING.lg, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
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
          <TouchableOpacity 
            onPress={handleOfferRide}
            style={styles.addButton}
          >
            <Ionicons name="add" size={24} color={COLORS.text.light} />
          </TouchableOpacity>
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
          <Text style={styles.title}>Suas Caronas Agendadas</Text>
          <Text style={styles.subtitle}>
            {scheduledRides.length > 0 
              ? `Você tem ${scheduledRides.length} carona${scheduledRides.length === 1 ? '' : 's'} agendada${scheduledRides.length === 1 ? '' : 's'}` 
              : 'Você não tem caronas agendadas'}
          </Text>
        </View>

        <View style={{ paddingHorizontal: SPACING.lg }}>
          {scheduledRides.length > 0 ? (
            scheduledRides.map((item) => (
              <ScheduledRideCard 
                key={item.id}
                item={item}
                onManage={handleManageRide}
                onEdit={handleEditRide}
                onCancel={handleCancelRide}
                formatDisplayDate={formatDisplayDate}
              />
            ))
          ) : (
            <EmptyRidesState onOfferRide={handleOfferRide} />
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
  addButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default ScheduledRides;